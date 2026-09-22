// Main JS Application Logic for Hospital Search, Geolocation & Filters
let state = {
  hospitals: [],
  selectedSpecialty: 'all',
  searchQuery: '',
  maxCostFilter: 200,
  minRatingFilter: 0,
  emergencyOnly: false,
  userCoords: null,
  city: '',
  radiusKm: '',
  facility: '',
  treatmentBudget: '',
  comparedIds: new Set()
};

const API_BASE = window.location.port === '5501' ? 'http://localhost:3000' : '';
let resultsMap;
let resultsMarkers;
let userMarker;

const currencyConfig = {
  IN: { currency: 'INR', rate: 83 },
  GB: { currency: 'GBP', rate: 0.79 },
  CA: { currency: 'CAD', rate: 1.36 },
  AU: { currency: 'AUD', rate: 1.52 },
  EU: { currency: 'EUR', rate: 0.92 },
  US: { currency: 'USD', rate: 1 },
};

function formatMoney(value) {
  const language = navigator.language || 'en-US';
  const country = language.split('-')[1]?.toUpperCase();
  const config = currencyConfig[country] || currencyConfig.IN;
  return new Intl.NumberFormat(language, { style: 'currency', currency: config.currency, maximumFractionDigits: 0 }).format(value * config.rate);
}

function mapsUrl(hospital) {
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Compared Hospitals from LocalStorage
  const savedCompare = localStorage.getItem('med_compare_ids');
  if (savedCompare) {
    state.comparedIds = new Set(JSON.parse(savedCompare));
    updateCompareBadge();
  }

  initializeMap();
  setupEventListeners();
  requireAuthentication();
});

function initializeMap() {
  if (!window.L || !document.getElementById('results-map')) return;
  resultsMap = L.map('results-map').setView([22.9734, 78.6569], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(resultsMap);
  resultsMarkers = L.layerGroup().addTo(resultsMap);
}

function updateResultsMap(hospitals) {
  if (!resultsMap || !resultsMarkers) return;
  resultsMarkers.clearLayers();
  const points = hospitals.map(hospital => [hospital.coordinates.lat, hospital.coordinates.lng]);
  hospitals.forEach(hospital => L.marker([hospital.coordinates.lat, hospital.coordinates.lng]).bindPopup(`<strong>${hospital.name}</strong><br>${hospital.location}<br>Hours: ${hospital.hours}<br>${formatMoney(hospital.avgConsultationCost)} consultation<br><a href="${mapsUrl(hospital)}" target="_blank" rel="noopener">Get directions</a>`).addTo(resultsMarkers));
  if (state.userCoords) {
    if (userMarker) userMarker.remove();
    userMarker = L.circleMarker([state.userCoords.lat, state.userCoords.lng], { radius: 8, color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.9 }).bindPopup('Your location').addTo(resultsMap);
    points.push([state.userCoords.lat, state.userCoords.lng]);
  }
  if (points.length) resultsMap.fitBounds(points, { padding: [30, 30] });
  const status = document.getElementById('map-status');
  if (status) status.textContent = `${hospitals.length} hospitals marked near your search`;
}

async function requireAuthentication() {
  const token = localStorage.getItem('medadvisor_token');
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('invalid session');
    fetchHospitals();
  } catch (error) {
    localStorage.removeItem('medadvisor_token');
    window.location.replace('auth.html?mode=signup');
  }
}

async function ensureSearchAccess() {
  const token = localStorage.getItem('medadvisor_token');
  if (!token) {
    window.location.href = 'auth.html?mode=signup';
    return false;
  }
  return true;
}

function requestLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(false);
    navigator.geolocation.getCurrentPosition(position => {
      state.userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
      const status = document.getElementById('map-status');
      if (status) status.textContent = 'Location active. Results are sorted by distance.';
      resolve(true);
    }, () => {
      const status = document.getElementById('map-status');
      if (status) status.textContent = 'Location permission was not granted. Use city or pincode instead.';
      const city = window.prompt('Location access was not granted. Enter your city or pincode:');
      if (city) {
        state.city = city.trim();
        const cityInput = document.getElementById('city-input');
        if (cityInput) cityInput.value = state.city;
      }
      resolve(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  });
}

// Fetch Hospitals from API
async function fetchHospitals() {
  try {
    const queryParams = new URLSearchParams();
    if (state.selectedSpecialty !== 'all') queryParams.append('specialty', state.selectedSpecialty);
    if (state.searchQuery) queryParams.append('q', state.searchQuery);
    if (state.maxCostFilter < 200) queryParams.append('maxCost', state.maxCostFilter);
    if (state.minRatingFilter > 0) queryParams.append('minRating', state.minRatingFilter);
    if (state.emergencyOnly) queryParams.append('emergencyOnly', 'true');
    if (state.city) queryParams.append('city', state.city);
    if (state.radiusKm) queryParams.append('radiusKm', state.radiusKm);
    if (state.facility) queryParams.append('facility', state.facility);
    if (state.treatmentBudget) queryParams.append('treatmentBudget', state.treatmentBudget);
    if (state.userCoords && state.radiusKm) {
      queryParams.append('lat', state.userCoords.lat);
      queryParams.append('lng', state.userCoords.lng);
    }

    if (state.userCoords && !state.radiusKm) {
      queryParams.append('lat', state.userCoords.lat);
      queryParams.append('lng', state.userCoords.lng);
    }
    const res = await fetch(`${API_BASE}/api/hospitals?${queryParams.toString()}`);
    const data = await res.json();

    if (data.success) {
      state.hospitals = data.hospitals;
        const visibleHospitals = renderHospitals();
        updateResultsMap(visibleHospitals);
    }
  } catch (err) {
    console.error('Error loading hospitals:', err);
  }
}

// Render Hospital Cards Grid
function renderHospitals() {
  const container = document.getElementById('hospitals-grid');
  const countEl = document.getElementById('hospitals-count');
  if (!container) return [];

  let filtered = state.hospitals.filter(h => {
    if (!state.searchQuery) return true;
    const q = state.searchQuery.toLowerCase();
      const diseaseTerms = {
        chest: 'Cardiology', heart: 'Cardiology', headache: 'Neurology', migraine: 'Neurology',
        dizzy: 'Neurology', cancer: 'Oncology', tumor: 'Oncology', fracture: 'Orthopedics',
        bone: 'Orthopedics', child: 'Pediatrics', baby: 'Pediatrics', fever: 'Pediatrics',
      };
      const matchedSpecialty = Object.entries(diseaseTerms).find(([term]) => q.includes(term))?.[1];
      return (
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.specialties.some(s => s.toLowerCase().includes(q)) ||
      (matchedSpecialty && h.specialties.includes(matchedSpecialty))
    );
  });

  if (countEl) countEl.innerText = `${filtered.length} Hospitals Found`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center glass-panel rounded-3xl p-8">
        <i data-lucide="search-x" class="w-16 h-16 mx-auto text-slate-500 mb-4 animate-bounce"></i>
        <h3 class="text-xl font-bold text-white mb-2">No Hospitals Match Your Filter</h3>
        <p class="text-slate-400 max-w-md mx-auto mb-6">Try broadening your specialty selection or increasing the maximum consultation cost filter.</p>
        <button onclick="resetFilters()" class="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25">Reset All Filters</button>
      </div>
    `;
    lucide.createIcons();
    return [];
  }

  container.innerHTML = filtered.map(h => {
    const isCompared = state.comparedIds.has(h.id);
    return `
      <div class="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/80 group">
        <!-- Card Top Image & Badges -->
        <div class="relative h-48 overflow-hidden">
          <img src="${h.image}" alt="${h.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <!-- Rating Badge -->
          <div class="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-lg">
            <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${h.rating} (${h.reviewsCount})
          </div>

          <!-- Emergency Badge -->
          ${h.emergencyBedsAvailable > 0 ? `
            <div class="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ${h.emergencyBedsAvailable} ER Beds Live
            </div>
          ` : `
            <div class="absolute top-4 left-4 bg-rose-500/20 backdrop-blur-md border border-rose-500/40 text-rose-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              Full (ER)
            </div>
          `}

          <div class="absolute bottom-3 left-4 right-4">
            <span class="text-sky-400 text-xs font-bold tracking-wider uppercase">${h.location} • ${h.distanceKm} km away</span>
            <h3 class="text-xl font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">${h.name}</h3>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <p class="text-slate-400 text-xs line-clamp-2">${h.tagline}</p>
          
          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 gap-2 py-2 border-y border-slate-800/80 text-xs">
            <div class="flex items-center gap-2 text-slate-300">
              <i data-lucide="dollar-sign" class="w-4 h-4 text-sky-400"></i>
              <span>Consult: <strong class="text-white font-semibold">${formatMoney(h.avgConsultationCost)}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-slate-300">
              <i data-lucide="badge-check" class="w-4 h-4 text-emerald-400"></i>
              <span>Outcome: <strong class="text-white font-semibold">${h.successRate}%</strong></span>
            </div>
            <div class="flex items-center gap-2 text-slate-300">
              <i data-lucide="hospital" class="w-4 h-4 text-indigo-400"></i>
              <span>Beds: <strong class="text-white font-semibold">${h.totalBeds}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-slate-300">
              <i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>
              <span>Wait ~<strong class="text-white font-semibold">${h.waitMinutes} min</strong></span>
            </div>
            <div class="flex items-center gap-2 text-slate-300">
              <i data-lucide="bed" class="w-4 h-4 text-emerald-400"></i>
              <span>ICU Beds: <strong class="text-white font-semibold">${h.icuAvailable} free</strong></span>
            </div>
            <div class="flex items-center gap-2 text-slate-300">
              <i data-lucide="shield-check" class="w-4 h-4 text-indigo-400"></i>
              <span>Tier: <strong class="text-white font-semibold">${h.budgetTier}</strong></span>
            </div>
          </div>

          <!-- Specialties Pills -->
          <div class="flex flex-wrap gap-1.5">
            ${h.specialties.map(s => `
              <span class="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium">${s}</span>
            `).join('')}
          </div>
            <div class="text-[11px] text-slate-400">Hours: <strong class="text-slate-200">${h.hours}</strong></div>
            <div class="text-[11px] text-slate-400">Treatment estimate: <strong class="text-sky-300">${formatMoney(h.estimatedTreatmentCost.min)}-${formatMoney(h.estimatedTreatmentCost.max)}</strong></div>
            <div class="flex flex-wrap gap-1">${(h.accreditations || []).map(a => `<span class="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">${a}</span>`).join('')}</div>

          <!-- Card Actions -->
          <div class="pt-2 flex items-center gap-2">
            <button onclick="toggleCompare('${h.id}')" class="flex-1 py-2.5 px-3 rounded-xl border ${isCompared ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'} text-xs font-bold flex items-center justify-center gap-2 transition-all">
              <i data-lucide="${isCompared ? 'check-square' : 'sliders'}" class="w-4 h-4"></i>
              ${isCompared ? 'Added to Compare' : 'Compare'}
            </button>
            <a href="tel:${h.phone}" class="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/20">
              <i data-lucide="phone" class="w-4 h-4"></i> Call ER
            </a>
            <a href="${mapsUrl(h)}" target="_blank" rel="noopener" class="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all" aria-label="Get directions to ${h.name}">
              <i data-lucide="map-pin" class="w-4 h-4"></i> Directions
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
  return filtered;
}

// Toggle Compare Selection
function toggleCompare(id) {
  if (state.comparedIds.has(id)) {
    state.comparedIds.delete(id);
  } else {
    if (state.comparedIds.size >= 4) {
      alert('You can compare a maximum of 4 hospitals simultaneously.');
      return;
    }
    state.comparedIds.add(id);
  }
  localStorage.setItem('med_compare_ids', JSON.stringify([...state.comparedIds]));
  updateCompareBadge();
  renderHospitals();
}

// Update Floating Compare Floating Bar Badge
function updateCompareBadge() {
  const bar = document.getElementById('floating-compare-bar');
  const countEl = document.getElementById('compare-count-badge');
  if (!bar) return;

  if (state.comparedIds.size > 0) {
    bar.classList.remove('translate-y-32', 'opacity-0');
    bar.classList.add('translate-y-0', 'opacity-100');
    if (countEl) countEl.innerText = state.comparedIds.size;
  } else {
    bar.classList.remove('translate-y-0', 'opacity-100');
    bar.classList.add('translate-y-32', 'opacity-0');
  }
}

// Setup Filters & Event Listeners
function setupEventListeners() {
  const searchButton = document.getElementById('search-btn');
  if (searchButton) searchButton.addEventListener('click', async () => {
    if (!await ensureSearchAccess()) return;
    if (!state.userCoords) await requestLocation();
    fetchHospitals();
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
    });
  }

  // Cost Slider
  const costSlider = document.getElementById('cost-range-slider');
  const costVal = document.getElementById('cost-range-val');
  if (costSlider) {
    costSlider.addEventListener('input', (e) => {
      state.maxCostFilter = parseInt(e.target.value, 10);
      if (costVal) costVal.innerText = `$${state.maxCostFilter}`;
      if (localStorage.getItem('medadvisor_token')) fetchHospitals();
    });
  }

  // Emergency Toggle
  const erToggle = document.getElementById('er-toggle');
  if (erToggle) {
    erToggle.addEventListener('change', (e) => {
      state.emergencyOnly = e.target.checked;
      if (localStorage.getItem('medadvisor_token')) fetchHospitals();
    });
  }

  ['city-input', 'radius-select', 'facility-select', 'treatment-budget', 'rating-select'].forEach(id => {
    const control = document.getElementById(id);
    if (!control) return;
    control.addEventListener(id === 'city-input' ? 'input' : 'change', async event => {
      if (!await ensureSearchAccess()) return;
      if (id === 'city-input') state.city = event.target.value.trim();
      if (id === 'radius-select') state.radiusKm = event.target.value;
      if (id === 'facility-select') state.facility = event.target.value;
      if (id === 'treatment-budget') state.treatmentBudget = event.target.value;
      if (id === 'rating-select') state.minRatingFilter = Number(event.target.value);
      fetchHospitals();
    });
  });

  // Geolocation Button
  const geoBtn = document.getElementById('geo-loc-btn');
  if (geoBtn) {
    geoBtn.addEventListener('click', async () => {
      if (!await ensureSearchAccess()) return;
      if (navigator.geolocation) {
        geoBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Locating...`;
        lucide.createIcons();
        navigator.geolocation.getCurrentPosition((pos) => {
          state.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          geoBtn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
          geoBtn.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4"></i> Location Active`;
          lucide.createIcons();
          fetchHospitals();
        }, () => {
          alert('Unable to fetch precise location. Displaying default hospital distances.');
          geoBtn.innerHTML = `<i data-lucide="navigation" class="w-4 h-4"></i> Near Me`;
          lucide.createIcons();
        });
      }
    });
  }
}

// Set Specialty Filter from Pills or Body Organs
function selectSpecialty(spec) {
  state.selectedSpecialty = spec;
  
  // Highlight UI pills
  document.querySelectorAll('.specialty-pill').forEach(btn => {
    if (btn.dataset.spec === spec) {
      btn.className = 'specialty-pill px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/30';
    } else {
      btn.className = 'specialty-pill px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-all';
    }
  });

  fetchHospitals();
}

function resetFilters() {
  state.selectedSpecialty = 'all';
  state.searchQuery = '';
  state.maxCostFilter = 200;
  state.emergencyOnly = false;
  state.city = '';
  state.radiusKm = '';
  state.facility = '';
  state.treatmentBudget = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  ['city-input', 'radius-select', 'facility-select', 'treatment-budget', 'rating-select'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = id === 'rating-select' ? '0' : '';
  });
  selectSpecialty('all');
}
