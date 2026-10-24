const nodemailer = require('nodemailer');
const config = require('../config');
const db = require('../database/index');

class MailService {
  /**
   * Membuat transport Nodemailer dinamis berdasarkan pengaturan DB / Config
   */
  getTransporter() {
    const settings = db.getSettings();
    const host = settings.smtp_host || config.SMTP_HOST;
    const port = parseInt(settings.smtp_port || config.SMTP_PORT);
    const user = settings.smtp_user || config.SMTP_USER;
    const pass = settings.smtp_pass || config.SMTP_PASS;

    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465,
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * HTML Template: Master Tiket Tim (Ketua Tim)
   */
  getLeaderEmailHtml(teamInfo, leaderInfo, membersList, settings = null) {
    if (!settings) settings = db.getSettings();
    const ctfUrl = config.GZCTF_PUBLIC_URL;

    let memberRows = '';
    (membersList || []).forEach((m, idx) => {
      memberRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #333;">${idx + 2}. ${m.full_name}</td>
          <td style="padding: 8px; border: 1px solid #333; font-family: monospace; color: #2ae5b5;">${m.username}</td>
          <td style="padding: 8px; border: 1px solid #333; font-family: monospace; color: #ffd166;">${m.password}</td>
          <td style="padding: 8px; border: 1px solid #333;">${m.email}</td>
        </tr>
      `;
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Master Tiket Tim - SCC::CTF 2026</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #141414; color: #ebebeb; margin: 0; padding: 20px; }
        .box { max-width: 650px; margin: 0 auto; background: #202020; border: 1px solid #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .header { background: #181818; padding: 25px; text-align: center; border-bottom: 2px solid #2ae5b5; }
        .title { font-size: 20px; font-weight: bold; color: #ffffff; margin: 10px 0 0 0; }
        .badge { display: inline-block; background: rgba(42,229,181,0.15); color: #2ae5b5; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .content { padding: 30px; font-size: 14px; line-height: 1.6; }
        .btn { display: block; width: 220px; margin: 25px auto; padding: 12px 20px; background: #2ae5b5; color: #0c0d0d; text-align: center; font-weight: bold; text-decoration: none; border-radius: 4px; font-size: 14px; }
        .footer { background: #181818; padding: 20px; text-align: center; font-size: 12px; color: #7a7a7a; border-top: 1px solid #282828; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
        th { background: #181818; color: #969696; padding: 8px; border: 1px solid #333; text-align: left; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <span class="badge">Master Tiket Tim & Kredensial Akun</span>
          <div class="title">Smansage Cybersecurity Competition 2026</div>
        </div>
        <div class="content">
          <p>Halo, <strong>${leaderInfo.full_name}</strong> (Ketua Tim <strong>${teamInfo.team_name}</strong>)!</p>
          <p>Tim Anda telah resmi terdaftar dan dibuatkan akun di platform <strong>GZCTF</strong>. Seluruh anggota tim di bawah ini telah otomatis tergabung dalam 1 tim di platform kompetisi.</p>

          <h3 style="color: #2ae5b5; margin-top: 25px; margin-bottom: 5px;">Daftar Akun Anggota Tim</h3>
          <p style="color: #999; font-size: 12px; margin-top: 0;">Bagikan kredensial login di bawah ini kepada masing-masing anggota tim Anda:</p>

          <table>
            <thead>
              <tr>
                <th>Nama Anggota</th>
                <th>Username GZCTF</th>
                <th>Password Login</th>
                <th>Email Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: rgba(42,229,181,0.05);">
                <td style="padding: 8px; border: 1px solid #333;"><strong>1. ${leaderInfo.full_name} (Ketua)</strong></td>
                <td style="padding: 8px; border: 1px solid #333; font-family: monospace; color: #2ae5b5;"><strong>${leaderInfo.username}</strong></td>
                <td style="padding: 8px; border: 1px solid #333; font-family: monospace; color: #ffd166;"><strong>${leaderInfo.password}</strong></td>
                <td style="padding: 8px; border: 1px solid #333;">${leaderInfo.email}</td>
              </tr>
              ${memberRows}
            </tbody>
          </table>

          <a href="${ctfUrl}" class="btn" target="_blank">Masuk ke Platform CTF &rarr;</a>

          ${settings.discord_invite_url ? `
          <div style="margin: 25px 0; padding: 15px; background: rgba(88, 101, 242, 0.1); border: 1px solid rgba(88, 101, 242, 0.35); border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #5865f2; font-size: 14px; margin-bottom: 5px;">Server Discord Komunitas SCC::CTF</div>
            <p style="font-size: 12px; color: #aaa; margin: 0 0 12px 0;">Bergabung untuk pengumuman jadwal, panduan teknis, dan diskusi dengan panitia.</p>
            <a href="${settings.discord_invite_url}" style="display: inline-block; padding: 8px 18px; background: #5865f2; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px;" target="_blank">Gabung Discord &rarr;</a>
          </div>
          ` : ''}

          <p style="font-size: 13px; color: #969696; margin-top: 25px;">
            <strong>Petunjuk Login Peserta:</strong>
            <br>&bull; Setiap anggota tim dapat login menggunakan username & password masing-masing.
            <br>&bull; Setiap kali anggota tim menyelesaikan soal, poin akan otomatis bertambah ke tim <strong>${teamInfo.team_name}</strong>.
            <br>&bull; Format flag resmi: <code>SCC{flag_jawaban}</code>
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Panitia SCC::CTF &bull; SMAN 1 Gedeg, Mojokerto<br>
          Informasi & Bantuan: kesiswaan@sman1gedeg.sch.id
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * HTML Template: Kredensial Pribadi Anggota Tim
   */
  getMemberEmailHtml(teamName, member, settings = null) {
    if (!settings) settings = db.getSettings();
    const ctfUrl = config.GZCTF_PUBLIC_URL;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Akun Anggota Tim - SCC::CTF 2026</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #141414; color: #ebebeb; margin: 0; padding: 20px; }
        .box { max-width: 550px; margin: 0 auto; background: #202020; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
        .header { background: #181818; padding: 25px; text-align: center; border-bottom: 2px solid #2ae5b5; }
        .title { font-size: 18px; font-weight: bold; color: #ffffff; margin: 10px 0 0 0; }
        .badge { display: inline-block; background: rgba(42,229,181,0.15); color: #2ae5b5; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .content { padding: 30px; font-size: 14px; line-height: 1.6; }
        .card { background: #141414; border: 1px dashed #333; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #252525; }
        .row:last-child { border-bottom: none; }
        .btn { display: block; width: 200px; margin: 25px auto; padding: 12px 20px; background: #2ae5b5; color: #0c0d0d; text-align: center; font-weight: bold; text-decoration: none; border-radius: 4px; }
        .footer { background: #181818; padding: 15px; text-align: center; font-size: 11px; color: #7a7a7a; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <span class="badge">Akun Peserta Anggota Tim</span>
          <div class="title">Smansage Cybersecurity Competition 2026</div>
        </div>
        <div class="content">
          <p>Halo, <strong>${member.full_name}</strong>!</p>
          <p>Ketua tim Anda telah mendaftarkan Anda ke dalam tim <strong>${teamName}</strong>. Akun Anda telah siap dan otomatis terhubung dengan tim di platform GZCTF.</p>

          <div class="card">
            <div class="row">
              <span style="color:#999;">Nama Tim:</span>
              <span style="color:#2ae5b5; font-weight:bold;">${teamName}</span>
            </div>
            <div class="row">
              <span style="color:#999;">Username GZCTF:</span>
              <span style="color:#ffffff; font-weight:bold; font-family:monospace;">${member.username}</span>
            </div>
            <div class="row">
              <span style="color:#999;">Password:</span>
              <span style="color:#ffd166; font-weight:bold; font-family:monospace;">${member.password}</span>
            </div>
          </div>

          <a href="${ctfUrl}" class="btn" target="_blank">Login ke Platform CTF &rarr;</a>

          ${settings.discord_invite_url ? `
          <div style="margin: 20px 0; padding: 12px; background: rgba(88, 101, 242, 0.1); border: 1px solid rgba(88, 101, 242, 0.35); border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #5865f2; font-size: 13px; margin-bottom: 4px;">Server Discord Komunitas SCC::CTF</div>
            <p style="font-size: 11px; color: #aaa; margin: 0 0 10px 0;">Bergabung bersama seluruh peserta untuk koordinasi teknis.</p>
            <a href="${settings.discord_invite_url}" style="display: inline-block; padding: 6px 14px; background: #5865f2; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 11px;" target="_blank">Gabung Discord &rarr;</a>
          </div>
          ` : ''}

          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Gunakan akun di atas untuk login ke <code>${ctfUrl}</code> dan mulai mengerjakan soal latihan bersama tim Anda!
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Panitia SCC::CTF &bull; SMAN 1 Gedeg
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * HTML Template: Konfirmasi Pendaftaran Individu
   */
  getIndividualEmailHtml(participantData, settings = null) {
    if (!settings) settings = db.getSettings();
    const ctfUrl = config.GZCTF_PUBLIC_URL;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Konfirmasi Pendaftaran - SCC::CTF 2026</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #141414; color: #ebebeb; margin: 0; padding: 20px; }
        .box { max-width: 600px; margin: 0 auto; background: #202020; border: 1px solid #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .header { background: #181818; padding: 25px; text-align: center; border-bottom: 2px solid #2ae5b5; }
        .title { font-size: 20px; font-weight: bold; color: #ffffff; margin: 10px 0 0 0; }
        .badge { display: inline-block; background: rgba(42,229,181,0.15); color: #2ae5b5; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .content { padding: 30px; font-size: 14px; line-height: 1.6; }
        .data-card { background: #141414; border: 1px dashed #333; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .data-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #252525; }
        .data-row:last-child { border-bottom: none; }
        .key { color: #969696; }
        .val { color: #ffffff; font-weight: bold; font-family: monospace; }
        .btn { display: block; width: 220px; margin: 25px auto; padding: 12px 20px; background: #2ae5b5; color: #0c0d0d; text-align: center; font-weight: bold; text-decoration: none; border-radius: 4px; font-size: 14px; }
        .footer { background: #181818; padding: 20px; text-align: center; font-size: 12px; color: #7a7a7a; border-top: 1px solid #282828; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <span class="badge">Konfirmasi Pendaftaran Resmi</span>
          <div class="title">Smansage Cybersecurity Competition (SCC::CTF) 2026</div>
        </div>
        <div class="content">
          <p>Halo, <strong>${participantData.full_name}</strong>!</p>
          <p>Selamat! Pendaftaran Anda telah resmi terdata di sistem kompetisi SCC::CTF 2026 SMAN 1 Gedeg. Berikut adalah rincian data pendaftaran dan kredensial akun platform Anda:</p>

          <div class="data-card">
            <div class="data-row">
              <span class="key">Nama Lengkap:</span>
              <span class="val">${participantData.full_name}</span>
            </div>
            <div class="data-row">
              <span class="key">Asal Sekolah/Instansi:</span>
              <span class="val">${participantData.institution}</span>
            </div>
            <div class="data-row">
              <span class="key">Kelas / NISN:</span>
              <span class="val">${participantData.class_grade || '-'} / ${participantData.nisn_or_id || '-'}</span>
            </div>
            <div class="data-row">
              <span class="key">Username GZCTF:</span>
              <span class="val" style="color: #72f1d2; font-size: 15px;">${participantData.username_gzctf}</span>
            </div>
            <div class="data-row">
              <span class="key">Password:</span>
              <span class="val" style="color: #ffd166;">${participantData.password || '(Sesuai yang diisi)'}</span>
            </div>
            <div class="data-row">
              <span class="key">Status Akun:</span>
              <span class="val" style="color: #34d399;">${participantData.gzctf_status === 'success' ? 'Aktif di GZCTF' : 'Tersimpan (Verifikasi)'}</span>
            </div>
          </div>

          <a href="${ctfUrl}" class="btn" target="_blank">Buka Platform CTF &rarr;</a>

          ${settings.discord_invite_url ? `
          <div style="margin: 25px 0; padding: 15px; background: rgba(88, 101, 242, 0.1); border: 1px solid rgba(88, 101, 242, 0.35); border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #5865f2; font-size: 14px; margin-bottom: 5px;">Server Discord Komunitas SCC::CTF</div>
            <p style="font-size: 12px; color: #aaa; margin: 0 0 12px 0;">Bergabung untuk pengumuman jadwal, panduan teknis, dan diskusi dengan panitia.</p>
            <a href="${settings.discord_invite_url}" style="display: inline-block; padding: 8px 18px; background: #5865f2; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px;" target="_blank">Gabung Discord &rarr;</a>
          </div>
          ` : ''}

          <p style="font-size: 13px; color: #969696; margin-top: 25px;">
            <strong>Catatan Penting:</strong>
            <br>&bull; Format flag: <code>SCC{flag_rahasia}</code>
            <br>&bull; Dilarang keras melakukan DoS/DDoS dan scanner otomatis.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Panitia SCC::CTF &bull; SMAN 1 Gedeg, Mojokerto
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * HTML Template: Uji Coba Pengiriman Gateway (Test Email)
   */
  getTestEmailHtml(toEmail, settings = null) {
    if (!settings) settings = db.getSettings();
    const ctfUrl = config.GZCTF_PUBLIC_URL;
    const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const host = settings.smtp_host || config.SMTP_HOST;
    const port = settings.smtp_port || config.SMTP_PORT;
    const fromAddr = settings.smtp_from || config.SMTP_FROM;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Uji Coba Pengiriman Email - SCC::CTF 2026</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #141414; color: #ebebeb; margin: 0; padding: 20px; }
        .box { max-width: 600px; margin: 0 auto; background: #202020; border: 1px solid #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .header { background: #181818; padding: 25px; text-align: center; border-bottom: 2px solid #2ae5b5; }
        .title { font-size: 20px; font-weight: bold; color: #ffffff; margin: 10px 0 0 0; }
        .badge { display: inline-block; background: rgba(42,229,181,0.15); color: #2ae5b5; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .content { padding: 30px; font-size: 14px; line-height: 1.6; }
        .data-card { background: #141414; border: 1px dashed #333; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .data-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #252525; }
        .data-row:last-child { border-bottom: none; }
        .key { color: #969696; }
        .val { color: #ffffff; font-weight: bold; font-family: monospace; }
        .btn { display: block; width: 220px; margin: 25px auto; padding: 12px 20px; background: #2ae5b5; color: #0c0d0d; text-align: center; font-weight: bold; text-decoration: none; border-radius: 4px; font-size: 14px; }
        .footer { background: #181818; padding: 20px; text-align: center; font-size: 12px; color: #7a7a7a; border-top: 1px solid #282828; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <span class="badge">Uji Coba Pengiriman Email</span>
          <div class="title">Smansage Cybersecurity Competition (SCC::CTF) 2026</div>
        </div>
        <div class="content">
          <p>Halo, <strong>${toEmail}</strong>!</p>
          <p>Ini adalah email uji coba untuk memverifikasi bahwa konfigurasi gateway SMTP portal registrasi SCC::CTF 2026 berfungsi dengan normal dan email berhasil terkirim ke kotak masuk tujuan.</p>

          <div class="data-card">
            <div class="data-row">
              <span class="key">Status Gateway:</span>
              <span class="val" style="color: #34d399;">TERHUBUNG (OK)</span>
            </div>
            <div class="data-row">
              <span class="key">SMTP Server:</span>
              <span class="val">${host}:${port}</span>
            </div>
            <div class="data-row">
              <span class="key">Pengirim (From):</span>
              <span class="val">${fromAddr}</span>
            </div>
            <div class="data-row">
              <span class="key">Tujuan (To):</span>
              <span class="val" style="color: #2ae5b5;">${toEmail}</span>
            </div>
            <div class="data-row">
              <span class="key">Waktu Pengiriman:</span>
              <span class="val">${nowStr} WIB</span>
            </div>
          </div>

          <a href="${ctfUrl}" class="btn" target="_blank">Buka Platform CTF &rarr;</a>

          ${settings.discord_invite_url ? `
          <div style="margin: 25px 0; padding: 15px; background: rgba(88, 101, 242, 0.1); border: 1px solid rgba(88, 101, 242, 0.35); border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #5865f2; font-size: 14px; margin-bottom: 5px;">Server Discord Komunitas SCC::CTF</div>
            <p style="font-size: 12px; color: #aaa; margin: 0 0 12px 0;">Pengaturan tautan komunitas Discord telah aktif dan siap digunakan peserta.</p>
            <a href="${settings.discord_invite_url}" style="display: inline-block; padding: 8px 18px; background: #5865f2; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px;" target="_blank">Gabung Discord &rarr;</a>
          </div>
          ` : ''}

          <p style="font-size: 13px; color: #969696; margin-top: 25px;">
            <strong>Catatan Pengujian:</strong>
            <br>&bull; Email ini dikirim secara langsung dari server portal registrasi menggunakan Nodemailer.
            <br>&bull; Antrean pengiriman otomatis bertahap (rate-limit anti-spam) siap memproses tiket peserta.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Panitia SCC::CTF &bull; SMAN 1 Gedeg, Mojokerto
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Mengirim email Rangkuman Induk (Master Summary) ke KETUA TIM
   */
  async sendTeamLeaderEmail(teamInfo, leaderInfo, membersList) {
    const settings = db.getSettings();
    if (settings.email_enable === '0') return { success: false, reason: 'disabled' };

    const htmlBody = this.getLeaderEmailHtml(teamInfo, leaderInfo, membersList, settings);

    try {
      console.log(`[MailService Queue] Menjadwalkan email Master Summary ke Ketua (${leaderInfo.email})...`);
      db.enqueueEmail(
        leaderInfo.email,
        leaderInfo.full_name,
        `[SCC::CTF 2026] Data Akun Tim "${teamInfo.team_name}" - Ketua & Seluruh Anggota`,
        htmlBody,
        0 // Segera antrekan
      );
      return { success: true };
    } catch (err) {
      console.error('[MailService Queue Error Leader]', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Mengirim email kredensial pribadi ke masing-masing ANGGOTA TIM
   */
  async sendTeamMemberEmail(teamName, member) {
    const settings = db.getSettings();
    if (settings.email_enable === '0') return { success: false, reason: 'disabled' };

    const htmlBody = this.getMemberEmailHtml(teamName, member, settings);

    try {
      console.log(`[MailService Queue] Menjadwalkan email akun anggota ke ${member.email}...`);
      db.enqueueEmail(
        member.email,
        member.full_name,
        `[SCC::CTF 2026] Akun Kompetisi Kamu di Tim "${teamName}"`,
        htmlBody,
        30 // Jeda 30 detik agar tidak serentak dengan email ketua
      );
      return { success: true };
    } catch (err) {
      console.error(`[MailService Queue Error Member ${member.username}]`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Mengirim email pendaftaran Individu
   */
  async sendRegistrationEmail(participantData) {
    const settings = db.getSettings();
    if (settings.email_enable === '0') return { success: false, reason: 'disabled' };

    const htmlBody = this.getIndividualEmailHtml(participantData, settings);

    try {
      console.log(`[MailService Queue] Menjadwalkan email konfirmasi individu ke ${participantData.email}...`);
      db.enqueueEmail(
        participantData.email,
        participantData.full_name,
        `[SCC::CTF 2026] Akun Kompetisi Resmi - ${participantData.username_gzctf}`,
        htmlBody,
        0
      );
      return { success: true };
    } catch (err) {
      console.error('[MailService Queue Error Individu]', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Mengirim email uji coba langsung (Direct Test Email)
   */
  async sendTestEmail(toEmail) {
    const settings = db.getSettings();
    const host = settings.smtp_host || config.SMTP_HOST;
    const port = parseInt(settings.smtp_port || config.SMTP_PORT);
    const user = settings.smtp_user || config.SMTP_USER;
    const pass = settings.smtp_pass || config.SMTP_PASS;

    if (!user || !pass) {
      throw new Error('Kredensial SMTP belum diatur (SMTP Username atau Password masih kosong). Mohon simpan kredensial SMTP pada form pengaturan terlebih dahulu.');
    }

    const fromAddress = settings.smtp_from || config.SMTP_FROM;
    const transporter = this.getTransporter();
    const htmlBody = this.getTestEmailHtml(toEmail, settings);

    console.log(`[MailService] Mengirim email uji coba ke ${toEmail} via ${host}:${port}...`);
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: '[SCC::CTF 2026] Uji Coba Konfigurasi Email Gateway',
      html: htmlBody
    });

    console.log(`[MailService] Sukses mengirim email uji coba ke ${toEmail}. Message ID: ${info.messageId}`);
    return info;
  }

  /**
   * Worker pemroses antrean email bertahap (Queue Processor)
   * Mengirim 1 email per siklus dengan jeda terukur untuk mencegah spam score
   */
  async processNextQueueItem() {
    const settings = db.getSettings();
    if (settings.email_enable === '0') return;

    const item = db.getNextPendingEmail();
    if (!item) return;

    const fromAddress = settings.smtp_from || config.SMTP_FROM;
    const transporter = this.getTransporter();

    try {
      console.log(`[MailQueue Worker] Mengirim email antrean #${item.id} ke ${item.recipient_email}...`);
      await transporter.sendMail({
        from: fromAddress,
        to: item.recipient_email,
        subject: item.subject,
        html: item.html_content
      });
      db.markEmailSent(item.id);
      console.log(`[MailQueue Worker] Sukses terkirim email #${item.id} (${item.recipient_email})`);
    } catch (err) {
      console.error(`[MailQueue Worker Error #${item.id}]`, err.message);
      db.markEmailFailed(item.id, err.message);
    }
  }

  /**
   * Menjalankan daemon background worker antrean email
   * Interval: memeriksa antrean setiap 5-10 detik secara bertahap
   */
  startQueueDaemon(intervalMs = 7000) {
    if (this._daemonInterval) return;
    console.log(`[MailQueue Daemon] Berjalan dengan interval pengiriman bertahap ${intervalMs / 1000} detik...`);
    
    this._daemonInterval = setInterval(() => {
      this.processNextQueueItem().catch(e => console.error('[MailQueue Tick Error]', e.message));
    }, intervalMs);
  }
}

module.exports = new MailService();
