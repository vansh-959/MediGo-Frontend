(() => {
  const api = window.MEDIGO_API_BASE;
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  const form = document.getElementById('auth-form');
  const status = document.getElementById('auth-status');
  const submit = document.getElementById('auth-submit');
  const nameWrap = document.getElementById('auth-name-wrap');
  const phoneWrap = document.getElementById('auth-phone-wrap');
  const passwordWrap = document.getElementById('auth-password-wrap');
  const otpWrap = document.getElementById('auth-otp-wrap');
  const forgot = document.getElementById('auth-forgot');
  const resend = document.getElementById('auth-resend');
  let mode = 'login';

  const token = () => localStorage.getItem('medigo_auth_token') || '';
  const setMode = (next) => {
    mode = next;
    const signup = mode === 'signup';
    const reset = mode === 'reset';
    nameWrap.classList.toggle('hidden', !signup);
    phoneWrap.classList.toggle('hidden', !signup);
    passwordWrap.classList.toggle('hidden', mode === 'forgot');
    otpWrap.classList.toggle('hidden', !reset);
    forgot.classList.toggle('hidden', mode !== 'login');
    resend.classList.toggle('hidden', !reset);
    document.getElementById('auth-title').textContent = mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset password' : mode === 'reset' ? 'Enter email code' : 'Sign in to MediGo';
    submit.textContent = mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send email code' : mode === 'reset' ? 'Update password' : 'Sign in';
    status.textContent = '';
    form.elements.password.required = mode !== 'forgot';
    form.elements.otp.required = mode === 'reset';
    form.elements.name.required = signup;
    form.elements.phone.required = signup;
  };
  window.openMediGoAuth = (message = '') => {
    modal.classList.remove('hidden'); modal.classList.add('flex');
    status.textContent = message || (token() ? 'Your session may have expired. Please sign in again.' : 'Sign in or create an account to continue.');
    setMode('login'); window.lucide?.createIcons();
  };
  document.getElementById('account-open-btn')?.addEventListener('click', () => { if (token()) { localStorage.removeItem('medigo_auth_token'); localStorage.removeItem('medigo_user'); localStorage.removeItem('medigo_auth_return_to'); location.reload(); return; } window.openMediGoAuth(); });
  document.getElementById('auth-close')?.addEventListener('click', () => { modal.classList.add('hidden'); modal.classList.remove('flex'); });
  modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } });
  document.getElementById('auth-tab-login')?.addEventListener('click', () => setMode('login'));
  document.getElementById('auth-tab-signup')?.addEventListener('click', () => setMode('signup'));
  forgot.addEventListener('click', () => setMode('forgot'));
  resend.addEventListener('click', async () => { setMode('forgot'); await submitAction(); });

  async function submitAction() {
    const fields = Object.fromEntries(new FormData(form));
    status.className = 'text-sm text-slate-700'; status.textContent = 'Please wait…'; submit.disabled = true;
    try {
      if (mode === 'forgot') {
        const result = await call('/api/auth/forgot-password', { email: fields.email });
        if (!result.success) throw new Error(result.error || 'Could not send the email code.');
        setMode('reset'); status.textContent = window.medigoText?.('otpSent') || 'If this email has an account, a 6 digit code was sent. It is valid for 60 seconds.';
        return;
      }
      if (mode === 'reset') {
        const result = await call('/api/auth/reset-password', { email: fields.email, otp: fields.otp, password: fields.password });
        if (!result.success) throw new Error(result.error || 'Code is incorrect or expired.');
        setMode('login'); status.textContent = 'Password changed. Sign in with your new password.'; return;
      }
      const result = await call(mode === 'signup' ? '/api/auth/signup' : '/api/auth/login', fields);
      if (!result.success || !result.token) throw new Error(result.error || 'Could not sign in.');
      localStorage.setItem('medigo_auth_token', result.token);
      localStorage.setItem('medigo_user', JSON.stringify(result.user || {}));
      form.reset();
      document.getElementById('account-label').textContent = 'Sign out';
      status.textContent = 'Signed in. Continue with your request.';
      const returnTo = localStorage.getItem('medigo_auth_return_to');
      localStorage.removeItem('medigo_auth_return_to');
      setTimeout(() => {
        modal.classList.add('hidden'); modal.classList.remove('flex');
        if (returnTo) {
          try {
            const destination = new URL(returnTo, location.origin);
            if (destination.origin === location.origin) location.replace(destination.href);
          } catch { /* Keep the user on the current page if the saved URL is invalid. */ }
        }
      }, 500);
    } catch (error) {
      status.className = 'text-sm font-semibold text-rose-700'; status.textContent = error.message || 'Something went wrong. Try again.';
    } finally { submit.disabled = false; }
  }
  async function call(path, body) {
    const response = await fetch(`${api}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); submitAction(); });
  if (location.hash === '#signin') setTimeout(() => window.openMediGoAuth(), 0);
  const storedUser = JSON.parse(localStorage.getItem('medigo_user') || 'null');
  if (token() && storedUser?.name) document.getElementById('account-label').textContent = 'Sign out';

  // Keep the emergency page and direct emergency call links usable to guests.
  document.addEventListener('submit', (event) => {
    if (!token() && ['cost-estimate-form'].includes(event.target.id)) {
      event.preventDefault(); event.stopImmediatePropagation(); window.openMediGoAuth();
    }
  }, true);
  document.addEventListener('click', (event) => {
    const target = event.target.closest('#mob-nav-map,#mob-nav-compare,#mob-nav-report-reader,#view-map-btn,#analyze-report-btn,#cost-estimate-submit,#compare-selected-btn,[data-filter="saved"],[data-hospital-action="save"],[data-hospital-action="compare"],#open-compare-modal-btn,[onclick*="toggleSavedHospital"],[onclick*="toggleCompareHospital"],[onclick*="openReviewModal"],[onclick*="shareHospital"]');
    if (target && !token()) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (target.matches('[data-filter="saved"]')) localStorage.setItem('medigo_auth_return_to', location.href);
      window.openMediGoAuth();
    }
  }, true);
})();
