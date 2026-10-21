/**
 * Frontend JavaScript for Registration Form & Wizard Interaction
 */
document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // WIZARD TABS & AGREEMENT INTERACTION
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Hide all tabs
        const tab1 = document.getElementById('tab1');
        const tab2 = document.getElementById('tab2');
        if (tab1) tab1.style.display = targetTab === 'tab1' ? 'block' : 'none';
        if (tab2) tab2.style.display = targetTab === 'tab2' ? 'block' : 'none';

        // Update active class
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  const agreeCheckbox = document.getElementById('agreeCheckbox');
  const btnNext = document.getElementById('btnNext');

  if (agreeCheckbox && btnNext) {
    agreeCheckbox.addEventListener('change', () => {
      btnNext.disabled = !agreeCheckbox.checked;
      if (agreeCheckbox.checked) {
        btnNext.style.opacity = '1';
        btnNext.style.cursor = 'pointer';
      } else {
        btnNext.style.opacity = '0.5';
        btnNext.style.cursor = 'not-allowed';
      }
    });
  }

  // ==========================================
  // REGISTRATION FORM LOGIC: JENJANG & SISWA GEDEG
  // ==========================================
  const levelGradeSelect = document.getElementById('levelGradeSelect');
  const isGedegStudentCheckbox = document.getElementById('isGedegStudentCheckbox');
  const institutionInput = document.getElementById('institutionInput');
  const nisnLabel = document.getElementById('nisnLabel');
  const nisnInput = document.getElementById('nisnInput');
  const nisnHint = document.getElementById('nisnHint');
  const classGradeLabel = document.getElementById('classGradeLabel');
  const classGradeInput = document.getElementById('classGradeInput');
  const docUploadInput = document.getElementById('docUploadInput');
  const docRequiredMark = document.getElementById('docRequiredMark');
  const docUploadHint = document.getElementById('docUploadHint');
  const docUploadSection = document.getElementById('docUploadSection');

  const updateFormByLevelAndSchool = () => {
    const isGedeg = isGedegStudentCheckbox ? isGedegStudentCheckbox.checked : false;
    const level = levelGradeSelect ? levelGradeSelect.value : 'sma_ma';

    if (isGedeg) {
      // Kunci nama sekolah menjadi SMAN 1 Gedeg
      if (institutionInput) {
        institutionInput.value = 'SMAN 1 Gedeg';
        institutionInput.readOnly = true;
        institutionInput.style.backgroundColor = 'var(--bg-card-subtle)';
      }
      if (nisnLabel) nisnLabel.innerHTML = 'NISN Siswa SMAN 1 Gedeg <span class="req">*</span>';
      if (nisnInput) {
        nisnInput.placeholder = 'Contoh: 0071234567 (10 digit)';
        nisnInput.required = true;
      }
      if (nisnHint) nisnHint.textContent = 'Data NISN & nama akan diverifikasi dengan data sekolah.';
      if (classGradeLabel) classGradeLabel.innerHTML = 'Tingkat / Kelas (Contoh: X, XI, XII)';

      // Siswa Gedeg yang lolos verifikasi TIDAK WAJIB upload kartu pelajar
      if (docRequiredMark) docRequiredMark.style.display = 'none';
      if (docUploadInput) docUploadInput.required = false;
      if (docUploadHint) {
        docUploadHint.innerHTML = '<span class="badge badge-success" style="font-size: 0.75rem;">Verifikasi Otomatis Aktif</span> Siswa SMAN 1 Gedeg tidak perlu mengunggah kartu pelajar jika data NISN tervalidasi.';
      }
    } else {
      // Luar SMAN 1 Gedeg
      if (institutionInput) {
        if (institutionInput.value === 'SMAN 1 Gedeg') institutionInput.value = '';
        institutionInput.readOnly = false;
        institutionInput.style.backgroundColor = '';
        institutionInput.placeholder = level === 'mahasiswa' ? 'Contoh: Institut Teknologi Sepuluh Nopember' : (level === 'general' ? 'Contoh: Umum / Komunitas Cyber' : 'Contoh: SMAN 2 Mojokerto');
      }

      if (level === 'mahasiswa') {
        if (nisnLabel) nisnLabel.innerHTML = 'NIM / Nomor Induk Mahasiswa <span class="req">*</span>';
        if (nisnInput) nisnInput.placeholder = 'Nomor Induk Mahasiswa (NIM)';
        if (classGradeLabel) classGradeLabel.innerHTML = 'Program Studi & Semester';
        if (docUploadHint) docUploadHint.innerHTML = 'Wajib melampirkan foto/scan <strong>Kartu Tanda Mahasiswa (KTM)</strong> aktif.';
      } else if (level === 'general') {
        if (nisnLabel) nisnLabel.innerHTML = 'NIK / Nomor Identitas (KTP/SIM) <span class="req">*</span>';
        if (nisnInput) nisnInput.placeholder = 'Nomor KTP / SIM / Paspor';
        if (classGradeLabel) classGradeLabel.innerHTML = 'Pekerjaan / Instansi / Domisili';
        if (docUploadHint) docUploadHint.innerHTML = 'Wajib melampirkan foto/scan <strong>KTP / SIM / Paspor</strong> aktif.';
      } else {
        // SMA/MA atau SMK
        if (nisnLabel) nisnLabel.innerHTML = 'NISN / Nomor Pelajar <span class="req">*</span>';
        if (nisnInput) nisnInput.placeholder = 'Nomor NISN Pelajar';
        if (classGradeLabel) classGradeLabel.innerHTML = 'Kelas & Jurusan (Contoh: XI RPL 1)';
        if (docUploadHint) docUploadHint.innerHTML = 'Wajib melampirkan foto/scan <strong>Kartu Pelajar</strong> atau Surat Keterangan Siswa Aktif.';
      }

      // Wajib upload berkas untuk non-Gedeg
      if (docRequiredMark) docRequiredMark.style.display = 'inline';
      if (docUploadInput) docUploadInput.required = true;
    }
  };

  if (isGedegStudentCheckbox) {
    isGedegStudentCheckbox.addEventListener('change', updateFormByLevelAndSchool);
  }
  if (levelGradeSelect) {
    levelGradeSelect.addEventListener('change', updateFormByLevelAndSchool);
  }
  updateFormByLevelAndSchool();

  // ==========================================
  // DRAG & DROP FILE UPLOAD ENHANCEMENT
  // ==========================================
  const fileDropzone = document.getElementById('fileDropzone');
  const dropzoneEmpty = document.getElementById('dropzoneEmpty');
  const dropzonePreview = document.getElementById('dropzonePreview');
  const previewFilename = document.getElementById('previewFilename');
  const previewFilesize = document.getElementById('previewFilesize');
  const previewThumbContainer = document.getElementById('previewThumbContainer');
  const btnRemoveFile = document.getElementById('btnRemoveFile');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSelectedFile = (file) => {
    if (!file) return;

    // Cek batas ukuran maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran berkas melebihi 5 MB! Silakan pilih berkas yang lebih kecil.');
      if (docUploadInput) docUploadInput.value = '';
      return;
    }

    if (previewFilename) previewFilename.textContent = file.name;
    if (previewFilesize) previewFilesize.textContent = formatFileSize(file.size);

    if (previewThumbContainer) {
      previewThumbContainer.innerHTML = '';
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.alt = file.name;
          img.className = 'preview-thumb-img';
          previewThumbContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      } else {
        // PDF or document icon
        const icon = document.createElement('span');
        icon.className = 'preview-thumb-icon';
        icon.textContent = '📄';
        previewThumbContainer.appendChild(icon);
      }
    }

    if (dropzoneEmpty) dropzoneEmpty.style.display = 'none';
    if (dropzonePreview) dropzonePreview.style.display = 'flex';
  };

  const clearSelectedFile = () => {
    if (docUploadInput) docUploadInput.value = '';
    if (dropzoneEmpty) dropzoneEmpty.style.display = 'flex';
    if (dropzonePreview) dropzonePreview.style.display = 'none';
    if (previewThumbContainer) previewThumbContainer.innerHTML = '';
  };

  if (fileDropzone && docUploadInput) {
    // Drag & Drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropzone.classList.remove('dragover');
      });
    });

    fileDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        docUploadInput.files = files;
        handleSelectedFile(files[0]);
      }
    });

    // Native file input change
    docUploadInput.addEventListener('change', () => {
      if (docUploadInput.files && docUploadInput.files.length > 0) {
        handleSelectedFile(docUploadInput.files[0]);
      } else {
        clearSelectedFile();
      }
    });

    // Remove file button
    if (btnRemoveFile) {
      btnRemoveFile.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearSelectedFile();
      });
    }

    // Keyboard navigation (Enter / Space trigger input)
    fileDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        docUploadInput.click();
      }
    });
  }

  // Password matching validation
  if (pwd && pwdConfirm) {
    const checkPasswords = () => {
      if (pwdConfirm.value && pwd.value !== pwdConfirm.value) {
        if (pwdMismatch) pwdMismatch.style.display = 'block';
        pwdConfirm.style.borderColor = 'var(--color-error)';
      } else {
        if (pwdMismatch) pwdMismatch.style.display = 'none';
        pwdConfirm.style.borderColor = 'var(--border-color)';
      }
    };

    pwd.addEventListener('input', checkPasswords);
    pwdConfirm.addEventListener('input', checkPasswords);

    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        if (pwd.value !== pwdConfirm.value) {
          e.preventDefault();
          alert('Password dan Ulangi Password tidak sama!');
          pwdConfirm.focus();
        }
      });
    }
  }

  // Print ticket handler on success page
  const btnPrintTicket = document.getElementById('btnPrintTicket');
  if (btnPrintTicket) {
    btnPrintTicket.addEventListener('click', () => {
      window.print();
    });
  }
});
