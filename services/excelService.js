const ExcelJS = require('exceljs');

class ExcelService {
  /**
   * Menghasilkan file Excel rekapitulasi data pendaftar lengkap
   */
  async generateParticipantsExcel(participants, teams, settings) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SCC::CTF Registration Portal';
    workbook.lastModifiedBy = 'Panitia SCC SMAN 1 Gedeg';
    workbook.created = new Date();

    // Sheet 1: Seluruh Peserta
    const pSheet = workbook.addWorksheet('Data Peserta Lengkap', {
      views: [{ state: 'frozen', ySplit: 3 }]
    });

    // Judul Header Laporan
    pSheet.mergeCells('A1:J1');
    const titleCell = pSheet.getCell('A1');
    titleCell.value = `REKAPITULASI PENDAFTARAN - ${settings.event_name || 'SCC::CTF 2026'}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF141414' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    pSheet.getRow(1).height = 30;

    pSheet.mergeCells('A2:J2');
    const subTitleCell = pSheet.getCell('A2');
    subTitleCell.value = `Diekspor pada: ${new Date().toLocaleString('id-ID')} | Total: ${participants.length} Peserta`;
    subTitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFFFFFFF' } };
    subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF252525' } };
    subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    pSheet.getRow(2).height = 20;

    // Header Kolom
    const headers = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Nama Lengkap', key: 'full_name', width: 28 },
      { header: 'Kategori', key: 'category_label', width: 18 },
      { header: 'Sekolah / Instansi', key: 'institution', width: 30 },
      { header: 'NIS / NISN / ID', key: 'nisn_or_id', width: 18 },
      { header: 'Kelas / Tingkat', key: 'class_grade', width: 16 },
      { header: 'WhatsApp', key: 'phone_wa', width: 18 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Username GZCTF', key: 'username_gzctf', width: 22 },
      { header: 'Status Akun', key: 'gzctf_status', width: 16 },
      { header: 'Nama Tim (Jika Beregu)', key: 'team_name', width: 24 },
      { header: 'Link Berkas Identitas (S3)', key: 'doc_url', width: 38 }
    ];

    const headerRow = pSheet.getRow(3);
    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h.header;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00AA85' } }; // Brand Teal GZCTF
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
      pSheet.getColumn(idx + 1).width = h.width;
    });
    headerRow.height = 24;

    // Data Rows
    participants.forEach((p, idx) => {
      const row = pSheet.getRow(idx + 4);
      
      let catLabel = 'Internal SMANSAGE';
      if (p.category === 'external_school') catLabel = 'Sekolah Lain';
      if (p.category === 'general') catLabel = 'Umum / Mahasiswa';

      row.values = [
        idx + 1,
        p.full_name,
        catLabel,
        p.institution,
        p.nisn_or_id || '-',
        p.class_grade || '-',
        p.phone_wa,
        p.email,
        p.username_gzctf,
        p.gzctf_status === 'success' ? 'Terkoneksi GZCTF' : p.gzctf_status,
        p.team_name || (p.is_team_leader ? 'Individu' : '-'),
        p.doc_url || '-'
      ];

      // Zebra striping
      const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9';
      for (let col = 1; col <= 12; col++) {
        const cell = row.getCell(col);
        cell.font = { name: 'Arial', size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.border = {
          top: { style: 'hair' },
          left: { style: 'thin' },
          bottom: { style: 'hair' },
          right: { style: 'thin' }
        };
        if (col === 1 || col === 3 || col === 5 || col === 6 || col === 10) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
      row.height = 20;
    });

    return workbook.xlsx.writeBuffer();
  }
}

module.exports = new ExcelService();
