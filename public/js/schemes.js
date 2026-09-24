document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('schemes-city');
  const status = document.getElementById('schemes-status');
  const results = document.getElementById('schemes-results');
  if (!cityInput || !status || !results) return;
  let coords = null;
  const api = window.MEDIGO_API_BASE;
  async function load() {
    const params = new URLSearchParams();
    if (coords) { params.set('lat', coords.lat); params.set('lng', coords.lng); }
    else if (cityInput.value.trim()) params.set('city', cityInput.value.trim());
    else { status.textContent = 'Enable location or enter your city to see schemes.'; return; }
    status.textContent = 'Loading scheme information…'; results.replaceChildren();
    try {
      const response = await fetch(`${api}/api/schemes?${params}`); const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not load schemes.');
      cityInput.value = data.city || cityInput.value;
      status.textContent = `${data.city}${data.state ? `, ${data.state}` : ''} · scheme references; check official eligibility.`;
      data.schemes.forEach(scheme => {
        const card = document.createElement('article'); card.className = 'rounded-xl border bg-white p-3 dark:bg-slate-900';
        const title = document.createElement('h3'); title.className = 'font-bold'; title.textContent = scheme.name;
        const copy = document.createElement('p'); copy.className = 'mt-1 text-xs text-slate-600'; copy.textContent = `${scheme.coverage} · ${scheme.hospitalCount} listed local hospitals · Helpline ${scheme.helpline}`;
        const link = document.createElement('a'); link.href = scheme.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'mt-2 inline-block text-xs font-bold text-sky-700'; link.textContent = 'Official scheme information';
        card.append(title, copy, link); results.append(card);
      });
      if (!data.schemes?.length) status.textContent += ' No scheme entries found.';
    } catch (error) { status.textContent = error.message; }
  }
  document.getElementById('schemes-search')?.addEventListener('click', () => { coords = null; load(); });
  document.getElementById('schemes-locate')?.addEventListener('click', () => {
    if (!navigator.geolocation) { status.textContent = 'Location is unavailable in this browser; enter your city.'; return; }
    status.textContent = 'Waiting for location permission…';
    navigator.geolocation.getCurrentPosition(position => { coords = { lat: position.coords.latitude, lng: position.coords.longitude }; load(); }, () => { status.textContent = 'Location permission was not granted. Enter your city instead.'; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });
});
