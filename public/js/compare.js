const compareState = { hospitals: [], minimum: 2, maximum: 4 };
const API_BASE = window.MEDIGO_API_BASE;

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '');
    return value && typeof value === 'object' ? value : fallback;
  } catch {
    return fallback;
  }
}

function escapeCompareText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function formatCompareMoney(value) {
  if (value == null || value === '') return 'Not listed';
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0
    ? `₹${amount.toLocaleString('en-IN')}`
    : 'Not listed';
}

function getSelectedIds() {
  const raw = readJson('med_compare_ids', []);
  return [...new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === 'string' && id) : [])].slice(0, compareState.maximum);
}

function saveCompareSelection() {
  const ids = compareState.hospitals.map((hospital) => hospital.id || hospital.placeId).filter(Boolean);
  const records = Object.fromEntries(compareState.hospitals.map((hospital) => [hospital.id || hospital.placeId, hospital]));
  localStorage.setItem('med_compare_ids', JSON.stringify(ids));
  localStorage.setItem('med_compare_hospitals', JSON.stringify(records));
}

document.addEventListener('DOMContentLoaded', loadSelectedHospitals);

async function loadSelectedHospitals() {
  const stored = readJson('med_compare_hospitals', {});
  const ids = getSelectedIds();
  let selected = ids.map((id) => stored[id]).filter((hospital) => hospital && typeof hospital === 'object');
  const missingIds = ids.filter((id) => !selected.some((hospital) => (hospital.id || hospital.placeId) === id));

  if (missingIds.length) {
    try {
      const response = await fetch(`${API_BASE}/api/hospitals`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.hospitals)) {
        selected = [...selected, ...data.hospitals.filter((hospital) => missingIds.includes(hospital.id))];
      }
    } catch (error) {
      console.warn('Could not reload comparison hospitals:', error.message);
    }
  }

  compareState.hospitals = selected.slice(0, compareState.maximum);
  saveCompareSelection();
  renderComparePage();
}

function renderComparePage() {
  if (compareState.hospitals.length < compareState.minimum) {
    renderSelectionHelp();
    return;
  }
  renderComparison();
}

function renderSelectionHelp() {
  const container = document.getElementById('compare-container');
  const status = document.getElementById('compare-status');
  if (!container) return;
  const count = compareState.hospitals.length;
  status.textContent = `${count} of at least ${compareState.minimum} hospitals selected`;
  const selected = count
    ? `<div class="mb-4 space-y-2">${compareState.hospitals.map((hospital) => `
        <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <span class="min-w-0 truncate text-sm font-bold">${escapeCompareText(hospital.name || 'Selected hospital')}</span>
          <button type="button" class="remove-compare rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50" data-hospital-id="${escapeCompareText(hospital.id || hospital.placeId)}">Remove</button>
        </div>`).join('')}</div>`
    : '';
  container.innerHTML = `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><i data-lucide="columns-2" class="h-6 w-6"></i></div>
      <h2 class="mt-4 text-xl font-extrabold">Select at least 2 hospitals</h2>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Go back to hospital results and tap <strong>Compare</strong> on two or more hospital cards. Your selection is kept here while you choose.</p>
      ${selected}
      <div class="flex flex-wrap gap-2">
        <a href="index.html#hospital-directory" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 text-sm font-bold text-white"><i data-lucide="search" class="h-4 w-4"></i>Choose hospitals</a>
        ${count ? '<button id="clear-compare" type="button" class="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700">Clear selection</button>' : ''}
      </div>
    </div>`;
  container.querySelectorAll('.remove-compare').forEach((button) => {
    button.addEventListener('click', () => removeCompareHospital(button.dataset.hospitalId));
  });
  document.getElementById('clear-compare')?.addEventListener('click', clearCompareSelection);
  window.lucide?.createIcons?.();
}

function renderComparison() {
  const container = document.getElementById('compare-container');
  const status = document.getElementById('compare-status');
  if (!container) return;
  const hospitals = compareState.hospitals.slice(0, compareState.maximum);
  status.textContent = `Comparing ${hospitals.length} hospitals`;
  container.innerHTML = `
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-xs text-slate-600">Details shown are what the directory lists.</p>
      <button id="clear-compare" type="button" class="rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Clear all</button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      ${hospitals.map((hospital) => {
        const id = hospital.id || hospital.placeId || '';
        const imageUrl = typeof hospital.image === 'string' && /^https:\/\//i.test(hospital.image) ? hospital.image : '';
        const mapUrl = typeof hospital.mapUrl === 'string' && /^https:\/\/www\.google\.com\/maps\//i.test(hospital.mapUrl) ? hospital.mapUrl : '';
        const specialties = Array.isArray(hospital.specialties) ? hospital.specialties : [];
        const insurance = Array.isArray(hospital.insuranceAccepted) ? hospital.insuranceAccepted : [];
        const costMin = hospital.estimatedTreatmentCost?.min;
        const costMax = hospital.estimatedTreatmentCost?.max;
        const cost = costMin != null || costMax != null
          ? `${formatCompareMoney(costMin)} – ${formatCompareMoney(costMax)}`
          : 'Not listed';
        return `<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          ${imageUrl ? `<img src="${escapeCompareText(imageUrl)}" alt="${escapeCompareText(hospital.name)}" class="h-40 w-full object-cover" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.classList.remove('hidden')">` : ''}
          <div class="${imageUrl ? 'hidden ' : ''}flex h-40 items-center justify-center bg-sky-50 text-4xl" aria-label="Hospital photo unavailable" role="img">🏥</div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-2"><h2 class="text-base font-extrabold">${escapeCompareText(hospital.name || 'Hospital')}</h2><button type="button" class="remove-compare rounded-lg p-2 text-rose-700 hover:bg-rose-50" data-hospital-id="${escapeCompareText(id)}" aria-label="Remove ${escapeCompareText(hospital.name)} from comparison"><i data-lucide="x" class="h-4 w-4"></i></button></div>
            <p class="mt-1 text-xs text-slate-600">${escapeCompareText(hospital.location || hospital.city || 'Location not listed')}</p>
            <dl class="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100 px-3 text-sm">
              ${compareRow('Rating', hospital.rating != null && Number.isFinite(Number(hospital.rating)) ? `★ ${Number(hospital.rating).toFixed(1)}` : 'Not listed')}
              ${compareRow('Estimated procedure cost', cost)}
              ${compareRow('Consultation fee', formatCompareMoney(hospital.avgConsultationCost))}
              ${compareRow('ICU beds listed', hospital.icuAvailable == null ? 'Not listed' : hospital.icuAvailable)}
              ${compareRow('Emergency beds listed', hospital.emergencyBedsAvailable == null ? 'Not listed' : hospital.emergencyBedsAvailable)}
              ${compareRow('Distance', hospital.distanceKm != null && Number.isFinite(Number(hospital.distanceKm)) ? `${Number(hospital.distanceKm).toFixed(1)} km` : 'Not available')}
            </dl>
            <div class="mt-3"><p class="text-xs font-bold text-slate-700">Departments</p><p class="mt-1 text-xs leading-relaxed text-slate-600">${escapeCompareText(specialties.join(', ') || 'Not listed')}</p></div>
            <div class="mt-3"><p class="text-xs font-bold text-slate-700">Schemes / insurance</p><p class="mt-1 text-xs leading-relaxed text-slate-600">${escapeCompareText(insurance.join(', ') || 'Not listed')}</p></div>
            <div class="mt-4 flex gap-2">${hospital.phone ? `<a href="tel:${escapeCompareText(String(hospital.phone).replace(/[^+\\d]/g, ''))}" class="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white">Call</a>` : ''}${mapUrl ? `<a href="${escapeCompareText(mapUrl)}" target="_blank" rel="noopener noreferrer" class="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-sky-700 px-3 text-xs font-bold text-white">Directions</a>` : ''}</div>
          </div>
        </article>`;
      }).join('')}
    </div>`;
  container.querySelectorAll('.remove-compare').forEach((button) => {
    button.addEventListener('click', () => removeCompareHospital(button.dataset.hospitalId));
  });
  document.getElementById('clear-compare')?.addEventListener('click', clearCompareSelection);
  window.lucide?.createIcons?.();
}

function compareRow(label, value) {
  return `<div class="flex items-start justify-between gap-3 py-2"><dt class="text-xs text-slate-600">${escapeCompareText(label)}</dt><dd class="text-right text-xs font-bold text-slate-900">${escapeCompareText(value)}</dd></div>`;
}

function removeCompareHospital(id) {
  compareState.hospitals = compareState.hospitals.filter((hospital) => (hospital.id || hospital.placeId) !== id);
  saveCompareSelection();
  renderComparePage();
}

function clearCompareSelection() {
  compareState.hospitals = [];
  saveCompareSelection();
  renderComparePage();
}
