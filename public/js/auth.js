document.addEventListener('DOMContentLoaded', () => {
  const apiBase = window.location.port === '5501' ? 'http://localhost:3000' : '';
  const form = document.getElementById('auth-form');
  const message = document.getElementById('auth-message');
  const toast = document.getElementById('auth-toast');
  let mode = new URLSearchParams(window.location.search).get('mode') === 'login' ? 'login' : 'signup';

  function showToast(text, type) {
    toast.textContent = text;
    toast.className = `fixed right-5 top-5 z-50 max-w-sm rounded-2xl border px-5 py-4 text-sm font-semibold shadow-2xl ${type === 'success' ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' : 'border-rose-400/50 bg-rose-500/15 text-rose-200'}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add('hidden'), 4500);
  }

  const setMode = nextMode => {
    mode = nextMode;
    const signup = mode === 'signup';
    document.getElementById('auth-title').textContent = signup ? 'Create your account' : 'Welcome back';
    document.getElementById('auth-subtitle').textContent = signup ? 'Save your patient preferences and get recommendations near you.' : 'Sign in to save preferences and receive location-aware recommendations.';
    ['name-field', 'phone-field', 'city-field'].forEach(id => document.getElementById(id).classList.toggle('hidden', !signup));
    document.getElementById('login-tab').className = signup ? 'rounded-lg px-3 py-2 text-xs font-bold text-slate-400' : 'rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950';
    document.getElementById('signup-tab').className = signup ? 'rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950' : 'rounded-lg px-3 py-2 text-xs font-bold text-slate-400';
    document.getElementById('forgot-button').classList.toggle('hidden', signup);
    document.getElementById('auth-submit').textContent = signup ? 'Create account' : 'Sign in';
  };

  document.querySelectorAll('.auth-input').forEach(input => input.className = 'mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none focus:border-sky-400');
  document.getElementById('login-tab').onclick = () => setMode('login');
  document.getElementById('signup-tab').onclick = () => setMode('signup');

  form.onsubmit = async event => {
    event.preventDefault();
    const payload = { email: document.getElementById('email').value, password: document.getElementById('password').value };
    if (mode === 'signup') Object.assign(payload, {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      city: document.getElementById('city').value,
    });

    try {
      const response = await fetch(`${apiBase}/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.success) {
        message.textContent = data.error || 'Authentication failed.';
        showToast(data.error || 'Authentication failed.', 'error');
        return;
      }
      localStorage.setItem('medadvisor_token', data.token);
      message.textContent = mode === 'signup' ? 'Account created successfully.' : 'Signed in successfully.';
      showToast(mode === 'signup' ? 'Signup successful.' : 'Login successful.', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 700);
    } catch (error) {
      const errorMessage = 'Cannot reach the server. Open http://localhost:3000 or start the API server.';
      message.textContent = errorMessage;
      showToast(errorMessage, 'error');
    }
  };

  document.getElementById('forgot-button').onclick = async () => {
    const emailValue = email.value.trim();
    if (!emailValue) {
      message.textContent = 'Enter your email first.';
      showToast('Enter your email first.', 'error');
      return;
    }
    window.location.href = `reset-password.html?email=${encodeURIComponent(emailValue)}`;
  };

  setMode(mode);
});
