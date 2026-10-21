const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const multer = require('multer');

const config = require('./config');
const db = require('./database/index');
const gzctfService = require('./services/gzctfService');
const excelService = require('./services/excelService');
const contentService = require('./services/contentService');
const mailService = require('./services/mailService');
const storageService = require('./services/storageService');
const scholargateService = require('./services/scholargateService');
const authAdmin = require('./middleware/authAdmin');

const app = express();

// Multer in-memory upload (Maksimal 5MB, format gambar & PDF)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format berkas tidak didukung. Harap unggah file JPG, PNG, WEBP, atau PDF.'));
    }
  }
});

// Security: Helmet HTTP Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Security: Rate Limiting
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 submit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Terlalu banyak permintaan pendaftaran dari IP ini. Silakan coba lagi dalam 15 menit.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Terlalu banyak percobaan login. Akun dikunci sementara 15 menit.'
});

// Security: Anti-Brute Force Limiter khusus Endpoint Cek NISN
const nisnVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // Jendela 10 menit
  max: 8, // Maksimal 8 kali verifikasi NISN per IP dalam 10 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan verifikasi NISN dari perangkat ini. Silakan coba lagi setelah 10 menit demi keamanan data sekolah.'
  }
});

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'scc_ctf_session',
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: 'auto' // Otomatis deteksi HTTPS (aman di reverse proxy maupun direct HTTP IP)
  }
}));

app.use(flash());

// Global template variables
app.use((req, res, next) => {
  res.locals.config = config;
  res.locals.messages = req.flash();
  res.locals.admin = req.session ? req.session.admin : null;
  res.locals.hasAcceptedWizard = !!(req.session && req.session.hasAcceptedWizard);
  next();
});

// ==========================================
// PUBLIC ROUTES: WIZARD & PENDAFTARAN PESERTA
// ==========================================

// Route Root: Jika belum accept wizard, arahkan ke wizard pedoman
app.get('/', (req, res) => {
  if (req.session && req.session.hasAcceptedWizard) {
    return res.redirect('/register');
  }
  return res.redirect('/pedoman');
});

// Halaman Wizard (Pedoman, Regulasi & Panduan)
app.get('/pedoman', (req, res) => {
  const pedomanHtml = contentService.getPedomanHtml();
  const panduanHtml = contentService.getPanduanHtml();
  res.render('wizard', { pedomanHtml, panduanHtml });
});

// Aksi Penerimaan Regulasi Wizard
app.post('/wizard/accept', (req, res) => {
  if (req.body.agree) {
    req.session.hasAcceptedWizard = true;
    return res.redirect('/register');
  }
  req.flash('error', 'Anda wajib menyetujui tata tertib kompetisi sebelum mendaftar.');
  return res.redirect('/pedoman');
});

// Helper untuk memeriksa status aktif pendaftaran (Manual + Waktu)
function checkRegistrationStatus(settings) {
  if (settings.is_open !== '1') {
    return { isOpen: false, reason: 'Pendaftaran ditutup oleh panitia.' };
  }

  const now = new Date();

  if (settings.reg_start_at && settings.reg_start_at.trim() !== '') {
    const startDate = new Date(settings.reg_start_at);
    if (!isNaN(startDate.getTime()) && now < startDate) {
      const formatted = startDate.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
      return { isOpen: false, reason: `Pendaftaran belum dibuka. Pendaftaran akan dibuka pada ${formatted}.` };
    }
  }

  if (settings.reg_end_at && settings.reg_end_at.trim() !== '') {
    const endDate = new Date(settings.reg_end_at);
    if (!isNaN(endDate.getTime()) && now > endDate) {
      const formatted = endDate.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
      return { isOpen: false, reason: `Batas waktu pendaftaran telah berakhir pada ${formatted}.` };
    }
  }

  return { isOpen: true };
}

// Endpoint Ajax Real-time Verifikasi NISN Siswa SMAN 1 Gedeg (Terproteksi Anti-Bot & Session Wizard)
app.post('/api/verify-gedeg', nisnVerifyLimiter, async (req, res) => {
  try {
    // 1. Bot Protection: Wajib memiliki sesi aktif dan telah membaca pedoman
    if (!req.session || !req.session.hasAcceptedWizard) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda harus membaca pedoman kompetisi terlebih dahulu.'
      });
    }

    const { nisn, full_name } = req.body;
    if (!nisn || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap dan nomor NISN wajib diisi.'
      });
    }

    // 2. Format Sanitization: NISN harus berupa angka 8-10 digit murni
    const cleanNisn = nisn.toString().trim();
    if (!/^[0-9]{8,12}$/.test(cleanNisn)) {
      return res.json({
        success: false,
        message: 'Format NISN tidak valid (harus berupa 8-10 digit angka).'
      });
    }

    // 3. Constant-time delay mikro untuk meredam timing-attack scanning bot
    await new Promise(r => setTimeout(r, 350));

    const result = await scholargateService.verifyStudent(cleanNisn, full_name);
    if (!result.valid) {
      return res.json({
        success: false,
        message: result.message
      });
    }

    return res.json({
      success: true,
      message: 'Siswa aktif terverifikasi!',
      kelas: result.studentData ? result.studentData.kelas : null
    });
  } catch (err) {
    console.error('[API Verify Gedeg Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghubungi server verifikasi sekolah.'
    });
  }
});

// Form Pendaftaran (Step 2)
app.get('/register', (req, res) => {
  // Wajib telah membaca dan menyetujui pedoman regulasi terlebih dahulu
  if (!req.session.hasAcceptedWizard) {
    req.flash('error', 'Silakan baca dan setujui pedoman & regulasi kompetisi terlebih dahulu.');
    return res.redirect('/pedoman');
  }

  const settings = db.getSettings();
  const statusCheck = checkRegistrationStatus(settings);
  res.render('register', { settings, statusCheck });
});

// Proses Submit Pendaftaran
app.post('/register', registrationLimiter, (req, res, next) => {
  upload.single('identity_document')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'Ukuran berkas identitas terlalu besar! Maksimal 5MB.');
        return res.redirect('/register');
      }
      req.flash('error', 'Kesalahan unggah berkas: ' + err.message);
      return res.redirect('/register');
    } else if (err) {
      req.flash('error', err.message);
      return res.redirect('/register');
    }
    next();
  });
}, async (req, res) => {
  try {
    const settings = db.getSettings();

    // 1. Cek apakah pendaftaran buka (Manual & Jadwal Waktu)
    const statusCheck = checkRegistrationStatus(settings);
    if (!statusCheck.isOpen) {
      req.flash('error', statusCheck.reason);
      return res.redirect('/register');
    }

    // 2. Cek Kuota
    const currentCount = db.getParticipantCount();
    const maxQuota = parseInt(settings.max_quota || '200');
    if (currentCount >= maxQuota) {
      req.flash('error', 'Mohon maaf, kuota pendaftaran telah penuh.');
      return res.redirect('/register');
    }

    let {
      level_grade,
      is_gedeg_student,
      institution,
      nisn_or_id,
      class_grade,
      full_name,
      phone_wa,
      email,
      username_gzctf,
      password,
      password_confirm,
      team_name
    } = req.body;

    const isGedeg = is_gedeg_student === '1' || is_gedeg_student === 'true';
    level_grade = validator.trim(level_grade || 'sma_ma');

    // Sanitasi String Dasar
    full_name = validator.trim(full_name || '');
    email = validator.normalizeEmail(validator.trim(email || ''));
    username_gzctf = validator.trim(username_gzctf || '');
    phone_wa = validator.trim(phone_wa || '').replace(/[^0-9+]/g, '');
    nisn_or_id = validator.trim(nisn_or_id || '');
    class_grade = validator.trim(class_grade || '');
    institution = validator.trim(institution || '');

    // 3. Validasi Keamanan & Input
    if (!full_name || full_name.length < 3 || full_name.length > 100) {
      req.flash('error', 'Nama lengkap wajib diisi (3-100 karakter).');
      return res.redirect('/register');
    }

    if (!email || !validator.isEmail(email)) {
      req.flash('error', 'Format alamat email tidak valid.');
      return res.redirect('/register');
    }

    // Username format: 3-24 karakter alfanumerik / _ / -
    const usernameRegex = /^[a-zA-Z0-9_-]{3,24}$/;
    if (!usernameRegex.test(username_gzctf)) {
      req.flash('error', 'Username GZCTF hanya boleh 3-24 karakter (huruf, angka, strip, atau underscore).');
      return res.redirect('/register');
    }

    if (!password || password.length < 6) {
      req.flash('error', 'Password minimal 6 karakter.');
      return res.redirect('/register');
    }

    if (password !== password_confirm) {
      req.flash('error', 'Konfirmasi password tidak cocok.');
      return res.redirect('/register');
    }

    // Cek duplikasi di DB Lokal
    if (db.getParticipantByUsername(username_gzctf)) {
      req.flash('error', `Username GZCTF "${username_gzctf}" sudah terdaftar di sistem.`);
      return res.redirect('/register');
    }

    if (db.getParticipantByEmail(email)) {
      req.flash('error', `Email "${email}" sudah pernah didaftarkan.`);
      return res.redirect('/register');
    }

    // Tentukan Institusi, Kategori, dan Validasi ScholarGate jika siswa SMAN 1 Gedeg
    let finalCategory = isGedeg ? 'internal' : (level_grade === 'general' ? 'general' : 'external_school');
    let finalInstitution = isGedeg ? 'SMAN 1 Gedeg' : institution;
    let finalClass = class_grade || '-';
    let finalNisn = nisn_or_id;
    let isGedegVerified = 0;

    if (isGedeg) {
      if (!finalNisn || finalNisn.length < 8) {
        req.flash('error', 'NISN siswa SMAN 1 Gedeg wajib diisi dengan benar (minimal 8-10 digit).');
        return res.redirect('/register');
      }

      console.log(`[Verifikasi ScholarGate] Memvalidasi siswa Gedeg: NISN ${finalNisn}, Nama: "${full_name}"...`);
      const sgResult = await scholargateService.verifyStudent(finalNisn, full_name);

      if (!sgResult.valid) {
        req.flash('error', sgResult.message);
        return res.redirect('/register');
      }

      isGedegVerified = 1;
      if (sgResult.studentData && sgResult.studentData.kelas) {
        finalClass = sgResult.studentData.kelas; // Sinkronisasi kelas resmi dari Dapodik
      }
      console.log(`[Verifikasi ScholarGate Sukses] Siswa ${full_name} (${finalNisn}) terverifikasi di Dapodik. Kelas: ${finalClass}`);
    } else {
      // Untuk peserta luar SMAN 1 Gedeg: Wajib berkas kartu pelajar / identitas
      if (!req.file) {
        req.flash('error', 'Untuk peserta Luar SMAN 1 Gedeg / Umum, wajib mengunggah dokumen identitas (Kartu Pelajar, KTM, atau KTP/SIM).');
        return res.redirect('/register');
      }
    }

    // Unggah Dokumen ke S3 (IDCloudHost Object Storage) jika ada file yang diunggah
    let uploadedDocUrl = null;
    if (req.file) {
      console.log(`[Storage S3] Mengunggah dokumen identitas untuk ${username_gzctf} (${finalCategory})...`);
      const uploadResult = await storageService.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        finalCategory,
        finalNisn || username_gzctf
      );

      if (uploadResult.success) {
        uploadedDocUrl = uploadResult.url;
        console.log(`[Storage S3] Berkas sukses terunggah: ${uploadedDocUrl}`);
      } else {
        console.warn(`[Storage S3 Warning] Gagal upload S3: ${uploadResult.error}`);
        if (!isGedeg) {
          req.flash('error', 'Gagal mengunggah dokumen identitas ke penyimpanan cloud: ' + uploadResult.error);
          return res.redirect('/register');
        }
      }
    }

    // 4. Proses Registrasi Berdasarkan Mode (Individu vs Tim)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (settings.mode === 'team') {
      // ==========================================
      // MODE TIM: OTOMASI AKUN KETUA & ANGGOTA + BUAT TIM GZCTF
      // ==========================================
      team_name = validator.trim(team_name || '');
      if (!team_name || team_name.length < 3) {
        req.flash('error', 'Nama tim wajib diisi minimal 3 karakter.');
        return res.redirect('/register');
      }

      // Kumpulkan data anggota tim
      const membersData = [];
      const maxMembers = parseInt(settings.max_team_members || '3');

      for (let i = 2; i <= maxMembers; i++) {
        let mName = validator.trim(req.body[`member_name_${i}`] || '');
        let mEmail = validator.normalizeEmail(validator.trim(req.body[`member_email_${i}`] || ''));
        let mNisn = validator.trim(req.body[`member_nisn_${i}`] || '');
        let mClass = validator.trim(req.body[`member_class_${i}`] || '');
        let mUsername = validator.trim(req.body[`member_username_${i}`] || '');
        let mPassword = validator.trim(req.body[`member_password_${i}`] || '');

        if (mName) {
          // Default username & password jika kosong
          if (!mUsername) {
            mUsername = `${username_gzctf}_m${i}`;
          } else {
            // Validasi format username anggota
            if (!usernameRegex.test(mUsername)) {
              mUsername = `${username_gzctf}_m${i}`;
            }
          }
          if (!mPassword || mPassword.length < 6) mPassword = password;
          if (!mEmail || !validator.isEmail(mEmail)) mEmail = `${mUsername}@scc.local`;

          membersData.push({
            full_name: mName,
            email: mEmail,
            nisn_or_id: mNisn,
            class_grade: mClass,
            username: mUsername,
            password: mPassword
          });
        }
      }

      // Jalankan Otomasi Penuh ke GZCTF
      console.log(`[GZCTF Team Provisioning] Memulai setup tim "${team_name}"...`);
      const teamGzResult = await gzctfService.provisionFullTeam(
        team_name,
        { username: username_gzctf, email, password },
        membersData
      );

      let gzStatus = teamGzResult.teamCreated ? 'success' : 'pending';
      let gzError = teamGzResult.errors.length > 0 ? teamGzResult.errors.join(' | ') : null;

      // Simpan ke Database Lokal
      const teamToken = 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const createdTeam = db.createTeamWithMembers(
        {
          team_name,
          team_token: teamToken,
          institution: finalInstitution,
          category: finalCategory
        },
        {
          full_name,
          phone_wa,
          email,
          username_gzctf,
          nisn_or_id: finalNisn,
          class_grade: finalClass,
          gzctf_status: gzStatus,
          gzctf_error: gzError,
          doc_url: uploadedDocUrl,
          is_gedeg_verified: isGedegVerified,
          registration_ip: clientIp
        },
        membersData.map(m => ({
          full_name: m.full_name,
          email: m.email,
          nisn_or_id: m.nisn_or_id,
          class_grade: m.class_grade,
          username_gzctf: m.username
        }))
      );

      // Kirim Email Master Summary ke Ketua Tim
      mailService.sendTeamLeaderEmail(
        { team_name, team_token: teamToken },
        { full_name, username: username_gzctf, email, password },
        membersData
      ).catch(err => console.error('[Mail Error Leader]', err.message));

      // Kirim Email Pribadi ke Masing-Masing Anggota
      for (const m of membersData) {
        if (m.email && !m.email.endsWith('@scc.local')) {
          mailService.sendTeamMemberEmail(team_name, m)
            .catch(err => console.error(`[Mail Error Member ${m.username}]`, err.message));
        }
      }

    } else {
      // ==========================================
      // MODE INDIVIDU: AKUN TUNGGAL
      // ==========================================
      console.log(`[GZCTF API] Mendaftarkan akun individu: ${username_gzctf} (${email})...`);
      const gzResult = await gzctfService.registerAccount(username_gzctf, email, password);
      
      let gzStatus = gzResult.success ? 'success' : 'pending';
      let gzError = gzResult.success ? null : gzResult.error;

      db.createIndividualParticipant({
        full_name,
        category: finalCategory,
        institution: finalInstitution,
        nisn_or_id: finalNisn,
        class_grade: finalClass,
        phone_wa,
        email,
        username_gzctf,
        gzctf_status: gzStatus,
        gzctf_error: gzError,
        doc_url: uploadedDocUrl,
        is_gedeg_verified: isGedegVerified,
        registration_ip: clientIp
      });

      // Kirim Email Konfirmasi Individu
      mailService.sendRegistrationEmail({
        full_name,
        institution: finalInstitution,
        class_grade: finalClass,
        nisn_or_id: finalNisn,
        username_gzctf,
        email,
        password,
        gzctf_status: gzStatus
      }).catch(err => console.error('[Mail Error Individu]', err.message));
    }

    return res.redirect(`/success?u=${encodeURIComponent(username_gzctf)}`);
  } catch (err) {
    console.error('[Registration Error]', err);
    req.flash('error', 'Terjadi kesalahan sistem: ' + err.message);
    return res.redirect('/register');
  }
});

// Halaman Sukses & Kartu Peserta
app.get('/success', (req, res) => {
  const username = req.query.u;
  if (!username) return res.redirect('/');

  const participant = db.getParticipantByUsername(username);
  if (!participant) return res.redirect('/');

  let teamMembers = [];
  if (participant.team_id) {
    teamMembers = db.db.prepare('SELECT * FROM participants WHERE team_id = ? AND is_team_leader = 0').all(participant.team_id);
  }

  res.render('success', { participant, teamMembers });
});

// ==========================================
// ADMIN ROUTES: PANEL PANITIA
// ==========================================

// Login Page
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/admin');
  }
  res.render('admin_login');
});

// Process Login with Rate Limiting
app.post('/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  const adminRow = db.db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

  if (adminRow && bcrypt.compareSync(password, adminRow.password_hash)) {
    req.session.admin = { id: adminRow.id, username: adminRow.username, name: adminRow.name };
    return res.redirect('/admin');
  }

  req.flash('error', 'Username atau Password panitia salah.');
  return res.redirect('/admin/login');
});

// Admin Dashboard
app.get('/admin', authAdmin, (req, res) => {
  const settings = db.getSettings();
  const participants = db.getAllParticipants();
  const teams = db.getAllTeams();

  res.render('admin_dashboard', { settings, participants, teams });
});

// Update Settings
app.post('/admin/settings', authAdmin, (req, res) => {
  try {
    const { 
      is_open, mode, max_team_members, event_name, max_quota,
      level_sma_ma, level_smk, level_mahasiswa, level_general,
      email_enable, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from,
      reg_start_at, reg_end_at
    } = req.body;

    // Kumpulkan jenjang yang dipilih
    const selectedLevels = [];
    if (level_sma_ma) selectedLevels.push('sma_ma');
    if (level_smk) selectedLevels.push('smk');
    if (level_mahasiswa) selectedLevels.push('mahasiswa');
    if (level_general) selectedLevels.push('general');
    const allowedLevelsStr = selectedLevels.length > 0 ? selectedLevels.join(',') : 'sma_ma,smk,mahasiswa,general';

    db.updateSetting('is_open', is_open);
    db.updateSetting('mode', mode);
    db.updateSetting('allowed_levels', allowedLevelsStr);
    db.updateSetting('max_team_members', max_team_members);
    db.updateSetting('event_name', event_name);
    db.updateSetting('max_quota', max_quota);
    db.updateSetting('reg_start_at', reg_start_at || '');
    db.updateSetting('reg_end_at', reg_end_at || '');

    if (email_enable !== undefined) db.updateSetting('email_enable', email_enable);
    if (smtp_host) db.updateSetting('smtp_host', smtp_host);
    if (smtp_port) db.updateSetting('smtp_port', smtp_port);
    if (smtp_user) db.updateSetting('smtp_user', smtp_user);
    if (smtp_pass && smtp_pass.trim() !== '') db.updateSetting('smtp_pass', smtp_pass);
    if (smtp_from) db.updateSetting('smtp_from', smtp_from);

    req.flash('success', 'Pengaturan sesi pendaftaran & jadwal berhasil diperbarui.');
  } catch (err) {
    req.flash('error', 'Gagal menyimpan pengaturan: ' + err.message);
  }
  res.redirect('/admin');
});

// Change Admin Password
app.post('/admin/change-password', authAdmin, (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    const adminSession = req.session.admin;

    if (!old_password || !new_password || !confirm_password) {
      req.flash('error', 'Semua kolom kata sandi wajib diisi.');
      return res.redirect('/admin');
    }

    if (new_password.length < 6) {
      req.flash('error', 'Password baru minimal 6 karakter.');
      return res.redirect('/admin');
    }

    if (new_password !== confirm_password) {
      req.flash('error', 'Konfirmasi password baru tidak cocok.');
      return res.redirect('/admin');
    }

    const adminRow = db.db.prepare('SELECT * FROM admins WHERE id = ?').get(adminSession.id);
    if (!adminRow || !bcrypt.compareSync(old_password, adminRow.password_hash)) {
      req.flash('error', 'Password lama Anda salah!');
      return res.redirect('/admin');
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    db.db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, adminSession.id);

    req.flash('success', 'Password admin berhasil diperbarui! Silakan gunakan password baru untuk login berikutnya.');
  } catch (err) {
    req.flash('error', 'Gagal mengubah password: ' + err.message);
  }
  res.redirect('/admin');
});

// Export Excel Rekap Pendaftar
app.get('/admin/export', authAdmin, async (req, res) => {
  try {
    const settings = db.getSettings();
    const participants = db.getAllParticipants();
    const teams = db.getAllTeams();

    const buffer = await excelService.generateParticipantsExcel(participants, teams, settings);

    const filename = `REKAP_PESERTA_SCC_CTF_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('[Export Error]', err);
    req.flash('error', 'Gagal mengunduh file rekap: ' + err.message);
    res.redirect('/admin');
  }
});

// Logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Server Listen
app.listen(config.PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 SCC::CTF Registration Portal Active on Port ${config.PORT}`);
  console.log(`   URL: http://localhost:${config.PORT}`);
  console.log(`   Admin Login: http://localhost:${config.PORT}/admin/login`);
  console.log(`   GZCTF Target: ${config.GZCTF_URL}`);
  console.log(`===================================================`);

  // Jalankan background worker queue email bertahap (setiap 7 detik per email)
  mailService.startQueueDaemon(7000);
});
