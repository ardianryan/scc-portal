const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const config = require('../config');

const dbDir = process.env.DB_DIR ? path.resolve(process.env.DB_DIR) : path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'portal.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Inisialisasi tabel dari schema.sql (selalu baca dari direktori kode __dirname)
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Auto-migration non-destruktif untuk kolom doc_url dan is_gedeg_verified jika belum ada
try {
  const colCheck = db.prepare("PRAGMA table_info(participants)").all();
  const hasDocUrl = colCheck.some(c => c.name === 'doc_url');
  if (!hasDocUrl) {
    db.exec("ALTER TABLE participants ADD COLUMN doc_url TEXT;");
    console.log("[Database] Migration: Kolom doc_url berhasil ditambahkan ke tabel participants.");
  }

  const hasGedegVerif = colCheck.some(c => c.name === 'is_gedeg_verified');
  if (!hasGedegVerif) {
    db.exec("ALTER TABLE participants ADD COLUMN is_gedeg_verified INTEGER DEFAULT 0;");
    console.log("[Database] Migration: Kolom is_gedeg_verified berhasil ditambahkan ke tabel participants.");
  }

  // Buat tabel email_queue jika belum ada
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT,
      subject TEXT NOT NULL,
      html_content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      last_error TEXT,
      scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Default settings untuk jenjang, cakupan wilayah, dan kuota tim per instansi
  db.exec(`
    INSERT OR IGNORE INTO settings (key, value, description) VALUES
    ('allowed_levels', 'sma_ma,smk', 'Jenjang peserta yang diizinkan'),
    ('competition_scope', 'Se-Gerbangkertosusila (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan)', 'Cakupan wilayah kompetisi'),
    ('max_teams_per_school', '3', 'Maksimal jumlah tim per sekolah/instansi');
  `);
} catch (e) {
  console.error("[Database] Migration column check error:", e.message);
}

// Inisialisasi atau sinkronisasi default admin jika belum ada / disinkronkan dari config
const checkAdmin = db.prepare('SELECT id, password_hash FROM admins WHERE username = ?').get(config.DEFAULT_ADMIN_USER);
if (!checkAdmin) {
  const hash = bcrypt.hashSync(config.DEFAULT_ADMIN_PASS, 10);
  db.prepare('INSERT INTO admins (username, password_hash, name) VALUES (?, ?, ?)')
    .run(config.DEFAULT_ADMIN_USER, hash, 'Administrator SCC::CTF');
  console.log(`[Database] Default admin created: ${config.DEFAULT_ADMIN_USER}`);
} else if (process.env.RESET_ADMIN_PASS === 'true') {
  // Opsi darurat untuk reset password admin dari ENV jika diminta
  const hash = bcrypt.hashSync(config.DEFAULT_ADMIN_PASS, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?')
    .run(hash, config.DEFAULT_ADMIN_USER);
  console.log(`[Database] Admin password reset from environment variable: ${config.DEFAULT_ADMIN_USER}`);
}

// Import Crypto Service untuk Encryption at Rest
const cryptoService = require('../services/cryptoService');

const SENSITIVE_KEYS = ['smtp_pass'];

module.exports = {
  db,
  
  // Helper settings dengan dekripsi otomatis in-memory
  getSettings() {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      if (SENSITIVE_KEYS.includes(row.key)) {
        settings[row.key] = cryptoService.decrypt(row.value);
      } else {
        settings[row.key] = row.value;
      }
    }
    return settings;
  },

  updateSetting(key, value) {
    let finalValue = String(value);
    // Enkripsi field sensitif sebelum ditulis ke disk SQLite
    if (SENSITIVE_KEYS.includes(key) && value && value.trim() !== '') {
      finalValue = cryptoService.encrypt(value);
    }
    return db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, finalValue);
  },

  // Helper peserta & tim
  getParticipantByUsername(username) {
    return db.prepare('SELECT * FROM participants WHERE username_gzctf = ?').get(username);
  },

  getParticipantByEmail(email) {
    return db.prepare('SELECT * FROM participants WHERE email = ?').get(email);
  },

  getParticipantCount() {
    const row = db.prepare('SELECT COUNT(*) as count FROM participants').get();
    return row.count;
  },

  getTeamCount() {
    const row = db.prepare('SELECT COUNT(*) as count FROM teams').get();
    return row.count;
  },

  countTeamsByInstitution(institution) {
    if (!institution) return 0;
    const clean = institution.trim().toLowerCase();
    const row = db.prepare(`
      SELECT COUNT(*) as count 
      FROM teams 
      WHERE LOWER(TRIM(institution)) = ?
    `).get(clean);
    return row ? row.count : 0;
  },

  getAllParticipants() {
    return db.prepare(`
      SELECT p.*, t.team_name 
      FROM participants p 
      LEFT JOIN teams t ON p.team_id = t.id 
      ORDER BY p.id DESC
    `).all();
  },

  getAllTeams() {
    return db.prepare(`
      SELECT t.*, COUNT(p.id) as member_count 
      FROM teams t 
      LEFT JOIN participants p ON t.id = p.team_id 
      GROUP BY t.id 
      ORDER BY t.id DESC
    `).all();
  },

  createIndividualParticipant(data) {
    const stmt = db.prepare(`
      INSERT INTO participants (
        full_name, category, institution, nisn_or_id, class_grade, 
        phone_wa, email, username_gzctf, gzctf_status, gzctf_error, 
        is_team_leader, doc_url, is_gedeg_verified, registration_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    
    return stmt.run(
      data.full_name, data.category, data.institution, data.nisn_or_id || '', 
      data.class_grade || '', data.phone_wa, data.email, data.username_gzctf, 
      data.gzctf_status || 'pending', data.gzctf_error || null, 
      data.doc_url || null, data.is_gedeg_verified || 0, data.registration_ip || ''
    );
  },

  createTeamWithMembers(teamData, leaderData, membersData) {
    // Jalankan transaksi manual
    db.exec('BEGIN TRANSACTION;');
    try {
      const teamStmt = db.prepare(`
        INSERT INTO teams (
          team_name, team_token, institution, category, leader_name, contact_wa, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const teamResult = teamStmt.run(
        teamData.team_name, teamData.team_token, teamData.institution, 
        teamData.category, leaderData.full_name, leaderData.phone_wa, leaderData.email
      );
      const teamId = teamResult.lastInsertRowid;

      // Insert leader (15 kolom dengan doc_url & is_gedeg_verified)
      const partStmt = db.prepare(`
        INSERT INTO participants (
          team_id, full_name, category, institution, nisn_or_id, class_grade, 
          phone_wa, email, username_gzctf, gzctf_status, gzctf_error, 
          is_team_leader, doc_url, is_gedeg_verified, registration_ip
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      partStmt.run(
        teamId, leaderData.full_name, teamData.category, teamData.institution,
        leaderData.nisn_or_id || '', leaderData.class_grade || '', leaderData.phone_wa,
        leaderData.email, leaderData.username_gzctf, leaderData.gzctf_status || 'pending',
        leaderData.gzctf_error || null, 1, leaderData.doc_url || null, 
        leaderData.is_gedeg_verified || 0, leaderData.registration_ip || ''
      );

      // Insert members if any
      if (Array.isArray(membersData)) {
        for (const m of membersData) {
          if (m.full_name && m.email) {
            partStmt.run(
              teamId, m.full_name, teamData.category, teamData.institution,
              m.nisn_or_id || '', m.class_grade || '', m.phone_wa || leaderData.phone_wa,
              m.email, m.username_gzctf || `${leaderData.username_gzctf}_${Math.floor(Math.random()*1000)}`,
              'member_only', null, 0, null, 0, leaderData.registration_ip || ''
            );
          }
        }
      }

      db.exec('COMMIT;');
      return { teamId, success: true };
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  },

  updateParticipantGzStatus(participantId, status, errorMsg = null) {
    return db.prepare('UPDATE participants SET gzctf_status = ?, gzctf_error = ? WHERE id = ?')
      .run(status, errorMsg, participantId);
  },

  // ==========================================
  // EMAIL QUEUE HELPERS (Anti-Spam & Pengiriman Bertahap)
  // ==========================================
  enqueueEmail(recipientEmail, recipientName, subject, htmlContent, delaySeconds = 0) {
    const scheduledAt = new Date(Date.now() + (delaySeconds * 1000)).toISOString();
    return db.prepare(`
      INSERT INTO email_queue (recipient_email, recipient_name, subject, html_content, scheduled_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(recipientEmail, recipientName, subject, htmlContent, scheduledAt);
  },

  getNextPendingEmail() {
    return db.prepare(`
      SELECT * FROM email_queue 
      WHERE status = 'pending' AND scheduled_at <= datetime('now')
      ORDER BY id ASC LIMIT 1
    `).get();
  },

  markEmailSent(id) {
    return db.prepare(`
      UPDATE email_queue 
      SET status = 'sent', sent_at = datetime('now') 
      WHERE id = ?
    `).run(id);
  },

  markEmailFailed(id, errorMsg) {
    return db.prepare(`
      UPDATE email_queue 
      SET status = CASE WHEN attempts + 1 >= max_attempts THEN 'failed' ELSE 'pending' END,
          attempts = attempts + 1,
          last_error = ?,
          scheduled_at = datetime('now', '+2 minutes')
      WHERE id = ?
    `).run(errorMsg, id);
  }
};
