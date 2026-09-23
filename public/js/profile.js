document.addEventListener('DOMContentLoaded', async() => {
    const apiBase = window.MEDIGO_API_BASE;
    const token = localStorage.getItem('medadvisor_token');
    const message = document.getElementById('profile-message');
    if (!token) return window.location.href = 'auth.html';
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const response = await fetch(`${apiBase}/api/auth/me`, { headers });
    const data = await response.json();
    if (!data.success) return window.location.href = 'auth.html';
    document.getElementById('name').value = data.user.name || '';
    document.getElementById('email').value = data.user.email || '';
    document.getElementById('phone').value = data.user.phone || '';
    document.getElementById('city').value = data.user.city || '';
    document.querySelectorAll('.profile-input').forEach(input => input.className = 'mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none focus:border-sky-400 disabled:opacity-60');

    document.getElementById('profile-form').onsubmit = async event => {
        event.preventDefault();
        const update = await fetch(`${apiBase}/api/auth/profile`, { method: 'PATCH', headers, body: JSON.stringify({ name: name.value, phone: phone.value, city: city.value }) });
        const result = await update.json();
        message.textContent = result.success ? 'Profile saved.' : result.error;
    };

    document.getElementById('use-location').onclick = () => navigator.geolocation?.getCurrentPosition(async position => {
        const update = await fetch(`${apiBase}/api/auth/profile`, { method: 'PATCH', headers, body: JSON.stringify({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }) });
        const result = await update.json();
        message.textContent = result.success ? 'Location saved for nearby recommendations.' : result.error;
    }, () => { message.textContent = 'Location permission was not granted.'; });

    document.getElementById('logout').onclick = () => {
        localStorage.removeItem('medadvisor_token');
        window.location.href = 'index.html';
    };
});