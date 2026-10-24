#!/usr/bin/env node
/**
 * Script Diagnostik SMTP SCC::CTF
 * Penggunaan:
 *   node scripts/test-smtp.js [username] [password] [email_tujuan] [host] [port]
 *
 * Contoh:
 *   node scripts/test-smtp.js no-reply@sman1gedeg.sch.id rahasia123 ardianr94@gmail.com
 */

const nodemailer = require('nodemailer');

const username = process.argv[2] || process.env.SMTP_USER;
const password = process.argv[3] || process.env.SMTP_PASS;
const targetEmail = process.argv[4] || 'ardianr94@gmail.com';
const host = process.argv[5] || process.env.SMTP_HOST || 'smtp.office365.com';
const port = parseInt(process.argv[6] || process.env.SMTP_PORT || '587');

if (!username || !password) {
  console.error('\n[ERROR] Kredensial tidak lengkap!');
  console.log('Cara menjalankan:');
  console.log('  node scripts/test-smtp.js <username> <password> [tujuan] [host] [port]\n');
  process.exit(1);
}

console.log('====================================================');
console.log('🔍 MEMULAI PENGUJIAN KONEKSI SMTP');
console.log('====================================================');
console.log(`Server Host : ${host}:${port}`);
console.log(`Akun Login  : ${username}`);
console.log(`Tujuan Test : ${targetEmail}`);
console.log(`Secure      : ${port === 465 ? 'Yes (SSL/TLS)' : 'No (STARTTLS)'}`);
console.log('----------------------------------------------------');

const transporter = nodemailer.createTransport({
  host: host,
  port: port,
  secure: port === 465,
  auth: {
    user: username,
    pass: password
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function runTest() {
  try {
    console.log('[1/2] Memverifikasi handshake & autentikasi SMTP...');
    await transporter.verify();
    console.log('      Handshake & Autentikasi Berhasil! Server menerima kredensial.');

    console.log(`[2/2] Mengirim email uji coba ke ${targetEmail}...`);
    const info = await transporter.sendMail({
      from: `Panitia SCC::CTF 2026 <${username}>`,
      to: targetEmail,
      subject: '[SCC::CTF 2026] Uji Coba Konfigurasi Gateway SMTP (Local Test)',
      text: 'Email uji coba berhasil dikirim via node scripts/test-smtp.js. Konfigurasi SMTP Anda valid!'
    });

    console.log('----------------------------------------------------');
    console.log(' Pengiriman email SUKSES!');
    console.log(` Message ID : ${info.messageId}`);
    console.log(` Response   : ${info.response}`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n----------------------------------------------------');
    console.error(' PENGUJIAN GAGAL!');
    console.error(` Pesan Error: ${err.message}`);
    console.error('----------------------------------------------------');

    if (err.message.includes('535 5.7.3') || err.message.includes('Authentication unsuccessful')) {
      console.log('\n💡 PENYEBAB & SOLUSI ERROR 535 5.7.3 PADA MICROSOFT 365:');
      console.log('1. Password atau Username Keliru:');
      console.log('   - Pastikan username adalah User Principal Name (UPN) akun utama, bukan alias.');
      console.log('   - Cek apakah password akun baru saja diganti atau kedaluwarsa.');
      console.log('');
      console.log('2. Fitur "Authenticated SMTP" Dinonaktifkan di Microsoft 365 (Sangat Sering Terjadi):');
      console.log('   - Microsoft 365 secara default mematikan Basic SMTP AUTH.');
      console.log('   - Cara aktifkan di Exchange Admin Center (admin.exchange.microsoft.com):');
      console.log('     Recipients -> Mailboxes -> Pilih akun (' + username + ') -> Mailbox apps -> Centang "Authenticated SMTP" -> Save.');
      console.log('   - Atau via PowerShell:');
      console.log('     Set-CASMailbox -Identity "' + username + '" -SmtpClientAuthenticationExDisabled $false');
      console.log('');
      console.log('3. Akun Memiliki MFA / 2FA (Multi-Factor Authentication) atau Security Defaults:');
      console.log('   - Jika akun admin atau tenant mengaktifkan Security Defaults / MFA, password login biasa akan selalu ditolak oleh SMTP.');
      console.log('   - Solusi: Buat "App Password" jika akun didukung per-user MFA, atau kecualikan akun bot ini dari Conditional Access MFA.');
      console.log('');
      console.log('4. Alternatif Tercepat Jika Microsoft 365 Terkunci Kebijakan Tenant:');
      console.log('   - Gunakan akun Gmail Panitia dengan App Password (16 karakter). Host: smtp.gmail.com, Port: 587.');
      console.log('   - Atau gunakan relay transactional gratis seperti Brevo (300 email/hari gratis) / Resend.');
    }
    console.log('====================================================\n');
    process.exit(1);
  }
}

runTest();
