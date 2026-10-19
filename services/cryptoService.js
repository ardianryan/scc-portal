const crypto = require('crypto');
const config = require('../config');

// Master key 32-byte (256-bit) diturunkan dari SESSION_SECRET / ENCRYPTION_KEY menggunakan SHA-256
const masterSecret = process.env.ENCRYPTION_KEY || config.SESSION_SECRET || 'scc-smansage-ctf-secret-session-key-2026';
const KEY = crypto.createHash('sha256').update(masterSecret).digest();

/**
 * Modul Enkripsi AES-256-GCM (Authenticated Encryption at Rest)
 */
class CryptoService {
  /**
   * Mengenkripsi teks rahasia
   * Format output: enc:iv_hex:tag_hex:ciphertext_hex
   */
  encrypt(plainText) {
    if (!plainText || typeof plainText !== 'string' || plainText.trim() === '') {
      return plainText;
    }
    // Jika sudah terenkripsi, jangan dienkripsi ganda
    if (plainText.startsWith('enc:')) {
      return plainText;
    }

    const iv = crypto.randomBytes(12); // 96-bit IV standar untuk GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag().toString('hex');
    return `enc:${iv.toString('hex')}:${tag}:${encrypted}`;
  }

  /**
   * Mendekripsi teks rahasia
   */
  decrypt(cipherText) {
    if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc:')) {
      return cipherText;
    }

    try {
      const parts = cipherText.split(':');
      if (parts.length !== 4) return cipherText;

      const iv = Buffer.from(parts[1], 'hex');
      const tag = Buffer.from(parts[2], 'hex');
      const encrypted = parts[3];

      const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('[CryptoService Decrypt Error] Gagal mendekripsi field rahasia:', err.message);
      return '';
    }
  }
}

module.exports = new CryptoService();
