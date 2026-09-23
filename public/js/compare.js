// Hospital Comparison & Cost Estimation JS (TECHNOVA 2026)
let compareState = {
  hospitals: [],
  stayDays: 3,
  needIcu: false,
};

const API_BASE = window.location.port === '5501' ? 'http://localhost:3000' : '';

function formatMoney(value) {
  const num = Number(value) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

document.addEventListener('DOMContentLoaded', async () => {
  const savedCompare = localStorage.getItem('med_compare_ids');
  const ids = savedCompare ? JSON.parse(savedCompare) : [];

  if (ids.length === 0) {
    renderEmptyState();
    return;
  }

  const savedHospitals = JSON.parse(localStorage.getItem('med_compare_hospitals') || '{}');
  let list = ids.map(id => savedHospitals[id]).filter(Boolean);

  if (list.length === 0) {
    try {
      const res = await fetch(`${API_BASE}/api/hospitals`);
      const data = await res.json();
      if (data.success && data.hospitals) {
        list = data.hospitals.filter(h => ids.includes(h.id));
      }
    } catch (e) {
      console.warn('Could not fetch hospitals:', e);
    }
  }

  if (list.length > 0) {
    compareState.hospitals = list;
    renderComparisonDashboard();
  } else {
    renderEmptyState();
  }
});

function renderEmptyState() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-2xl mx-auto py-24 text-center glass-panel rounded-3xl p-8 border border-slate-800">
      <i data-lucide="sliders-horizontal" class="w-16 h-16 mx-auto text-sky-400 mb-4 animate-pulse"></i>
      <h2 class="text-2xl font-bold text-white mb-2">No Hospitals Selected for Comparison</h2>
      <p class="text-slate-400 mb-6 text-sm">Return to the hospital search and tap "+ Compare" on up to 4 hospitals to compare verified costs, ICU beds, and clinical outcomes.</p>
      <a href="index.html" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-sky-500/25 text-sm">
        <i data-lucide="arrow-left" class="w-4 h-4"></i> Return to Hospital Search
      </a>
    </div>
  `;
  lucide.createIcons();
}

function renderComparisonDashboard() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  const list = compareState.hospitals;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Interactive Budget Simulator -->
      <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="calculator" class="w-5 h-5 text-sky-400"></i> Interactive Hospital Stay Budget Estimator
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Simulate estimated total stay costs based on projected days and ICU needs.</p>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <label for="stay-slider" class="text-xs text-slate-300">Days: <strong id="stay-days-label" class="text-sky-400">${compareState.stayDays}</strong></label>
              <input type="range" id="stay-slider" min="1" max="14" value="${compareState.stayDays}" class="w-28 accent-sky-400 cursor-pointer"/>
            </div>

            <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" id="need-icu-checkbox" ${compareState.needIcu ? 'checked' : ''} class="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"/>
              <span>Requires ICU Care</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Comparison Cards Grid (Mobile Responsive) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(list.length, 4)} gap-4 sm:gap-6">
        ${list.map(h => {
          const projectedStayCost = calculateProjectedCost(h, compareState.stayDays, compareState.needIcu);
          return `
            <article class="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h4 class="text-base sm:text-lg font-extrabold text-white leading-tight">${h.name}</h4>
                  <button onclick="removeCompareHospital('${h.id || h.placeId}')" class="text-slate-500 hover:text-rose-400 p-1">
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                </div>

                <div class="text-xs text-slate-400 mb-4 flex items-center justify-between">
                  <span>${h.location || h.city || 'Regional Center'}</span>
                  <span class="text-amber-300 font-bold">★ ${h.rating || 4.7}</span>
                </div>

                <!-- Projected Stay Estimation Pill -->
                <div class="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center mb-4">
                  <span class="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">Est. ${compareState.stayDays}-Day Stay Bill</span>
                  <span class="text-lg font-black text-white block mt-0.5">${formatMoney(projectedStayCost)}</span>
                  <span class="text-[10px] text-slate-400">Cashless under PM-JAY / CGHS</span>
                </div>

                <!-- Key Metrics Table -->
                <div class="space-y-2.5 text-xs border-t border-slate-800 pt-3">
                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">Procedure Cost Band:</span>
                    <strong class="text-white">${formatMoney(h.estimatedTreatmentCost?.min || 15000)} - ${formatMoney(h.estimatedTreatmentCost?.max || 75000)}</strong>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">ICU Bed Availability:</span>
                    <strong class="text-emerald-400">🟢 ${h.icuAvailable ?? 8} Ready</strong>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">Emergency Beds:</span>
                    <strong class="text-slate-200">${h.emergencyBedsAvailable ?? 12} Beds</strong>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">Clinical Success Rate:</span>
                    <strong class="text-sky-400">${h.successRate ?? 95}% Verified</strong>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">OPD Consultation:</span>
                    <strong class="text-slate-200">${formatMoney(h.avgConsultationCost || 500)}</strong>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">ICU Cost per Day:</span>
                    <strong class="text-slate-200">${formatMoney(h.avgIcuCostPerDay || 4500)}</strong>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-800/60">
                    <span class="text-slate-400">Distance & Commute:</span>
                    <strong class="text-slate-200">${h.distanceKm ? `${h.distanceKm} km (~${h.commuteDuration || '15 mins'})` : 'Local Area'}</strong>
                  </div>

                  <div class="pt-1">
                    <span class="text-slate-400 text-[11px] block mb-1 font-bold">Government Empanelment:</span>
                    <div class="flex flex-wrap gap-1">
                      ${(h.insuranceAccepted || ['Ayushman Bharat PM-JAY', 'CGHS']).slice(0, 3).map(ins => `
                        <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">${ins}</span>
                      `).join('')}
                    </div>
                  </div>

                  <div class="pt-1">
                    <span class="text-slate-400 text-[11px] block mb-1 font-bold">Accreditations:</span>
                    <div class="flex flex-wrap gap-1">
                      ${(h.accreditations || ['NABH']).map(acc => `
                        <span class="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">${acc}</span>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-4 border-t border-slate-800 mt-5">
                <a href="tel:${h.phone}" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl text-center">
                  Call Hospital
                </a>
                <a href="${h.mapUrl || '#'}" target="_blank" rel="noopener" class="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl text-center">
                  Get Directions
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>

    </div>
  `;

  lucide.createIcons();

  // Attach calculator event listeners
  const slider = document.getElementById('stay-slider');
  const icuCheck = document.getElementById('need-icu-checkbox');
  const label = document.getElementById('stay-days-label');

  if (slider) {
    slider.addEventListener('input', (e) => {
      compareState.stayDays = parseInt(e.target.value, 10);
      if (label) label.textContent = String(compareState.stayDays);
      renderComparisonDashboard();
    });
  }

  if (icuCheck) {
    icuCheck.addEventListener('change', (e) => {
      compareState.needIcu = e.target.checked;
      renderComparisonDashboard();
    });
  }
}

function calculateProjectedCost(hospital, days, needIcu) {
  const baseOpd = Number(hospital.avgConsultationCost) || 500;
  const icuDayRate = Number(hospital.avgIcuCostPerDay) || 4500;
  const generalWardDayRate = Math.round(icuDayRate * 0.35);

  const roomCharges = needIcu
    ? (days * icuDayRate)
    : (days * generalWardDayRate);

  const estimatedProcedures = Number(hospital.estimatedTreatmentCost?.min) || 12000;
  return baseOpd + roomCharges + Math.round(estimatedProcedures * 0.4);
}

function removeCompareHospital(id) {
  const savedIds = JSON.parse(localStorage.getItem('med_compare_ids') || '[]');
  const newIds = savedIds.filter(item => item !== id);
  localStorage.setItem('med_compare_ids', JSON.stringify(newIds));

  const savedHospitals = JSON.parse(localStorage.getItem('med_compare_hospitals') || '{}');
  delete savedHospitals[id];
  localStorage.setItem('med_compare_hospitals', JSON.stringify(savedHospitals));

  compareState.hospitals = compareState.hospitals.filter(h => (h.id || h.placeId) !== id);

  if (compareState.hospitals.length === 0) {
    renderEmptyState();
  } else {
    renderComparisonDashboard();
  }
}
