const axios = require('axios');
const config = require('../config');

/**
 * Service untuk integrasi data siswa SMAN 1 Gedeg via ScholarGate Identity (DAPODIK)
 * Endpoint: /api/v1/members/lookup?nisn={nisn}
 */
class ScholargateService {
  constructor() {
    this.apiUrl = (process.env.SCHOLARGATE_API_URL || 'https://portal.sman1gedeg.sch.id').replace(/\/+$/, '');
    this.apiKey = process.env.SCHOLARGATE_API_KEY || '';
  }

  /**
   * Menghitung kemiripan (similarity) antara dua nama
   * Menggunakan kombinasi Token Matching & Levenshtein Distance
   * Menghandle singkatan nama seperti "M. Ryan" vs "Muhammad Ardian Ryan"
   * Output: nilai float 0.0 - 1.0 (persentase)
   */
  calculateSimilarity(inputName, officialName) {
    if (!inputName || !officialName) return 0;

    // Normalisasi teks
    const clean = (str) => {
      return str
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\b(m|md|muh|muhamad|moch|mohammad)\b/g, 'muhammad')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const s1 = clean(inputName);
    const s2 = clean(officialName);

    if (s1 === s2) return 1.0;

    // 1. Token Overlap Check (Pengecekan perkata)
    const tokens1 = s1.split(' ').filter(t => t.length > 0);
    const tokens2 = s2.split(' ').filter(t => t.length > 0);

    let matchCount = 0;
    for (const t1 of tokens1) {
      for (const t2 of tokens2) {
        if (t1 === t2 || (t1.length > 3 && t2.length > 3 && (t1.startsWith(t2) || t2.startsWith(t1)))) {
          matchCount++;
          break;
        }
      }
    }

    const tokenScore = tokens1.length > 0 ? matchCount / Math.max(tokens1.length, tokens2.length) : 0;

    // 2. Levenshtein Distance
    const levDistance = (a, b) => {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    };

    const maxLen = Math.max(s1.length, s2.length);
    const levScore = maxLen === 0 ? 1 : 1 - (levDistance(s1, s2) / maxLen);

    // Ambil skor gabungan yang paling representatif
    return Math.max(tokenScore, levScore);
  }

  /**
   * Verifikasi NISN dan Nama Siswa SMAN 1 Gedeg
   * @param {string} nisn 
   * @param {string} inputName 
   * @returns {Promise<{valid: boolean, message: string, studentData?: object}>}
   */
  async verifyStudent(nisn, inputName) {
    const cleanNisn = (nisn || '').trim();
    if (!cleanNisn || cleanNisn.length < 8) {
      return {
        valid: false,
        message: 'Nomor NISN tidak valid (minimal 8-10 digit).'
      };
    }

    if (!this.apiKey) {
      console.warn('[ScholarGate] API Key belum diset di SCHOLARGATE_API_KEY. Melewati verifikasi API...');
      return {
        valid: true,
        isBypassed: true,
        message: 'Verifikasi API dilewati (API Key tidak terkonfigurasi).'
      };
    }

    try {
      const url = `${this.apiUrl}/api/v1/members/lookup?nisn=${encodeURIComponent(cleanNisn)}`;
      const response = await axios.get(url, {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 8000
      });

      if (!response.data || !response.data.found || !response.data.data) {
        // Penting: Jangan oversharing informasi spesifik
        return {
          valid: false,
          message: 'Data siswa tidak ditemukan di database SMAN 1 Gedeg atau bukan siswa aktif.'
        };
      }

      const student = response.data.data;

      // Pastikan role siswa
      if (student.role !== 'siswa') {
        return {
          valid: false,
          message: 'Data terdaftar bukan sebagai siswa aktif.'
        };
      }

      // Hitung similarity nama
      const similarity = this.calculateSimilarity(inputName, student.nama);
      console.log(`[ScholarGate] Validasi NISN ${cleanNisn}: Input "${inputName}" vs Dapodik "${student.nama}" -> Skor: ${(similarity * 100).toFixed(1)}%`);

      // Ambang batas kecocokan minimum: 45% (toleransi singkatan & nama panggilan)
      if (similarity < 0.45) {
        // Anti-oversharing: JANGAN tampilkan student.nama asli di pesan error!
        return {
          valid: false,
          message: 'Nama siswa tidak sesuai dengan data terdaftar pada NISN tersebut di sistem sekolah.'
        };
      }

      return {
        valid: true,
        similarity,
        studentData: {
          nama: student.nama,
          nisn: student.nisn,
          kelas: student.kelas,
          email_sekolah: student.google_email
        }
      };

    } catch (err) {
      if (err.response && err.response.status === 404) {
        return {
          valid: false,
          message: 'NISN tidak terdaftar sebagai siswa SMAN 1 Gedeg.'
        };
      }

      console.error('[ScholarGate API Error]', err.message);
      return {
        valid: false,
        message: 'Gagal melakukan verifikasi ke portal sekolah SMAN 1 Gedeg. Silakan coba beberapa saat lagi.'
      };
    }
  }
}

module.exports = new ScholargateService();
