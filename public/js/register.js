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
  // REGISTRATION FORM LOGIC
  // ==========================================
  const catSelect = document.getElementById('categorySelect');
  const internalFields = document.getElementById('internalFields');
  const externalFields = document.getElementById('externalFields');
  const classSelectInternal = document.getElementById('classSelectInternal');
  const nisnInternal = document.getElementById('nisnInternal');
  const nisnExternal = document.getElementById('nisnExternal');
  const instExternal = document.getElementById('instExternal');
  const docUploadInput = document.getElementById('docUploadInput');
  const docRequiredMark = document.getElementById('docRequiredMark');

  const pwd = document.getElementById('pwd');
  const pwdConfirm = document.getElementById('pwdConfirm');
  const pwdMismatch = document.getElementById('pwdMismatch');
  const regForm = document.getElementById('regForm');

  if (catSelect) {
    const updateCategoryFields = () => {
      const isInternal = catSelect.value === 'internal';
      if (isInternal) {
        if (internalFields) internalFields.style.display = 'block';
        if (externalFields) externalFields.style.display = 'none';
        if (classSelectInternal) classSelectInternal.required = true;
        if (nisnInternal) nisnInternal.required = true;
        if (instExternal) instExternal.required = false;
        if (nisnExternal) nisnExternal.required = false;
        if (docUploadInput) docUploadInput.required = false;
        if (docRequiredMark) docRequiredMark.style.display = 'none';
      } else {
        if (internalFields) internalFields.style.display = 'none';
        if (externalFields) externalFields.style.display = 'block';
        if (classSelectInternal) classSelectInternal.required = false;
        if (nisnInternal) nisnInternal.required = false;
        if (instExternal) instExternal.required = true;
        if (nisnExternal) nisnExternal.required = true;
        if (docUploadInput) docUploadInput.required = true;
        if (docRequiredMark) docRequiredMark.style.display = 'inline';
      }
    };

    catSelect.addEventListener('change', updateCategoryFields);
    updateCategoryFields(); // Init on page load
  }

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
