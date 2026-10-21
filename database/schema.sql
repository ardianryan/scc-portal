-- Database Schema for SCC::CTF Registration Portal
PRAGMA foreign_keys = ON;

-- Tabel Pengaturan Sesi Pendaftaran (Dikelola Admin)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- Tabel Admin
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Tim (Untuk Mode Tim / Beregu)
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT UNIQUE NOT NULL,
    team_token TEXT UNIQUE NOT NULL,
    institution TEXT NOT NULL,
    category TEXT NOT NULL, -- 'internal', 'external_school', 'general'
    leader_name TEXT NOT NULL,
    contact_wa TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    gzctf_team_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Peserta / Anggota (Untuk Individu maupun Anggota Tim)
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'internal', 'external_school', 'general'
    institution TEXT NOT NULL, -- Nama Sekolah / Instansi
    nisn_or_id TEXT, -- NIS / NISN / No Identitas Pelajar
    class_grade TEXT, -- Tingkat/Kelas (misal: X-1, XI-IPA-2, atau Mahasiswa)
    phone_wa TEXT NOT NULL,
    email TEXT NOT NULL,
    username_gzctf TEXT UNIQUE NOT NULL,
    gzctf_status TEXT DEFAULT 'pending', -- 'success', 'pending', 'failed'
    gzctf_error TEXT,
    is_team_leader INTEGER DEFAULT 0, -- 1 jika ketua/individu, 0 jika anggota
    doc_url TEXT, -- URL berkas identitas di S3
    is_gedeg_verified INTEGER DEFAULT 0, -- 1 jika lolos verifikasi API Dapodik SMAN 1 Gedeg
    registration_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Antrean Email (Queue Pengiriman Bertahap Anti-Spam)
CREATE TABLE IF NOT EXISTS email_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inisialisasi Default Settings jika belum ada
INSERT OR IGNORE INTO settings (key, value, description) VALUES
('is_open', '1', 'Status pendaftaran (1 = Buka, 0 = Tutup)'),
('mode', 'individual', 'Mode partisipasi (individual / team)'),
('max_team_members', '3', 'Jumlah maksimal anggota per tim termasuk ketua'),
('allowed_categories', 'all', 'Kategori yang diizinkan (all / internal_only)'),
('max_quota', '200', 'Maksimal kuota pendaftar'),
('event_name', 'Smansage Cybersecurity Competition 2026', 'Nama Event CTF'),
('gzctf_game_id', '', 'ID Game di GZCTF untuk auto-join (opsional)'),
('smtp_host', 'smtp.office365.com', 'SMTP Server Host'),
('smtp_port', '587', 'SMTP Server Port'),
('smtp_user', '', 'SMTP Username Email'),
('smtp_pass', '', 'SMTP Password'),
('smtp_from', 'Panitia SCC::CTF 2026 <no-reply@sman1gedeg.sch.id>', 'Nama & Alamat Pengirim'),
('email_enable', '0', 'Kirim email konfirmasi otomatis (1 = Ya, 0 = Tidak)'),
('reg_start_at', '', 'Tanggal & Waktu Mulai Pendaftaran (ISO format)'),
('reg_end_at', '', 'Tanggal & Waktu Selesai Pendaftaran (ISO format)');
