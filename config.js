require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'scc-smansage-ctf-secret-session-key-2026',
  
  // GZCTF API Configuration
  // Jika berjalan dalam Docker Compose yang sama: http://gzctf:80
  // Jika dari host lokal: http://localhost:8080 atau domain publik
  GZCTF_URL: process.env.GZCTF_URL || 'http://localhost:8080',
  GZCTF_PUBLIC_URL: process.env.GZCTF_PUBLIC_URL || 'https://scc.sman1gedeg.sch.id/',
  
  // Default Admin Credentials
  DEFAULT_ADMIN_USER: process.env.ADMIN_USER || 'admin',
  DEFAULT_ADMIN_PASS: process.env.ADMIN_PASS || 'SmansageCtf2026!',
  
  // App Branding
  APP_TITLE: 'SCC::CTF Registration Portal',
  ORGANIZATION: 'SMAN 1 Gedeg',
  EVENT_NAME: 'Smansage Cybersecurity Competition 2026',

  // Email SMTP Configuration (Default Office 365 SMAN 1 Gedeg)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.office365.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true', // false for port 587 STARTTLS
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Panitia SCC::CTF 2026 <no-reply@sman1gedeg.sch.id>',

  // Storage S3 (IDCloudHost Object Storage)
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'https://is3.cloudhost.id',
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET || 'is3-storage.smage.my.id',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
  S3_PATH_PREFIX: (process.env.S3_PATH_PREFIX || '/scc-ctfreg').replace(/^\/+|\/+$/g, ''),
  S3_PUBLIC_DOMAIN: (process.env.S3_PUBLIC_DOMAIN || 'https://is3-storage.smage.my.id').replace(/\/+$/, '')
};
