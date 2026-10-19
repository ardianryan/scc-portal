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
