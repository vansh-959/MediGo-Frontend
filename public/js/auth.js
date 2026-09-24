(() => {
  const modal = document.getElementById('auth-modal'); if (!modal) return;
  const form = document.getElementById('auth-form'); const status = document.getElementById('auth-status'); const submit = document.getElementById('auth-submit');
  const nameWrap = document.getElementById('auth-name-wrap'); const phoneWrap = document.getElementById('auth-phone-wrap'); const otpWrap = document.getElementById('auth-otp-wrap');
  let mode = 'login', stage = 'request';
  const token = () => localStorage.getItem('medigo_auth_token') || '';
  const setMode = next => {
    mode = next; stage = 'request'; const signup = mode === 'signup'; const reset = mode === 'reset';
    nameWrap?.classList.toggle('hidden', !signup); phoneWrap?.classList.toggle('hidden', !signup);
    otpWrap?.classList.toggle('hidden', stage !== 'verify');
    document.getElementById('auth-forgot')?.classList.add('hidden'); document.getElementById('auth-resend')?.classList.toggle('hidden', stage !== 'verify');
    document.getElementById('auth-title').textContent = signup ? 'Create your account' : 'Sign in to MediGo';
    submit.textContent = stage === 'verify' ? (signup ? 'Verify and create account' : 'Verify and sign in') : signup ? 'Send signup code' : 'Send sign-in code';
    if (form.elements.name) form.elements.name.required = signup;
    if (form.elements.phone) form.elements.phone.required = signup;
    if (form.elements.otp) form.elements.otp.required = stage === 'verify';
    status.textContent = '';
  };
  window.openMediGoAuth = (message, initialMode = 'login') => { modal.classList.remove('hidden'); modal.classList.add('flex'); setMode(initialMode); status.textContent = message || (token() ? 'Please sign in again to continue.' : 'Sign in or create an account to continue.'); window.lucide?.createIcons(); };
  document.getElementById('auth-close').addEventListener('click', () => { if (location.pathname.endsWith('/auth.html')) location.href = 'index.html'; else { modal.classList.add('hidden'); modal.classList.remove('flex'); } });
  modal.addEventListener('click', event => { if (event.target === modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } });
  document.getElementById('auth-tab-login').addEventListener('click', () => setMode('login')); document.getElementById('auth-tab-signup').addEventListener('click', () => setMode('signup'));
  document.getElementById('auth-forgot')?.remove();
  document.getElementById('auth-resend')?.addEventListener('click', () => {
    stage = 'request'; if (form.elements.otp) form.elements.otp.required = false;
    otpWrap?.classList.add('hidden'); submitAction();
  });
  async function call(path, body) {
    const response = await fetch(`${window.MEDIGO_API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
    const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`); return data;
  }
  async function submitAction() {
    const fields = Object.fromEntries(new FormData(form)); submit.disabled = true; status.className = 'text-sm text-slate-700'; status.textContent = 'Please wait…';
    try {
      if (stage === 'request') {
        const body = { email: fields.email, purpose: mode };
        if (mode === 'signup') Object.assign(body, { name: fields.name, phone: fields.phone });
        const delivery = await call('/api/auth/send-otp', body); stage = 'verify'; otpWrap.classList.remove('hidden'); form.elements.otp.required = true;
        submit.textContent = mode === 'signup' ? 'Verify and create account' : 'Verify and sign in'; document.getElementById('auth-resend').classList.remove('hidden');
        const channelText = delivery.deliveryChannel === 'phone' ? 'A six-digit code was sent to your phone.' : 'A six-digit code was sent to your email.';
        const channelLabel = document.getElementById('auth-code-channel'); if (channelLabel) channelLabel.textContent = delivery.deliveryChannel === 'phone' ? 'Phone verification code' : 'Email verification code';
        const channelHelp = document.getElementById('auth-code-help'); if (channelHelp) channelHelp.textContent = delivery.deliveryChannel === 'phone' ? 'Use the newest text message code. It expires in 5 minutes.' : 'Use the newest email code. It expires in 5 minutes.';
        status.textContent = `${channelText} It expires in five minutes. Use the newest code.`; return;
      }
      const data = await call('/api/auth/verify-otp', { email: fields.email, otp: fields.otp, purpose: mode });
      localStorage.setItem('medigo_auth_token', data.token); localStorage.setItem('medigo_user', JSON.stringify(data.user || {}));
      const returnTo = localStorage.getItem('medigo_auth_return_to'); localStorage.removeItem('medigo_auth_return_to');
      status.textContent = mode === 'signup' ? 'Account created.' : 'Signed in.'; setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); if (returnTo) location.replace(returnTo); else location.reload(); }, 350);
    } catch (error) { status.className = 'text-sm font-semibold text-rose-700'; status.textContent = error.message || 'Could not complete this request.'; }
    finally { submit.disabled = false; }
  }
  form.addEventListener('submit', event => { event.preventDefault(); submitAction(); });
  if (location.pathname.endsWith('/auth.html')) setMode(new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login');
  document.addEventListener('submit', event => { if (!token() && ['cost-estimate-form'].includes(event.target.id)) { event.preventDefault(); event.stopImmediatePropagation(); window.openMediGoAuth(); } }, true);
  document.addEventListener('submit', event => { if (!token() && event.target.id === 'disease-search-form') { event.preventDefault(); event.stopImmediatePropagation(); window.openMediGoAuth('Sign in or create an account to search the hospital directory.'); } }, true);
  document.addEventListener('click', event => {
    const target = event.target.closest('#mob-nav-map,#mob-nav-cost,#mob-nav-compare,#mob-nav-chat,#mob-nav-report-reader,#floating-chat-trigger,#view-map-btn,#analyze-report-btn,#cost-estimate-submit,#cost-use-location,#schemes-search,#schemes-locate,#compare-selected-btn,[data-filter="saved"],[data-hospital-action="save"],[data-hospital-action="compare"],#open-compare-modal-btn,[onclick*="toggleSavedHospital"],[onclick*="toggleCompareHospital"],[onclick*="openReviewModal"],[onclick*="shareHospital"]');
    if (target && !token()) { event.preventDefault(); event.stopImmediatePropagation(); localStorage.setItem('medigo_auth_return_to', location.href); window.openMediGoAuth(); }
  }, true);
  document.addEventListener('medigo:authrequired', () => { if (!token()) window.openMediGoAuth('Sign in or create an account to use this feature.'); });
  if (!location.pathname.endsWith('/auth.html') && location.hash === '#signin') window.openMediGoAuth();
})();
