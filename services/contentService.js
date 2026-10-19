const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Konfigurasi marked options
marked.setOptions({
  gfm: true,
  breaks: true
});

const pedomanMarkdown = `# 🛡️ TATA TERTIB & REGULASI RESMI KOMPETISI (SCC::CTF 2026)
### *Smansage Cybersecurity Competition: SMAN 1 GEDEG*

Selamat datang di platform resmi **SCC::CTF 2026** ([scc.sman1gedeg.sch.id](https://scc.sman1gedeg.sch.id)). Demi menjaga integritas, keamanan infrastruktur, keadilan, serta objektivitas penilaian, panitia memberlakukan regulasi resmi yang mengikat dan wajib dipatuhi oleh seluruh peserta:

---

### 🏆 SISTEM SELEKSI & TAHAP FINAL
> 📌 **Penting:** Perolehan akumulasi poin tertinggi dari babak **Practice Level 1, Level 2, dan Level 3** akan menentukan **10 Semifinalis Terbaik** yang berhak melaju ke babak Final!
> 
> * **[Practice Level 1] - 23 Tantangan**: 02 Nov 2026 s/d 08 Nov 2026
> * **[Practice Level 2] - 20 Tantangan**: 09 Nov 2026 s/d 15 Nov 2026
> * **[Practice Level 3] - 15 Tantangan**: 16 Nov 2026 s/d 22 Nov 2026

---

### ⛔ 1. KEAMANAN INFRASTRUKTUR & JARINGAN
* **Platform Bukan Target Serangan**: Server utama website CTF (\`scc.sman1gedeg.sch.id\`) dan server tantangan (\`ctf.smage.my.id\`) **BUKAN MERUPAKAN TARGET EKSPLOITASI**. Serangan hanya boleh diarahkan ke berkas soal atau instance kontainer yang diberikan oleh sistem saat peserta mengklik tombol *Start Instance*.
* **Larangan Keras DoS / DDoS**: Dilarang keras melancarkan serangan *Denial of Service (DoS)*, *Distributed DoS (DDoS)*, *HTTP Request Flooding*, *SYN Flood*, atau tindakan apa pun yang bertujuan membuat server lambat atau tidak dapat diakses oleh peserta lain.
* **Dilarang Mengganggu Peserta Lain**: Dilarang melakukan serangan *Man-in-the-Middle (MitM)*, sniffing lalu lintas jaringan di WiFi sekolah, meretas perangkat peserta lain, atau mengutak-atik akun tim lain.

---

### 🚫 2. LARANGAN TOOLS SCANNER & BRUTE-FORCE AGRESIF
Kompetisi ini menguji logika analisis, pemahaman protokol, serta rekayasa keamanan digital, bukan bandwidth atau kecepatan serangan otomatis:
* **Dilarang Menggunakan Tool Otomasi Agresif**:
  * ❌ Dilarang menggunakan **\`sqlmap\`** dengan mode multi-threading tinggi atau opsi agresif (\`--crawl\`, \`--batch\`, \`--risk=3\`, \`--level=5\`).
  * ❌ Dilarang menggunakan automated vulnerability scanner seperti **\`Nessus\`**, **\`Acunetix\`**, **\`Nuclei\`**, **\`OpenVAS\`**, atau **\`Nikto\`**.
  * ❌ Dilarang melakukan *directory/file brute-force* massal (**\`Dirbuster\`**, **\`Gobuster\`**, **\`Feroxbuster\`**, **\`Wfuzz\`**) ke server utama ataupun instance tantangan.
* *Metode yang Dianjurkan:* Gunakan teknik eksploitasi manual, inspeksi *source code*, pemanfaatan terminal Linux/Termux (\`curl\`, \`nc\`, \`python\`), serta pembuatan skrip custom yang terarah dan hemat lalu lintas jaringan.

---

### 🤖 3. REGULASI KHUSUS PENGGUNAAN ASISTEN AI (WHITELIST EKSKLUSIF)
SCC CTF 2026 memperbolehkan pemanfaatan kecerdasan buatan (AI) untuk melatih kemampuan *prompt engineering* dan riset peserta, dengan batasan ketat demi menjaga kesetaraan kompetisi:

#### ✅ HANYA 5 WEB CHATBOT BERIKUT YANG DIIZINKAN (WAJIB FREE TIER):
1. **ChatGPT Free Web** (\`https://chatgpt.com\`)
2. **Google Gemini Free Web** (\`https://gemini.google.com\`)
3. **Microsoft Copilot Free Web** (\`https://copilot.microsoft.com\`)
4. **DeepSeek Free Web** (\`https://chat.deepseek.com\`)
5. **Claude Free Web** (\`https://claude.ai\`)

#### ❌ PERANGKAT AI YANG DILARANG KERAS:
* **Dilarang Akun Berbayar**: Dilarang memakai model berbayar (ChatGPT Plus/Team/Enterprise, Claude Pro, Gemini Advanced) demi keadilan bagi semua peserta.
* **Dilarang AI Coding IDE**: Dilarang memakai Cursor, Windsurf, GitHub Copilot di editor, Roo Code, Cline, dsb.
* **Dilarang Agentic AI / AI Otonom**: Dilarang memakai Devin, OpenHands, AutoGPT, Manus, atau agen otonom yang mengeksekusi kode secara mandiri.
* **Dilarang CLI / Terminal AI**: Dilarang memakai Claude Code, Aider, Gemini CLI, atau AI berbasis command-line interface lainnya.

> 📌 **Audit Wajib AI:** Setiap nomor soal yang diselesaikan dengan bantuan AI **wajib menyertakan "Public Share Link"** riwayat obrolan AI tersebut di dalam laporan Writeup. Percakapan yang disembunyikan atau tidak dapat diverifikasi akan berakibat pembatalan poin soal terkait!

---

### 📝 4. KETENTUAN LAPORAN WRITEUP & VERIFIKASI JUARA

Peringkat pada papan Scoreboard bersifat **sementara** hingga panitia selesai memverifikasi laporan Writeup resmi dari masing-masing tim.

#### A. Kewajiban Pengumpulan:
* Seluruh tim yang masuk dalam **Top 10 / Jajaran Kandidat Juara** wajib menyusun dan mengunggah dokumen Writeup resmi.
* Writeup berfungsi membuktikan bahwa flag didapatkan secara sah, ilmiah, mandiri, dan dapat dipertanggungjawabkan (bukan dari kebocoran/flag sharing).

#### B. Format Penamaan & Berkas:
* Format berkas wajib berformat **PDF** dengan format penamaan:  
  \`Writeup_SCC2026_[NamaTim].pdf\`
* Sistematika laporan wajib memuat:
  1. **Nama & Kategori Soal**
  2. **Analisis Masalah & Konsep Kerentanan**
  3. **Audit AI** (Nama AI yang digunakan + tautan Public Share Link percakapan)
  4. **Perangkat & Alat yang Digunakan** (Termux / Linux / Python script / CyberChef)
  5. **Langkah-Langkah Eksploitasi Step-by-Step (disertai Screenshot pembuktian)**
  6. **Flag yang Ditemukan**: \`SCC{...}\`

#### 📥 TAUTAN UNDUH FORMAT / TEMPLATE WRITEUP RESMI:
Peserta diwajibkan menggunakan susunan dan format template resmi yang telah disediakan panitia. Silakan unduh melalui tautan resmi sekolah:  
👉 **[https://sman1gedeg.sch.id/download](https://sman1gedeg.sch.id/download)**

---

### 🤝 5. INTEGRITAS, FAIR PLAY & KOLABORASI
* **Strictly No Flag Sharing**: Dilarang keras membocorkan, memberikan, menukar, memperjualbelikan flag (\`SCC{...}\`), petunjuk (*hints*), maupun kode eksploitasi antar tim.
* **Kemandirian Tim**: Kerja sama hanya diizinkan antar anggota dalam 1 tim resmi yang sama (maksimal 3 siswa per tim).
* **Transparansi Solusi**: Setiap penyelesaian soal yang tidak dapat dijelaskan logikanya oleh tim yang bersangkutan saat sesi verifikasi juri akan langsung dianulir.

---

### ⚖️ 6. SANKSI PELANGGARAN
Panitia dan sistem audit jaringan memiliki rekaman log real-time (*traffic monitoring, container activity, submission timestamps*):
1. **Pelanggaran Ringan** (Request tidak wajar / beban berlebih): Peringatan resmi panitia dan penonaktifan sementara akses akun tim.
2. **Pelanggaran Berat** (Serangan DoS, scanner otomatis, flag sharing, penggunaan AI dilarang/IDE/Agentic, pemalsuan writeup):
   * ❌ **DISKUALIFIKASI PERMANEN DARI KOMPETISI**
   * ❌ Pemblokiran alamat IP dan akun platform
   * ❌ Pencabutan seluruh gelar juara dan perolehan poin
   * ❌ Pelaporan tindakan indisipliner ke pihak Kesiswaan SMAN 1 Gedeg

---

> ### 🏁 *"Hack for fun, not for win!"*  
> Kemenangan sejati ada pada proses belajar, ketajaman logika, dan integritas moral sebagai insan siber. Selamat bertanding, buktikan kehebatan analisismu secara jujur dan sportif! 🏆🚩
`;

const panduanMarkdown = `# 🚀 Panduan Persiapan Peserta SCC CTF 2026 🛡️
### SMANSAGE CYBERSECURITY COMPETITION (SCC) - SMAN 1 GEDEG

Halo Calon Cyber Warrior Smansage! 👋  
Selamat datang di arena kompetisi **Smansage Cybersecurity Competition (SCC) 2026**. Sebelum mulai bertanding menaklukkan tantangan di platform ini, pastikan perangkat dan amunisi analisismu sudah siap tempur.

> 💡 **Ingat:** Format penyerahan jawaban (flag) pada seluruh tantangan adalah:  
> \`SCC{teks_rahasia_disini}\`

---

### 🏆 PERJALANAN MENUJU BABAK FINAL (TOP 10 SEMIFINALIS)
Perolehan poin akumulasi tertinggi dari 3 platform latihan resmi berikut akan menentukan **10 Semifinalis Terbaik**:
* 🔗 **[Practice Level 1] (23 Soal)**: [scc.sman1gedeg.sch.id/games/12](https://scc.sman1gedeg.sch.id/games/12)
* 🔗 **[Practice Level 2] (20 Soal)**: [scc.sman1gedeg.sch.id/games/13](https://scc.sman1gedeg.sch.id/games/13)
* 🔗 **[Practice Level 3] (15 Soal)**: [scc.sman1gedeg.sch.id/games/14](https://scc.sman1gedeg.sch.id/games/14)

---

## 💻 1. Jika Mengerjakan via PC / Laptop Windows

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
  *(Dengan WSL, kamu serasa memiliki sistem operasi Linux Kali/Ubuntu di dalam Windows).*

### B. Software Pendukung Tambahan:
1. **Python 3**: Download dari https://www.python.org/downloads/ *(Wajib centang **"Add python.exe to PATH"** saat instalasi)*.
2. **Visual Studio Code / Notepad++**: Untuk membuka dan membaca kode soal.
3. **Wireshark**: Untuk menganalisis paket rekaman lalu lintas jaringan (.pcap). Download di https://www.wireshark.org.
4. **Web Browser**: Chrome / Firefox / Edge. Kuasai shortcut \`Ctrl + U\` (View Source) dan \`F12\` (Inspect Element).

---

## 🍎 / 🐧 2. Jika Mengerjakan via PC Mac atau Linux

Lingkungan UNIX (macOS & Linux) adalah lingkungan terbaik untuk bermain CTF karena peralatan standarnya sudah terpasang.

### A. Pasang Amunisi Terminal:
* **Pengguna Ubuntu / Debian / Kali Linux:**
  \`\`\`bash
  sudo apt update && sudo apt install -y netcat-openbsd curl wget python3 python3-pip binutils tshark
  pip3 install requests pycryptodome pwntools --break-system-packages
  \`\`\`

* **Pengguna macOS (Apple Silicon M1/M2/M3 & Intel):**  
  Pastikan sudah memasang Homebrew (https://brew.sh), lalu jalankan:
  \`\`\`bash
  brew install netcat python wireshark curl
  pip3 install requests pycryptodome pwntools
  \`\`\`

### B. Perintah Dasar yang Wajib Dipahami:
* Menghubungkan ke tantangan soket TCP: \`nc ctf.smage.my.id <PORT>\`
* Mengekstrak teks tersembunyi di file biner/gambar: \`strings nama_file | grep SCC\`
* Mengekstrak file arsip: \`unzip file.zip\` atau \`tar -xvf file.tar.gz\`

---

## 📱 3. Jika Mengerjakan via HP Android (Termux)

Sekitar 85%–95% soal dapat diselesaikan langsung dari smartphone Android menggunakan kombinasi **Termux + Web Browser**.

### A. Instalasi Aplikasi Termux:
> ⚠️ **PENTING:** Jangan gunakan Termux dari Google Play Store (sudah usang). Download dari **F-Droid**:  
> https://f-droid.org/packages/com.termux/

### B. 1 Baris Perintah Lengkap Memasang Senjata:
Buka aplikasi Termux, copy-paste baris perintah sakti berikut, lalu tekan **Enter**:

\`\`\`bash
pkg update -y && pkg install -y python netcat-openbsd curl wget git binutils xxd tshark radare2 && pip install requests pycryptodome
\`\`\`

### C. Cara Pakai di HP:
1. **Menjawab Soal Dynamic Instance (Netcat):**  
   Cukup ketik di Termux:
   \`\`\`bash
   nc ctf.smage.my.id 34567
   \`\`\`
   *(Ganti \`34567\` dengan nomor port yang muncul saat kamu menekan tombol Start Instance).*
2. **Membongkar File yang Di-download di HP:**
   \`\`\`bash
   strings /sdcard/Download/nama_file.jpg | grep SCC
   \`\`\`
3. **Browser Tambahan di HP:**  
   Gunakan **Google Chrome** atau **Kiwi Browser** (Kiwi Browser mendukung ekstensi inspect element & edit cookie).

---

## 🌐 4. Website Peralatan Rahasia (Wajib Disimpan di Bookmark!)

Berikut alat bantu online gratis yang sangat menghemat waktu tanpa perlu instalasi aplikasi berat:

1. 🍳 **CyberChef** (https://gchq.github.io/CyberChef/): Pisau lipat digital untuk decode Base64, Hex, Biner, ROT13, XOR, hingga ekstraksi file.
2. 🕵️ **dCode.fr** (https://www.dcode.fr/): Alat identifikasi dan dekripsi sandi kriptografi klasik otomatis (Caesar, Vigenere, Atbash).
3. 🎫 **JWT.io** (https://jwt.io/): Untuk memeriksa dan memodifikasi struktur payload JSON Web Token.
4. 🐕 **Dogbolt Decompiler** (https://dogbolt.org/): Decompiler online! Upload file biner atau ELF Linux, dan website ini akan langsung memperlihatkan source code C aslinya.
5. 📊 **Apackets PCAP Viewer** (https://apackets.com/): Membuka dan menganalisis rekaman paket jaringan Wireshark (.pcap) langsung di browser.

---

### 🏆 3 Kunci Menjadi Juara:
1. **Mulai dari Kategori Misc & Soal Awal**: Kumpulkan poin dari soal-soal mudah terlebih dahulu untuk memicu kepercayaan diri tim.
2. **Gunakan Tombol "Start Instance"**: Pada soal bertipe dinamis (Web Instance / Pwn), tekan tombol *Start Instance* di dashboard untuk menyalakan kontainer latihan pribadimu.
3. **Catat Langkah Eksploitasi**: Tulis metodologi dan simpan screenshot untuk bahan penyusunan laporan Writeup resmi!

*Selamat bertanding, junjung tinggi sportivitas, dan jadilah yang teratas di Scoreboard!* 🔥
`;

module.exports = {
  getPedomanHtml() {
    return marked.parse(pedomanMarkdown);
  },
  getPanduanHtml() {
    return marked.parse(panduanMarkdown);
  }
};
