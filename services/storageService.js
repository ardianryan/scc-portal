const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');
const path = require('path');
const crypto = require('crypto');

/**
 * Storage Service terintegrasi S3 Compatible (IDCloudHost Object Storage)
 */
class StorageService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  initClient() {
    if (config.S3_ACCESS_KEY && config.S3_SECRET_KEY) {
      this.client = new S3Client({
        endpoint: config.S3_ENDPOINT,
        region: config.S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY,
          secretAccessKey: config.S3_SECRET_KEY
        },
        forcePathStyle: true // Diperlukan untuk endpoint Ceph / MinIO / IDCloudHost
      });
    }
  }

  /**
   * Mengunggah berkas buffer ke S3
   * @param {Buffer} fileBuffer Buffer data file
   * @param {string} originalName Nama asli file
   * @param {string} mimeType Tipe MIME (cth: image/png, application/pdf)
   * @param {string} category Kategori peserta (internal / external_school / general)
   * @param {string} identifier NISN atau Username
   * @returns {Promise<{success: boolean, url?: string, key?: string, error?: string}>}
   */
  async uploadDocument(fileBuffer, originalName, mimeType, category = 'dokumen', identifier = 'identitas') {
    if (!this.client) {
      this.initClient();
    }

    if (!this.client) {
      return {
        success: false,
        error: 'S3 Client belum terkonfigurasi. Pastikan S3_ACCESS_KEY dan S3_SECRET_KEY telah disetel.'
      };
    }

    try {
      const ext = path.extname(originalName).toLowerCase() || '.png';
      const cleanIdent = (identifier || 'doc').replace(/[^a-zA-Z0-9_-]/g, '_');
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const timestamp = Date.now();

      // Struktur sub-direktori: scc-ctfreg/<category>/<identifier>-<timestamp>-<random><ext>
      const filename = `${cleanIdent}_${timestamp}_${randomSuffix}${ext}`;
      const prefix = config.S3_PATH_PREFIX ? `${config.S3_PATH_PREFIX}/${category}` : `${category}`;
      const s3Key = `${prefix}/${filename}`.replace(/\/+/g, '/');

      const command = new PutObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read'
      });

      await this.client.send(command);

      // Bentuk URL publik akses berkas
      // S3_PUBLIC_DOMAIN = https://is3-storage.smage.my.id
      // Hasil URL: https://is3-storage.smage.my.id/scc-ctfreg/external_school/0071234567_1729320000_abcd1234.png
      const publicUrl = `${config.S3_PUBLIC_DOMAIN}/${s3Key}`.replace(/([^:]\/)\/+/g, '$1');

      return {
        success: true,
        key: s3Key,
        url: publicUrl
      };
    } catch (err) {
      console.error('[StorageService Upload Error]', err);
      return {
        success: false,
        error: err.message || 'Gagal mengunggah berkas ke server penyimpanan S3.'
      };
    }
  }
}

module.exports = new StorageService();
