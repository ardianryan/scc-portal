const { marked } = require('marked');

// Konfigurasi marked options
marked.setOptions({
  gfm: true,
  breaks: true
});

/**
 * Format string allowed_levels menjadi label bahasa Indonesia baku
 * Contoh: "sma_ma,smk" -> "SMA/MA & SMK Sederajat"
 */
function getDynamicLevelLabel(allowedLevelsStr) {
  const levels = (allowedLevelsStr || 'sma_ma,smk').split(',').map(s => s.trim()).filter(Boolean);
  const labels = [];
  if (levels.includes('sma_ma')) labels.push('SMA/MA');
  if (levels.includes('smk')) labels.push('SMK');
  if (levels.includes('mahasiswa')) labels.push('Mahasiswa');
  if (levels.includes('general')) labels.push('Umum');

  if (labels.length === 0) return 'SMA/MA & SMK Sederajat';
  if (labels.length === 1) return `${labels[0]} Sederajat`;
  if (labels.length === 2) {
    if (labels.includes('SMA/MA') && labels.includes('SMK')) {
      return 'SMA/MA & SMK Sederajat';
    }
    return `${labels[0]} & ${labels[1]}`;
  }
  const last = labels.pop();
  return `${labels.join(', ')}, & ${last}`;
}

/**
 * Menghasilkan konten Markdown Pedoman & Regulasi resmi yang dinamis
 */
function generatePedomanMarkdown(settings = {}) {
  const eventName = settings.event_name || 'Smansage Cybersecurity Competition 2026';
  const levelLabel = getDynamicLevelLabel(settings.allowed_levels);
  const scope = settings.competition_scope || 'Se-Gerbangkertosusila (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan)';
  const maxTeamsPerSchool = parseInt(settings.max_teams_per_school || '3');
  const maxMembers = parseInt(settings.max_team_members || '3');

  return `# TATA TERTIB & REGULASI RESMI KOMPETISI (${eventName})
### *SMAN 1 GEDEG, MOJOKERTO*

Selamat datang di platform resmi **SCC::CTF 2026** ([scc.sman1gedeg.sch.id](https://scc.sman1gedeg.sch.id)). Demi menjaga integritas kompetisi, keamanan infrastruktur, keadilan, serta objektivitas penilaian, panitia memberlakukan regulasi resmi yang mengikat dan wajib dipatuhi oleh seluruh peserta:

---

### KETENTUAN WILAYAH & KUOTA KEPESERTAAN

1. **Cakupan Wilayah Resmi (Gerbangkertosusila)**:
   Kompetisi ini diselenggarakan untuk pelajar di wilayah aglomerasi metropolitan **Gerbangkertosusila**, yang mencakup 6 kabupaten/kota di Jawa Timur:
   * **Gresik** (Kabupaten Gresik)
   * **Bangkalan** (Kabupaten Bangkalan)
   * **Mojokerto** (Kabupaten Mojokerto & Kota Mojokerto)
   * **Surabaya** (Kota Surabaya)
   * **Sidoarjo** (Kabupaten Sidoarjo)
   * **Lamongan** (Kabupaten Lamongan)

2. **Tingkat / Jenjang Peserta**:
   Pendaftaran terbuka untuk peserta jenjang **${levelLabel}** yang terdaftar aktif pada tahun ajaran berjalan di sekolah/institusi pada wilayah Gerbangkertosusila.

3. **Batas Maksimal Kuota per Sekolah / Instansi**:
   Setiap sekolah atau madrasah dibatasi **maksimal mengirimkan ${maxTeamsPerSchool} tim**. Pendaftaran tim ke-${maxTeamsPerSchool + 1} dan seterusnya dari sekolah yang sama akan otomatis ditolak oleh sistem guna menjamin pemerataan kesempatan antar sekolah.

4. **Komposisi Anggota per Tim**:
   Setiap tim terdiri dari 1 Ketua Tim dan dapat memiliki hingga **${maxMembers - 1} Anggota** (total maksimal **${maxMembers} siswa per tim**) yang berasal dari sekolah atau instansi yang sama.

5. **Verifikasi Bukti Identitas**:
   Peserta wajib melampirkan berkas pindai/foto Kartu Tanda Siswa (KTS) / Kartu Pelajar yang masih berlaku, atau Surat Keterangan Siswa Aktif dari kepala sekolah. Khusus siswa SMAN 1 Gedeg, verifikasi identitas berlangsung instan dan otomatis melalui integrasi API DAPODIK ScholarGate.

---

### SISTEM SELEKSI & TAHAP FINAL
> **Penting:** Perolehan akumulasi poin tertinggi dari babak **Practice Level 1, Level 2, dan Level 3** akan menentukan **10 Semifinalis Terbaik** yang berhak melaju ke babak Final!
> 
> * **[Practice Level 1] - 23 Tantangan**: 02 Nov 2026 s/d 08 Nov 2026
> * **[Practice Level 2] - 20 Tantangan**: 09 Nov 2026 s/d 15 Nov 2026
> * **[Practice Level 3] - 15 Tantangan**: 16 Nov 2026 s/d 22 Nov 2026

---

### 1. KEAMANAN INFRASTRUKTUR & JARINGAN
* **Platform Bukan Target Serangan**: Server utama website CTF (\`scc.sman1gedeg.sch.id\`) dan server tantangan (\`ctf.smage.my.id\`) **BUKAN MERUPAKAN TARGET EKSPLOITASI**. Serangan hanya boleh diarahkan ke berkas soal atau instance kontainer yang diberikan oleh sistem saat peserta menekan tombol *Start Instance*.
* **Larangan Keras DoS / DDoS**: Dilarang keras melancarkan serangan *Denial of Service (DoS)*, *Distributed DoS (DDoS)*, *HTTP Request Flooding*, *SYN Flood*, atau tindakan apa pun yang bertujuan membuat server lambat atau tidak dapat diakses oleh peserta lain.
* **Dilarang Mengganggu Peserta Lain**: Dilarang melakukan serangan *Man-in-the-Middle (MitM)*, *traffic sniffing* di jaringan lokal sekolah, meretas perangkat peserta lain, atau membajak akun tim lain.

---

### 2. LARANGAN TOOLS SCANNER & BRUTE-FORCE AGRESIF
Kompetisi ini menguji logika analisis, pemahaman protokol, serta rekayasa keamanan digital, bukan bandwidth atau kecepatan serangan otomatis:
* **Dilarang Menggunakan Tool Otomasi Agresif**:
  * Dilarang menggunakan **\`sqlmap\`** dengan mode multi-threading tinggi atau opsi agresif (\`--crawl\`, \`--batch\`, \`--risk=3\`, \`--level=5\`).
  * Dilarang menggunakan automated vulnerability scanner seperti **\`Nessus\`**, **\`Acunetix\`**, **\`Nuclei\`**, **\`OpenVAS\`**, atau **\`Nikto\`**.
  * Dilarang melakukan *directory/file brute-force* massal (**\`Dirbuster\`**, **\`Gobuster\`**, **\`Feroxbuster\`**, **\`Wfuzz\`**) ke server utama ataupun instance tantangan.
* *Metode yang Dianjurkan:* Gunakan teknik eksploitasi manual, inspeksi *source code*, pemanfaatan terminal Linux/Termux (\`curl\`, \`nc\`, \`python\`), serta pembuatan skrip custom yang terarah dan hemat lalu lintas jaringan.

---

### 3. REGULASI KHUSUS PENGGUNAAN ASISTEN AI (WHITELIST EKSKLUSIF)
SCC CTF 2026 memperbolehkan pemanfaatan kecerdasan buatan (AI) untuk melatih kemampuan riset peserta, dengan batasan ketat demi menjaga kesetaraan kompetisi:

#### HANYA 5 WEB CHATBOT BERIKUT YANG DIIZINKAN (WAJIB FREE TIER):
1. **ChatGPT Free Web** (\`https://chatgpt.com\`)
2. **Google Gemini Free Web** (\`https://gemini.google.com\`)
3. **Microsoft Copilot Free Web** (\`https://copilot.microsoft.com\`)
4. **DeepSeek Free Web** (\`https://chat.deepseek.com\`)
5. **Claude Free Web** (\`https://claude.ai\`)

#### PERANGKAT AI YANG DILARANG KERAS:
* **Dilarang Akun Berbayar**: Dilarang memakai model berbayar (ChatGPT Plus/Team, Claude Pro, Gemini Advanced) demi keadilan bagi semua peserta.
* **Dilarang AI Coding IDE**: Dilarang memakai Cursor, Windsurf, GitHub Copilot di editor, Roo Code, Cline, dsb.
* **Dilarang Agentic AI / AI Otonom**: Dilarang memakai Devin, OpenHands, AutoGPT, Manus, atau agen otonom yang mengeksekusi kode secara mandiri.
* **Dilarang CLI / Terminal AI**: Dilarang memakai Claude Code, Aider, Gemini CLI, atau AI berbasis command-line interface lainnya.

> **Audit Wajib AI:** Setiap nomor soal yang diselesaikan dengan bantuan AI **wajib menyertakan "Public Share Link"** riwayat obrolan AI tersebut di dalam laporan Writeup. Percakapan yang disembunyikan atau tidak dapat diverifikasi akan berakibat pembatalan poin soal terkait.

---

### 4. KETENTUAN LAPORAN WRITEUP & VERIFIKASI JUARA

Peringkat pada papan Scoreboard bersifat **sementara** hingga panitia selesai memverifikasi laporan Writeup resmi dari masing-masing tim.

#### A. Kewajiban Pengumpulan:
* Seluruh tim yang masuk dalam **Top 10 / Jajaran Kandidat Juara** wajib menyusun dan mengunggah dokumen Writeup resmi.
* Writeup berfungsi membuktikan bahwa flag didapatkan secara sah, ilmiah, mandiri, dan dapat dipertanggungjawabkan (bukan dari kebocoran/flag sharing).

#### B. Format Penamaan & Berkas:
* Format berkas wajib berformat **PDF** dengan format penamaan:  
  \`Writeup_SCC2026_[NamaTim].pdf\`
* Sistematika laporan wajib memuat:
  1. Nama & Kategori Soal
  2. Analisis Masalah & Konsep Kerentanan
  3. Audit AI (Nama AI yang digunakan + tautan Public Share Link percakapan)
  4. Perangkat & Alat yang Digunakan (Termux / Linux / Python script / CyberChef)
  5. Langkah-Langkah Eksploitasi Step-by-Step (disertai tangkapan layar pembuktian)
  6. Flag yang Ditemukan: \`SCC{...}\`

#### TAUTAN UNDUH TEMPLATE WRITEUP RESMI:
Peserta diwajibkan menggunakan susunan dan format template resmi yang telah disediakan panitia. Silakan unduh melalui tautan resmi sekolah:  
**[https://sman1gedeg.sch.id/download](https://sman1gedeg.sch.id/download)**

---

### 5. INTEGRITAS, FAIR PLAY & KOLABORASI
* **Strictly No Flag Sharing**: Dilarang keras membocorkan, memberikan, menukar, atau memperjualbelikan flag (\`SCC{...}\`), petunjuk (*hints*), maupun kode eksploitasi antar tim.
* **Kemandirian Tim**: Kerja sama hanya diizinkan antar anggota dalam 1 tim resmi yang sama (maksimal ${maxMembers} siswa per tim).
* **Transparansi Solusi**: Setiap penyelesaian soal yang tidak dapat dijelaskan logikanya oleh tim yang bersangkutan saat sesi verifikasi juri akan langsung dianulir.

---

### 6. SANKSI PELANGGARAN
Panitia dan sistem audit jaringan memiliki rekaman log real-time (*traffic monitoring, container activity, submission timestamps*):
1. **Pelanggaran Ringan** (Request tidak wajar / beban berlebih): Peringatan resmi panitia dan penonaktifan sementara akses akun tim.
2. **Pelanggaran Berat** (Serangan DoS, scanner otomatis, flag sharing, penggunaan AI dilarang/IDE/Agentic, pemalsuan writeup, pendaftaran melebihi kuota sekolah):
   * Diskualifikasi permanen dari kompetisi
   * Pemblokiran alamat IP dan akun platform
   * Pencabutan seluruh gelar juara dan perolehan poin
   * Pelaporan tindakan indisipliner ke pihak sekolah yang bersangkutan

---

> *"Hack for fun, not for win!"*  
> Kemenangan sejati ada pada proses belajar, ketajaman logika, dan integritas moral sebagai insan siber. Selamat bertanding secara jujur dan sportif.
`;
}

const panduanMarkdown = `# Panduan Persiapan Peserta SCC CTF 2026
### SMANSAGE CYBERSECURITY COMPETITION (SCC) - SMAN 1 GEDEG

Selamat datang di arena kompetisi **Smansage Cybersecurity Competition (SCC) 2026**. Sebelum mulai bertanding menaklukkan tantangan di platform ini, pastikan perangkat dan peralatan analisismu sudah siap.

> **Format Flag:** Format penyerahan jawaban pada seluruh tantangan adalah:  
> \`SCC{teks_rahasia_disini}\`

---

### PERJALANAN MENUJU BABAK FINAL (TOP 10 SEMIFINALIS)
Perolehan poin akumulasi tertinggi dari 3 babak latihan resmi berikut akan menentukan **10 Semifinalis Terbaik**:
* **[Practice Level 1] (23 Soal)**: [scc.sman1gedeg.sch.id/games/12](https://scc.sman1gedeg.sch.id/games/12)
* **[Practice Level 2] (20 Soal)**: [scc.sman1gedeg.sch.id/games/13](https://scc.sman1gedeg.sch.id/games/13)
* **[Practice Level 3] (15 Soal)**: [scc.sman1gedeg.sch.id/games/14](https://scc.sman1gedeg.sch.id/games/14)

---

## 1. Jika Mengerjakan via PC / Laptop Windows

Bagi kamu pengguna Windows (10/11), siapkan perkakas dasar berikut:

### A. Mengaktifkan Fitur Netcat (\`nc\`)
Tantangan dinamis (live instance) membutuhkan koneksi soket TCP (misal: \`nc ctf.smage.my.id 39123\`).
* **Cara Cepat (Portable Ncat):**  
  Download \`ncat.exe\` dari Nmap Project (https://nmap.org/dist/ncat-portable-5.59BETA1.zip), ekstrak zip-nya, lalu buka Command Prompt (CMD) atau PowerShell di folder tersebut.
* **Alternatif Rekomendasi (WSL Ubuntu):**  
  Buka PowerShell as Administrator, ketik:
  \`\`\`powershell
  wsl --install
  \`\`\`
  *(Dengan WSL, kamu memiliki lingkungan terminal Linux Ubuntu di dalam Windows).*

### B. Software Pendukung Tambahan:
1. **Python 3**: Download dari https://www.python.org/downloads/ *(Wajib centang **"Add python.exe to PATH"** saat instalasi)*.
2. **Visual Studio Code / Notepad++**: Untuk membuka dan membaca kode soal.
3. **Wireshark**: Untuk menganalisis rekaman paket jaringan Wireshark (.pcap). Download di https://www.wireshark.org.
4. **Web Browser**: Chrome / Firefox / Edge. Manfaatkan shortcut \`Ctrl + U\` (View Source) dan \`F12\` (Inspect Element).

---

## 2. Jika Mengerjakan via PC Mac atau Linux

Lingkungan UNIX (macOS & Linux) adalah lingkungan ideal untuk CTF karena utilitas standarnya sudah terpasang.

### A. Pasang Amunisi Terminal:
* **Pengguna Ubuntu / Debian / Kali Linux:**
  \`\`\`bash
  sudo apt update && sudo apt install -y netcat-openbsd curl wget python3 python3-pip binutils tshark
  \`\`\`
* **Pengguna macOS (via Homebrew):**
  \`\`\`bash
  brew install netcat wireshark python3
  \`\`\`

---

## 3. Jika Mengerjakan via Smartphone Android (Termux)

Bagi peserta yang tidak membawa laptop, Android dapat diubah menjadi terminal Linux mini yang andal menggunakan **Termux**:

1. **Unduh Termux**: Wajib unduh via **F-Droid** (https://f-droid.org/packages/com.termux/), jangan unduh dari Play Store karena versinya usang.
2. **Install Perkakas di Termux:**
   \`\`\`bash
   pkg update && pkg upgrade -y
   pkg install netcat-openbsd python binutils curl wget git -y
   \`\`\`
3. **Koneksi ke Soal Netcat via HP:**
   \`\`\`bash
   nc ctf.smage.my.id 39123
   \`\`\`
4. **Membongkar File yang Diunduh di HP:**
   \`\`\`bash
   strings /sdcard/Download/nama_file.jpg | grep SCC
   \`\`\`
5. **Browser Tambahan:** Gunakan **Google Chrome** atau **Kiwi Browser** (Kiwi Browser mendukung ekstensi *inspect element* & *edit cookie*).

---

## 4. Website Peralatan Online (Bookmark Rekomendasi)

Berikut alat bantu online gratis yang sangat menghemat waktu tanpa perlu instalasi aplikasi:

1. **CyberChef** (https://gchq.github.io/CyberChef/): Pisau lipat digital untuk decode Base64, Hex, Biner, ROT13, XOR, hingga ekstraksi file.
2. **dCode.fr** (https://www.dcode.fr/): Alat identifikasi dan dekripsi sandi kriptografi klasik otomatis (Caesar, Vigenere, Atbash).
3. **JWT.io** (https://jwt.io/): Untuk memeriksa dan menganalisis struktur token JWT.
4. **Dogbolt Decompiler** (https://dogbolt.org/): Decompiler online untuk membaca file biner ELF Linux.
5. **Apackets PCAP Viewer** (https://apackets.com/): Membuka dan menganalisis rekaman paket jaringan Wireshark (.pcap) langsung di browser.

---

### Kunci Menjadi Juara:
1. **Mulai dari Soal Awal**: Kumpulkan poin dari soal-soal fundamental terlebih dahulu untuk membangun ritme tim.
2. **Gunakan Tombol "Start Instance"**: Pada soal bertipe dinamis (Web Instance / Pwn), tekan tombol *Start Instance* untuk menyalakan kontainer latihan tim.
3. **Catat Langkah Eksploitasi**: Tulis metodologi dan simpan tangkapan layar untuk penyusunan laporan Writeup resmi.

*Selamat bertanding, junjung tinggi sportivitas, dan jadilah yang teratas di Scoreboard.*
`;

module.exports = {
  getDynamicLevelLabel,
  getPedomanHtml(settings = {}) {
    return marked.parse(generatePedomanMarkdown(settings));
  },
  getPanduanHtml() {
    return marked.parse(panduanMarkdown);
  }
};
