// Hospital Comparison & Cost Estimation JS
let compareState = {
  hospitals: [],
  stayDays: 3,
  needIcu: false,
  insurance: 'all'
};

const API_BASE = window.location.port === '5501' ? 'http://localhost:3000' : '';

function formatMoney(value) {
  const language = navigator.language || 'en-US';
  const country = language.split('-')[1]?.toUpperCase();
  const settings = { IN: ['INR', 83], GB: ['GBP', 0.79], CA: ['CAD', 1.36], AU: ['AUD', 1.52], EU: ['EUR', 0.92], US: ['USD', 1] };
  const [currency, rate] = settings[country] || settings.IN;
  return new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value * rate);
}

function mapsUrl(hospital) {
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('medadvisor_token');
  if (!token) return window.location.replace('auth.html?mode=signup');
  const authCheck = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!authCheck.ok) {
    localStorage.removeItem('medadvisor_token');
    return window.location.replace('auth.html?mode=signup');
  }
  const savedCompare = localStorage.getItem('med_compare_ids');
  const ids = savedCompare ? JSON.parse(savedCompare) : [];

  if (ids.length === 0) {
    renderEmptyState();
    return;
  }

  // Fetch hospital data
  const res = await fetch(`${API_BASE}/api/hospitals`);
  const data = await res.json();
  if (data.success) {
    compareState.hospitals = data.hospitals.filter(h => ids.includes(h.id));
    renderComparisonTable();
    setupCalculators();
  }
});

function renderEmptyState() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-2xl mx-auto py-24 text-center glass-panel rounded-3xl p-8 border border-slate-800">
      <i data-lucide="sliders" class="w-16 h-16 mx-auto text-sky-400 mb-4 animate-pulse"></i>
      <h2 class="text-2xl font-bold text-white mb-2">No Hospitals Selected for Comparison</h2>
      <p class="text-slate-400 mb-6">Return to the main directory search and select up to 4 hospitals to compare facilities, bed availability, and estimated treatment budgets.</p>
      <a href="index.html" class="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25">
        <i data-lucide="arrow-left" class="w-4 h-4"></i> Browse Hospital Directory
      </a>
    </div>
  `;
  lucide.createIcons();
}

function renderComparisonTable() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  const list = compareState.hospitals;

  container.innerHTML = `
    <div class="space-y-8">
      <!-- Top Actions & Budget Calculator Controls -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 class="text-xl font-bold text-white mb-1">Interactive Budget Estimator</h2>
          <p class="text-slate-400 text-xs">Simulate projected hospital stays and ICU requirements</p>
        </div>

        <div class="flex flex-wrap items-center gap-6 text-sm">
          <!-- Stay Days Slider -->
          <div class="flex items-center gap-3">
            <span class="text-slate-300 text-xs">Est. Stay Duration:</span>
            <input type="range" id="stay-days-range" min="1" max="14" value="${compareState.stayDays}" class="w-32 accent-sky-400 bg-slate-800 rounded-lg cursor-pointer" />
            <span id="stay-days-val" class="text-sky-400 font-bold w-12 text-xs">${compareState.stayDays} Days</span>
          </div>

          <!-- ICU Checkbox -->
          <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input type="checkbox" id="icu-check" ${compareState.needIcu ? 'checked' : ''} class="w-4 h-4 accent-sky-400 rounded bg-slate-900 border-slate-800" />
            Include ICU Stay ($/Day)
          </label>

          <button onclick="clearComparison()" class="text-xs text-rose-400 hover:text-rose-300 font-semibold underline flex items-center gap-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Clear Selection
          </button>
        </div>
      </div>

      <!-- Side-by-Side Comparison Matrix -->
      <div class="overflow-x-auto pb-4">
        <div class="grid grid-cols-1 md:grid-cols-${list.length} gap-6 min-w-[700px]">
          ${list.map(h => {
            const totalEstCost = h.avgConsultationCost + (compareState.needIcu ? h.avgIcuCostPerDay * compareState.stayDays : 0);
            return `
              <div class="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between relative group hover:border-sky-500/40 transition-all">
                <button onclick="removeHospital('${h.id}')" class="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 rounded-lg bg-slate-900/80 border border-slate-800 transition-colors">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>

                <div>
                  <div class="h-36 rounded-2xl overflow-hidden mb-4 relative">
                    <img src="${h.image}" alt="${h.name}" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <span class="absolute bottom-2 left-3 text-xs font-bold text-sky-400">${h.location}</span>
                  </div>

                  <h3 class="text-xl font-bold text-white mb-1">${h.name}</h3>
                  <div class="flex items-center gap-2 text-xs text-amber-400 mb-4">
                    <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${h.rating} (${h.reviewsCount} reviews)
                  </div>

                  <!-- Estimated Cost Card -->
                  <div class="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 mb-6 text-center">
                    <span class="text-slate-400 text-xs uppercase tracking-wider block mb-1">Projected Total Est.</span>
                    <span class="text-3xl font-extrabold text-sky-400">${formatMoney(totalEstCost)}</span>
                    <span class="text-[11px] text-slate-500 block mt-1">Consult: ${formatMoney(h.avgConsultationCost)} | ICU: ${formatMoney(h.avgIcuCostPerDay)}/day</span>
                  </div>

                  <!-- Key Features Matrix -->
                  <div class="space-y-3 text-xs">
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">Emergency Beds</span>
                      <span class="font-bold ${h.emergencyBedsAvailable > 0 ? 'text-emerald-400' : 'text-rose-400'}">${h.emergencyBedsAvailable} Available</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">ICU Capacity</span>
                      <span class="font-bold text-slate-200">${h.icuAvailable} Beds Free</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">Average ER Wait</span>
                      <span class="font-bold text-amber-400">~${h.waitMinutes} mins</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">Price Tier</span>
                      <span class="font-bold text-sky-400">${h.budgetTier}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">Treatment Range</span>
                      <span class="font-bold text-sky-300">${formatMoney(h.estimatedTreatmentCost.min)}-${formatMoney(h.estimatedTreatmentCost.max)}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">Reported Outcomes</span>
                      <span class="font-bold text-emerald-400">${h.successRate}%</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-800/80">
                      <span class="text-slate-400">Procedure Volume</span>
                      <span class="font-bold text-slate-200">${h.procedureVolume.toLocaleString()}</span>
                    </div>

                    <div class="pt-2">
                      <span class="text-slate-400 block mb-2 font-semibold">Specialties Offered:</span>
                      <div class="flex flex-wrap gap-1">
                        ${h.specialties.map(s => `<span class="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-800">${s}</span>`).join('')}
                      </div>
                    </div>

                    <div class="pt-2">
                      <span class="text-slate-400 block mb-2 font-semibold">Insurance Accepted:</span>
                      <div class="flex flex-wrap gap-1">
                        ${h.insuranceAccepted.map(i => `<span class="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 text-[10px]">${i}</span>`).join('')}
                      </div>
                    </div>

                    <div class="pt-2">
                      <span class="text-slate-400 block mb-2 font-semibold">Accreditation & Technology:</span>
                      <div class="flex flex-wrap gap-1">${[...(h.accreditations || []), ...(h.technologies || [])].map(item => `<span class="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 text-[10px]">${item}</span>`).join('')}</div>
                    </div>
                  </div>
                </div>

                <div class="pt-6">
                  <a href="tel:${h.phone}" class="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20">
                    <i data-lucide="phone-call" class="w-4 h-4"></i> Call Direct Admissions
                  </a>
                  <a href="${mapsUrl(h)}" target="_blank" rel="noopener" class="mt-2 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                    <i data-lucide="map-pin" class="w-4 h-4"></i> Get Directions
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

function setupCalculators() {
  const slider = document.getElementById('stay-days-range');
  const valEl = document.getElementById('stay-days-val');
  const icuCheck = document.getElementById('icu-check');

  if (slider) {
    slider.addEventListener('input', (e) => {
      compareState.stayDays = parseInt(e.target.value, 10);
      if (valEl) valEl.innerText = `${compareState.stayDays} Days`;
      renderComparisonTable();
      setupCalculators();
    });
  }

  if (icuCheck) {
    icuCheck.addEventListener('change', (e) => {
      compareState.needIcu = e.target.checked;
      renderComparisonTable();
      setupCalculators();
    });
  }
}

function removeHospital(id) {
  compareState.hospitals = compareState.hospitals.filter(h => h.id !== id);
  const remainingIds = compareState.hospitals.map(h => h.id);
  localStorage.setItem('med_compare_ids', JSON.stringify(remainingIds));

  if (remainingIds.length === 0) {
    renderEmptyState();
  } else {
    renderComparisonTable();
    setupCalculators();
  }
}

function clearComparison() {
  localStorage.removeItem('med_compare_ids');
  renderEmptyState();
}
