// MedAdvisor Main Frontend Logic (TECHNOVA 2026)
// Mobile-First Disease Discovery, Theme Engine (Light/Dark), Voice Recognition & Comparison

const API_BASE = window.MEDIGO_API_BASE;

let appState = {
    hospitals: [],
    filteredHospitals: [],
    selectedFilter: 'all',
    selectedBudgetCaps: new Set(),
    sortBy: 'rank',
    currentQuery: '',
    userCoords: null,
    detectedLocationName: 'Chandigarh Region',
    currentIntent: null,
    comparedIds: new Set(),
    comparedMap: new Map(),
    currentLanguage: 'en',
    currentTheme: 'dark',
    activeView: 'cards', // 'cards' | 'map'
};

let resultsMap = null;
let mapMarkersGroup = null;
let userLocationMarker = null;

// Multi-language UI Dictionaries (English, Hindi, Punjabi)
const TRANSLATIONS = {
    en: {
        headerSubtitle: "National Healthcare Discovery",
        heroBadge: "Government Healthcare Discovery & Hospital Recommendation",
        heroTitlePrefix: "Find the right hospital for",
        heroTitleHighlight: "your exact illness",
        heroDescription: "Describe any disease, symptom, or budget in everyday words (Hindi, Punjabi, English). Our clinical AI matches nearest verified hospitals with live ICU beds & treatment costs.",
        inputPlaceholder: "Type disease or condition, e.g. Kidney treatment under 2 lakh in Chandigarh...",
        searchBtn: "Find Best Nearest Hospitals",
        quickLabel: "Quick Condition Shortcuts (Tap to Search)",
        resultsTitle: "Recommended Nearest Hospitals",
        accountBtn: "Sign In",
        locateText: "Using GPS Location",
        readySearch: "Ready to search across India",
    },
    hi: {
        headerSubtitle: "राष्ट्रीय स्वास्थ्य सेवा खोज पोर्टल",
        heroBadge: "सरकारी स्वास्थ्य सेवा खोज एवं अस्पताल सिफारिश प्रणाली",
        heroTitlePrefix: "अपनी बीमारी के लिए खोजें",
        heroTitleHighlight: "सबसे सही और नजदीकी अस्पताल",
        heroDescription: "अपनी बीमारी, लक्षण या बजट किसी भी भाषा (हिन्दी, पंजाबी, अंग्रेजी) में लिखें। हमारा AI आपके रोग के आधार पर आईसीयू बेड, लागत और नजदीकी अस्पताल तुरंत दिखाएगा।",
        inputPlaceholder: "अपनी बीमारी लिखें, जैसे: 2 लाख में चंडीगढ़ में पथरी का इलाज, दिल का दर्द...",
        searchBtn: "नजदीकी अस्पताल खोजें",
        quickLabel: "त्वरित रोग शॉर्टकट (टैप करके खोजें)",
        resultsTitle: "अनुशंसित नजदीकी अस्पताल",
        accountBtn: "लॉगिन",
        locateText: "वर्तमान जीपीएस स्थान सक्रिय",
        readySearch: "पूरे भारत में खोजने के लिए तैयार",
    },
    pa: {
        headerSubtitle: "ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਸੇਵਾ ਖੋਜ ਪੋਰਟਲ",
        heroBadge: "ਸਰਕਾਰੀ ਸਿਹਤ ਸੇਵਾ ਖੋਜ ਅਤੇ ਹਸਪਤਾਲ ਸਿਫਾਰਸ਼ ਪ੍ਰਣਾਲੀ",
        heroTitlePrefix: "ਆਪਣੀ ਬਿਮਾਰੀ ਲਈ ਲੱਭੋ",
        heroTitleHighlight: "ਸਭ ਤੋਂ ਵਧੀਆ ਅਤੇ ਨੇੜਲਾ ਹਸਪਤਾਲ",
        heroDescription: "ਕਿਸੇ ਵੀ ਬਿਮਾਰੀ ਜਾਂ ਲੱਛਣ ਨੂੰ ਆਮ ਬੋਲਚਾਲ (ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਅੰਗਰੇਜ਼ੀ) ਵਿੱਚ ਲਿਖੋ। AI ਮਾਹਿਰ ਡਾਕਟਰ, ਖਰਚੇ ਅਤੇ ਖਾਲੀ ICU ਬੈੱਡਾਂ ਅਨੁਸਾਰ ਨੇੜਲੇ ਹਸਪਤਾਲ ਦਿਖਾਏਗਾ।",
        inputPlaceholder: "ਆਪਣੀ ਬਿਮਾਰੀ ਲਿਖੋ, ਜਿਵੇਂ: ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ ਦਾ ਇਲਾਜ, ਦਿਲ ਦੀ ਬਿਮਾਰੀ...",
        searchBtn: "ਨੇੜਲੇ ਹਸਪਤਾਲ ਲੱਭੋ",
        quickLabel: "ਤੁਰੰਤ ਬਿਮਾਰੀ ਸ਼ਾਰਟਕੱਟ (ਟੈਪ ਕਰਕੇ ਲੱਭੋ)",
        resultsTitle: "ਸਿਫਾਰਸ਼ ਕੀਤੇ ਨੇੜਲੇ ਹਸਪਤਾਲ",
        accountBtn: "ਲਾਗਇਨ",
        locateText: "ਮੌਜੂਦਾ GPS ਲੋਕੇਸ਼ਨ ਸਰਗਰਮ",
        readySearch: "ਪੂਰੇ ਦੇਸ਼ ਵਿੱਚ ਖੋਜ ਲਈ ਤਿਆਰ",
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSavedComparisons();
    initLanguage();
    initEventListeners();
    checkAuthSession();
    checkLoginToast();
    initReviewsModal();

    // Run a default discovery search on start
    if (navigator.geolocation) triggerGeolocation();
    else performDiseaseSearch('kidney treatment hospitals near me', false);
});

// =========================================================================
// THEME ENGINE (DARK & LIGHT MODE)
// =========================================================================

function initTheme() {
    const saved = localStorage.getItem('medadvisor_theme');
    if (saved === 'light' || saved === 'dark') {
        setTheme(saved, false);
    } else {
        // Default to dark or system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light', false);
    }

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const newTheme = appState.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme, true);
}

function setTheme(theme, save = true) {
    appState.currentTheme = theme;
    if (save) localStorage.setItem('medadvisor_theme', theme);

    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    lucide.createIcons();
}

// =========================================================================
// INITIALIZATION & EVENT LISTENERS
// =========================================================================

function initEventListeners() {
    // Disease search form
    const form = document.getElementById('disease-search-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('disease-search-input');
            const query = input ? .value.trim();
            if (query) performDiseaseSearch(query, true);
        });
    }

    // Quick disease shortcut chips
    document.querySelectorAll('.quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const diseaseQuery = chip.getAttribute('data-disease');
            const input = document.getElementById('disease-search-input');
            if (input && diseaseQuery) {
                input.value = diseaseQuery;
                performDiseaseSearch(diseaseQuery, true);
                window.scrollTo({ top: 320, behavior: 'smooth' });
            }
        });
    });

    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => {
                c.classList.remove('bg-sky-500', 'text-white', 'font-bold');
                c.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
            });
            chip.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
            chip.classList.add('bg-sky-500', 'text-white', 'font-bold');
            appState.selectedFilter = chip.getAttribute('data-filter') || 'all';
            applyFiltersAndSort();
        });
    });

    // Budget Cap Checkboxes
    document.querySelectorAll('.budget-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                appState.selectedBudgetCaps.add(cb.value);
            } else {
                appState.selectedBudgetCaps.delete(cb.value);
            }
            applyFiltersAndSort();
        });
    });

    const clearBudgetBtn = document.getElementById('clear-budget-checks');
    if (clearBudgetBtn) {
        clearBudgetBtn.addEventListener('click', () => {
            document.querySelectorAll('.budget-checkbox').forEach(cb => cb.checked = false);
            appState.selectedBudgetCaps.clear();
            applyFiltersAndSort();
        });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            appState.sortBy = e.target.value;
            applyFiltersAndSort();
        });
    }

    // View toggle: Cards vs Map (Desktop buttons)
    const viewCardsBtn = document.getElementById('view-cards-btn');
    const viewMapBtn = document.getElementById('view-map-btn');
    if (viewCardsBtn && viewMapBtn) {
        viewCardsBtn.addEventListener('click', () => switchView('cards'));
        viewMapBtn.addEventListener('click', () => switchView('map'));
    }

    // Mobile Bottom Navigation Bar Buttons
    const mobNavDiscover = document.getElementById('mob-nav-discover');
    const mobNavMap = document.getElementById('mob-nav-map');
    const mobNavCompare = document.getElementById('mob-nav-compare');
    const mobNavChat = document.getElementById('mob-nav-chat');

    if (mobNavDiscover) {
        mobNavDiscover.addEventListener('click', () => {
            switchView('cards');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateMobNavActive('mob-nav-discover');
        });
    }

    if (mobNavMap) {
        mobNavMap.addEventListener('click', () => {
            switchView('map');
            updateMobNavActive('mob-nav-map');
        });
    }

    if (mobNavCompare) {
        mobNavCompare.addEventListener('click', () => {
            renderCompareModal();
            document.getElementById('compare-modal') ? .classList.remove('hidden');
        });
    }

    if (mobNavChat) {
        mobNavChat.addEventListener('click', () => {
            const chatDrawer = document.getElementById('chat-drawer');
            chatDrawer ? .classList.remove('translate-x-full');
            const chatInput = document.getElementById('chat-input');
            if (chatInput) setTimeout(() => chatInput.focus(), 300);
        });
    }

    // GPS Locate Me Button
    const locateBtn = document.getElementById('locate-me-btn');
    if (locateBtn) {
        locateBtn.addEventListener('click', triggerGeolocation);
    }

    // Voice Search Button (Web Speech API)
    const voiceBtn = document.getElementById('voice-search-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', startVoiceRecognition);
    }

    // Clinical Advisory Toggle
    const advisoryBtn = document.getElementById('toggle-advisory-btn');
    const advisoryDetails = document.getElementById('advisory-details');
    const advisoryChevron = document.getElementById('advisory-chevron');
    if (advisoryBtn && advisoryDetails) {
        advisoryBtn.addEventListener('click', () => {
            const isHidden = advisoryDetails.classList.contains('hidden');
            if (isHidden) {
                advisoryDetails.classList.remove('hidden');
                advisoryChevron ? .classList.add('rotate-180');
            } else {
                advisoryDetails.classList.add('hidden');
                advisoryChevron ? .classList.remove('rotate-180');
            }
        });
    }

    // Language Selector
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            switchLanguage(e.target.value);
        });
    }

    // Emergency 108 SOS Button
    const sosBtn = document.getElementById('header-sos-btn');
    const sosModal = document.getElementById('sos-modal');
    const closeSosBtn = document.getElementById('close-sos-btn');
    if (sosBtn && sosModal) {
        sosBtn.addEventListener('click', () => {
            sosModal.classList.remove('hidden');
            triggerEmergencyProtocol();
        });
    }
    if (closeSosBtn && sosModal) {
        closeSosBtn.addEventListener('click', () => {
            sosModal.classList.add('hidden');
        });
    }

    // Compare Modal Triggers
    const openCompareModalBtn = document.getElementById('open-compare-modal-btn');
    const closeCompareModalBtn = document.getElementById('close-compare-modal-btn');
    const clearCompareBtn = document.getElementById('clear-compare-btn');
    const modalClearAllBtn = document.getElementById('modal-clear-all-btn');
    const compareModal = document.getElementById('compare-modal');

    const openCompare = () => {
        renderCompareModal();
        compareModal ? .classList.remove('hidden');
    };

    if (openCompareModalBtn) openCompareModalBtn.addEventListener('click', openCompare);
    if (closeCompareModalBtn && compareModal) {
        closeCompareModalBtn.addEventListener('click', () => compareModal.classList.add('hidden'));
    }
    if (clearCompareBtn) clearCompareBtn.addEventListener('click', clearAllComparisons);
    if (modalClearAllBtn) modalClearAllBtn.addEventListener('click', clearAllComparisons);
}

function updateMobNavActive(activeId) {
    const ids = ['mob-nav-discover', 'mob-nav-map', 'mob-nav-compare', 'mob-nav-chat'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === activeId) {
            el.classList.add('text-sky-600', 'dark:text-sky-400', 'font-bold');
            el.classList.remove('text-slate-500', 'dark:text-slate-400', 'font-medium');
        } else {
            el.classList.remove('text-sky-600', 'dark:text-sky-400', 'font-bold');
            el.classList.add('text-slate-500', 'dark:text-slate-400', 'font-medium');
        }
    });
}

function switchView(viewName) {
    appState.activeView = viewName;
    const viewCardsBtn = document.getElementById('view-cards-btn');
    const viewMapBtn = document.getElementById('view-map-btn');
    const mapSection = document.getElementById('results-map-section');
    const cardsGrid = document.getElementById('hospitals-grid');

    if (viewName === 'cards') {
        viewCardsBtn ? .classList.add('bg-sky-500', 'text-white', 'font-bold');
        viewCardsBtn ? .classList.remove('text-slate-600', 'dark:text-slate-400');
        viewMapBtn ? .classList.remove('bg-sky-500', 'text-white', 'font-bold');
        viewMapBtn ? .classList.add('text-slate-600', 'dark:text-slate-400');
        mapSection ? .classList.add('hidden');
        cardsGrid ? .classList.remove('hidden');
    } else {
        viewMapBtn ? .classList.add('bg-sky-500', 'text-white', 'font-bold');
        viewMapBtn ? .classList.remove('text-slate-600', 'dark:text-slate-400');
        viewCardsBtn ? .classList.remove('bg-sky-500', 'text-white', 'font-bold');
        viewCardsBtn ? .classList.add('text-slate-600', 'dark:text-slate-400');
        mapSection ? .classList.remove('hidden');
        setTimeout(() => initOrUpdateMap(), 150);
    }
}

// =========================================================================
// MULTILINGUAL LOCALIZATION
// =========================================================================

function initLanguage() {
    const saved = localStorage.getItem('medadvisor_lang') || 'en';
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = saved;
    switchLanguage(saved, false);
}

function switchLanguage(langCode, save = true) {
    appState.currentLanguage = langCode;
    if (save) localStorage.setItem('medadvisor_lang', langCode);

    const t = TRANSLATIONS[langCode] || TRANSLATIONS.en;

    const setT = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setT('header-subtitle', t.headerSubtitle);
    setT('hero-badge-text', t.heroBadge);
    setT('hero-title-prefix', t.heroTitlePrefix);
    setT('hero-title-highlight', t.heroTitleHighlight);
    setT('hero-description', t.heroDescription);
    setT('search-btn-label', t.searchBtn);
    setT('quick-symptoms-label', t.quickLabel);
    setT('results-header-title', t.resultsTitle);
    setT('account-btn-text', t.accountBtn);

    const searchInput = document.getElementById('disease-search-input');
    if (searchInput) searchInput.placeholder = t.inputPlaceholder;

    const locationText = document.getElementById('current-location-text');
    if (locationText && !appState.userCoords) locationText.textContent = t.readySearch;
}

// =========================================================================
// VOICE SEARCH (WEB SPEECH API)
// =========================================================================

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Voice speech recognition is not supported in this browser. Please type your disease.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = appState.currentLanguage === 'hi' ? 'hi-IN' : (appState.currentLanguage === 'pa' ? 'pa-IN' : 'en-IN');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const voiceBtn = document.getElementById('voice-search-btn');
    if (voiceBtn) {
        voiceBtn.classList.add('bg-rose-500', 'text-white', 'animate-pulse');
    }

    recognition.onstart = () => {
        const input = document.getElementById('disease-search-input');
        if (input) input.placeholder = '🎙️ Listening... Please speak your symptom/disease';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('disease-search-input');
        if (input) {
            input.value = transcript;
            performDiseaseSearch(transcript, true);
        }
    };

    recognition.onerror = (err) => {
        console.warn('Voice recognition error:', err.error);
    };

    recognition.onend = () => {
        if (voiceBtn) {
            voiceBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
        }
        const input = document.getElementById('disease-search-input');
        const t = TRANSLATIONS[appState.currentLanguage] || TRANSLATIONS.en;
        if (input) input.placeholder = t.inputPlaceholder;
    };

    recognition.start();
}

// =========================================================================
// GEOLOCATION
// =========================================================================

function triggerGeolocation() {
    const locateBtn = document.getElementById('locate-me-btn');
    const locText = document.getElementById('current-location-text');

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    if (locateBtn) locateBtn.classList.add('animate-spin', 'text-emerald-500');
    if (locText) locText.textContent = 'Detecting precise GPS coordinates...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            appState.userCoords = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            if (locateBtn) {
                locateBtn.classList.remove('animate-spin');
                locateBtn.classList.add('bg-emerald-500', 'text-white');
            }
            if (locText) {
                locText.textContent = `📍 GPS Active (${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)})`;
            }

            const input = document.getElementById('disease-search-input');
            const query = input ? .value.trim() || 'hospitals near me';
            performDiseaseSearch(query, true);
        },
        (err) => {
            console.warn('Geolocation denied:', err.message);
            if (locateBtn) locateBtn.classList.remove('animate-spin');
            if (locText) locText.textContent = 'GPS unavailable. Enter a city or region to search nearby hospitals.';
            const input = document.getElementById('disease-search-input');
            performDiseaseSearch(input ? .value.trim() || 'kidney treatment hospitals near me', false);
        }, { enableHighAccuracy: true, timeout: 8000 }
    );
}

// =========================================================================
// DISEASE SEARCH & AI ENTITY EXTRACTION
// =========================================================================

async function performDiseaseSearch(query, scrollResults = false) {
    if (!query || !query.trim()) return;

    const cleanQuery = query.trim();
    appState.currentQuery = cleanQuery;

    const cityInput = document.getElementById('city-override-input');
    const cityOverride = cityInput ? .value.trim() || '';

    const searchSubmitBtn = document.getElementById('search-submit-btn');
    if (searchSubmitBtn) {
        searchSubmitBtn.disabled = true;
        searchSubmitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Analyzing Clinical Intent...`;
        lucide.createIcons();
    }

    const container = document.getElementById('hospitals-grid');
    if (container) {
        container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="inline-block p-4 rounded-3xl theme-card shadow-xl mb-4">
          <i data-lucide="brain-circuit" class="w-10 h-10 text-sky-500 animate-spin mx-auto"></i>
        </div>
        <h4 class="text-base font-bold text-slate-900 dark:text-white mb-1">AI Clinical Engine Matching Hospitals</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Extracting disease entities, calculating commute times, and ranking live ICU beds for "${cleanQuery}"...</p>
      </div>
    `;
        lucide.createIcons();
    }

    try {
        const res = await fetch(`${API_BASE}/api/hospitals/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: cleanQuery,
                city: cityOverride,
                lat: appState.userCoords ? .lat,
                lon: appState.userCoords ? .lon
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to search hospitals');
        }

        appState.hospitals = data.hospitals || [];
        appState.currentIntent = data.intent || null;
        appState.detectedLocationName = data.searchLocation ? .name || 'Local Region';

        renderAIIntentSection(data.intent, data.searchLocation);
        applyFiltersAndSort();

        if (appState.activeView === 'map') {
            initOrUpdateMap();
        }

        if (scrollResults) {
            const intentSection = document.getElementById('ai-intent-section');
            intentSection ? .scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (err) {
        console.error('Search error:', err);
        if (container) {
            container.innerHTML = `
        <div class="col-span-full py-12 text-center theme-card rounded-3xl p-6 border">
          <i data-lucide="alert-circle" class="w-12 h-12 text-rose-500 mx-auto mb-3"></i>
          <h4 class="text-base font-bold text-slate-900 dark:text-white mb-1">Search Encountered an Issue</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">${escapeHtml(err.message || 'Please check your connection and try again.')}</p>
          <button onclick="performDiseaseSearch('${escapeHtml(cleanQuery)}', true)" class="px-4 py-2 bg-sky-500 text-white font-bold text-xs rounded-xl">Try Again</button>
        </div>
      `;
            lucide.createIcons();
        }
    } finally {
        if (searchSubmitBtn) {
            searchSubmitBtn.disabled = false;
            const t = TRANSLATIONS[appState.currentLanguage] || TRANSLATIONS.en;
            searchSubmitBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> <span>${t.searchBtn}</span>`;
            lucide.createIcons();
        }
    }
}

// =========================================================================
// AI EXPLAINABILITY & INTENT BANNER RENDERING
// =========================================================================

function renderAIIntentSection(intent, locationInfo) {
    const section = document.getElementById('ai-intent-section');
    if (!section || !intent) return;

    section.classList.remove('hidden');

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setVal('slot-disease', intent.disease || 'General Medical Problem');
    setVal('slot-specialty', intent.specialty ? `${intent.specialty} Department` : 'General Medicine');
    setVal('slot-location', locationInfo ? .name || intent.location || 'Local Region');
    setVal('intent-explainability-text', intent.explainability || 'Matched hospitals based on medical department and proximity.');
    setVal('ai-model-tag', intent.modelUsed || 'Gemini Clinical AI');

    // Urgency badge styling
    const urgencyBadge = document.getElementById('intent-urgency-badge');
    const urgencyText = document.getElementById('urgency-text');
    if (urgencyBadge && urgencyText) {
        urgencyBadge.className = 'self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5';
        if (intent.urgency === 'Emergency') {
            urgencyBadge.classList.add('bg-rose-500/10', 'border', 'border-rose-500/30', 'text-rose-600', 'dark:text-rose-400');
            urgencyText.textContent = '🚨 Emergency (Immediate ER / 108)';
        } else if (intent.urgency === 'Urgent') {
            urgencyBadge.classList.add('bg-amber-500/10', 'border', 'border-amber-500/30', 'text-amber-600', 'dark:text-amber-400');
            urgencyText.textContent = '⚠️ Urgent (Consult within 15 min)';
        } else {
            urgencyBadge.classList.add('bg-emerald-500/10', 'border', 'border-emerald-500/30', 'text-emerald-600', 'dark:text-emerald-400');
            urgencyText.textContent = 'ℹ️ Routine Outpatient (OPD)';
        }
    }

    // Clinical Advisory details
    setVal('advisory-homecare', intent.homeCare || 'Stay well hydrated and maintain complete rest.');
    setVal('advisory-redflags', intent.redFlags || 'Severe worsening pain, breathing difficulty, or high fever.');
    setVal('advisory-tests', intent.diagnosticTests || 'CBC, Baseline Imaging, and Specialist Consultation.');
}

// =========================================================================
// FILTERING & SORTING LOGIC
// =========================================================================

function applyFiltersAndSort() {
    let list = [...appState.hospitals];

    // Apply Filter Chips
    if (appState.selectedFilter === 'emergency') {
        list = list.filter(h => h.emergencyBedsAvailable > 0);
    } else if (appState.selectedFilter === 'ayushman') {
        list = list.filter(h => (h.insuranceAccepted || []).some(ins => ins.toLowerCase().includes('ayushman') || ins.toLowerCase().includes('pm-jay') || ins.toLowerCase().includes('sarbat')));
    } else if (appState.selectedFilter === 'icu') {
        list = list.filter(h => (h.icuAvailable || 0) >= 10);
    } else if (appState.selectedFilter === 'budget') {
        list = list.filter(h => (h.estimatedTreatmentCost ? .min || h.avgConsultationCost || 0) <= 50000);
    } else if (appState.selectedFilter === 'rated') {
        list = list.filter(h => (h.rating || 0) >= 4.8);
    }

    // Apply Budget Cap Checkboxes
    if (appState.selectedBudgetCaps && appState.selectedBudgetCaps.size > 0) {
        list = list.filter(h => {
            const minCost = h.estimatedTreatmentCost ? .min ? ? h.avgConsultationCost ? ? 0;
            const maxCost = h.estimatedTreatmentCost ? .max ? ? minCost;
            const consultCost = h.avgConsultationCost ? ? 0;

            for (const cap of appState.selectedBudgetCaps) {
                const [low, high] = cap.split('-').map(Number);
                if ((minCost <= high && maxCost >= low) || (consultCost >= low && consultCost <= high)) {
                    return true;
                }
            }
            return false;
        });
    }

    // Apply Sort
    if (appState.sortBy === 'distance') {
        list.sort((a, b) => (a.distanceKm ? ? 999) - (b.distanceKm ? ? 999));
    } else if (appState.sortBy === 'cost') {
        list.sort((a, b) => (a.estimatedTreatmentCost.min ? ? 999999) - (b.estimatedTreatmentCost.min ? ? 999999));
    } else if (appState.sortBy === 'beds') {
        list.sort((a, b) => (b.icuAvailable ? ? 0) - (a.icuAvailable ? ? 0));
    } else if (appState.sortBy === 'rating') {
        list.sort((a, b) => (b.rating ? ? 0) - (a.rating ? ? 0));
    } else {
        list.sort((a, b) => (b.rankScore ? ? 0) - (a.rankScore ? ? 0));
    }

    appState.filteredHospitals = list;

    const badge = document.getElementById('hospitals-count-badge');
    if (badge) badge.textContent = String(list.length);

    renderHospitalCards(list);
}

// =========================================================================
// HOSPITAL CARDS RENDERING (MOBILE-FIRST & DUAL THEME)
// =========================================================================

function renderHospitalCards(hospitals) {
    const container = document.getElementById('hospitals-grid');
    if (!container) return;

    if (hospitals.length === 0) {
        container.innerHTML = `
      <div class="col-span-full py-16 text-center theme-card rounded-3xl p-8 border">
        <i data-lucide="search-x" class="w-16 h-16 mx-auto text-slate-400 mb-3 animate-bounce"></i>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Hospitals Matched Active Filters</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">Try selecting "All Matches" or adjusting your search term.</p>
        <button onclick="resetFilters()" class="px-4 py-2 bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm">Reset Filters</button>
      </div>
    `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = hospitals.map(h => {
        const isCompared = appState.comparedIds.has(h.id);
        const costMin = formatCurrency(h.estimatedTreatmentCost ? .min);
        const distanceDisplay = h.distanceKm != null ? `${h.distanceKm} km` : 'Near you';
        const commute = h.commuteDuration || `${Math.max(8, Math.round((h.distanceKm || 5) * 2.2 + 4))} mins`;

        // Accreditations Badges
        const accreditationsHtml = (h.accreditations || []).slice(0, 3).map(acc => `
      <span class="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        ${escapeHtml(acc)}
      </span>
    `).join('');

        return `
      <article class="theme-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between border ${isCompared ? 'theme-card-selected' : ''}" data-id="${escapeHtml(h.id)}">
        
        <!-- Header: Name, Rating & Type -->
        <div>
          <div class="flex items-start justify-between gap-2.5 mb-2">
            <div>
              <span class="text-[10px] uppercase font-extrabold text-sky-600 dark:text-sky-400 tracking-wider block mb-0.5">${escapeHtml(h.type || 'Super Speciality Hospital')}</span>
              <h4 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">${escapeHtml(h.name)}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                <span class="truncate">${escapeHtml(h.location)}</span>
              </p>
            </div>

            <!-- Rating Badge -->
            <div class="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs">
              <span>★</span>
              <span>${escapeHtml(h.rating)}</span>
            </div>
          </div>

          <!-- Commute & Distance Badge Bar -->
          <div class="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 py-1.5 border-y border-slate-200 dark:border-slate-800/80 my-2.5">
            <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <i data-lucide="navigation" class="w-3.5 h-3.5"></i> ${distanceDisplay}
            </span>
            <span class="text-slate-300 dark:text-slate-600">•</span>
            <span class="flex items-center gap-1">
              <i data-lucide="car" class="w-3.5 h-3.5"></i> ~${commute} drive
            </span>
            <span class="text-slate-300 dark:text-slate-600">•</span>
            <span>${escapeHtml(h.hours || 'Open 24 hours')}</span>
          </div>

          <!-- 3-Pill Clinical Metric Matrix -->
          <div class="grid grid-cols-3 gap-2 my-3 text-center">
            
            <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span class="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">🛏️ ICU Beds</span>
              <span class="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">${h.icuAvailable ?? 8} Ready</span>
            </div>

            <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span class="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">💰 Est. Procedure</span>
              <span class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">${costMin}</span>
            </div>

            <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span class="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">📈 Outcome</span>
              <span class="text-xs sm:text-sm font-extrabold text-sky-600 dark:text-sky-400 block mt-0.5">${h.successRate ?? 95}% Rate</span>
            </div>

          </div>

          <!-- Accreditations & Govt Schemes -->
          <div class="flex flex-wrap items-center gap-1.5 mb-3">
            ${accreditationsHtml}
          </div>

          <!-- AI Explainability Reason -->
          <div class="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-700 dark:text-sky-200 leading-relaxed mb-3">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 inline mr-1 text-sky-500"></i>
            ${escapeHtml(h.explainabilityReason || 'Verified provider with dedicated specialists.')}
          </div>
        </div>

        <!-- Action Buttons Row (Touch Optimized for Mobile) -->
        <div class="grid grid-cols-4 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <a href="tel:${escapeHtml(h.phone)}" class="py-2.5 px-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-sm transition-all">
            <i data-lucide="phone" class="w-3 h-3"></i>
            <span>Call</span>
          </a>

          <a href="${h.mapUrl}" target="_blank" rel="noopener" class="py-2.5 px-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-sm transition-all">
            <i data-lucide="map" class="w-3 h-3"></i>
            <span>Map</span>
          </a>

          <button type="button" onclick="openReviewModal('${escapeHtml(h.id)}', '${escapeHtml(h.name)}')" class="py-2.5 px-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-sm">
            <i data-lucide="star" class="w-3 h-3"></i>
            <span>Review</span>
          </button>

          <button type="button" onclick="toggleCompareHospital('${escapeHtml(h.id)}')" class="py-2.5 px-1 rounded-xl ${isCompared ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700'} text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-sm">
            <i data-lucide="sliders-horizontal" class="w-3 h-3"></i>
            <span>${isCompared ? 'Added' : 'Compare'}</span>
          </button>
        </div>

      </article>
    `;
    }).join('');

    lucide.createIcons();
}

// =========================================================================
// LEAFLET MAP VIEW
// =========================================================================

function initOrUpdateMap() {
    const mapContainer = document.getElementById('results-map');
    if (!mapContainer || !window.L) return;

    if (!resultsMap) {
        resultsMap = L.map('results-map').setView([30.7333, 76.7794], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(resultsMap);
        mapMarkersGroup = L.layerGroup().addTo(resultsMap);
    }

    mapMarkersGroup.clearLayers();
    const boundsPoints = [];

    const centerCoords = appState.userCoords || { lat: 30.7333, lon: 76.7794 };
    if (centerCoords) {
        if (userLocationMarker) userLocationMarker.remove();
        userLocationMarker = L.circleMarker([centerCoords.lat, centerCoords.lon], {
            radius: 9,
            color: '#0ea5e9',
            fillColor: '#38bdf8',
            fillOpacity: 0.95,
            weight: 3
        }).bindPopup(`<strong>📍 Search Center: ${escapeHtml(appState.detectedLocationName)}</strong>`).addTo(resultsMap);
        boundsPoints.push([centerCoords.lat, centerCoords.lon]);
    }

    appState.filteredHospitals.forEach(h => {
        if (h.lat && h.lon) {
            const marker = L.marker([h.lat, h.lon])
                .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="color: #0f172a; font-size: 14px;">${escapeHtml(h.name)}</strong><br/>
            <span style="color: #0284c7; font-size: 11px; font-weight: bold;">⭐ ${h.rating} • ${h.distanceKm} km away</span><br/>
            <span style="color: #10b981; font-size: 11px;">🛏️ ${h.icuAvailable} ICU Beds</span><br/>
            <a href="tel:${h.phone}" style="display:inline-block; margin-top:6px; background:#0ea5e9; color:#fff; padding:4px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">Call Hospital</a>
          </div>
        `)
                .addTo(mapMarkersGroup);

            boundsPoints.push([h.lat, h.lon]);
        }
    });

    if (boundsPoints.length > 0) {
        resultsMap.fitBounds(boundsPoints, { padding: [30, 30], maxZoom: 14 });
    }

    const mapStatus = document.getElementById('map-status');
    if (mapStatus) mapStatus.textContent = `${appState.filteredHospitals.length} hospitals mapped near ${appState.detectedLocationName}`;
}

// =========================================================================
// COMPARISON ENGINE & MODAL
// =========================================================================

function loadSavedComparisons() {
    try {
        const savedIds = JSON.parse(localStorage.getItem('med_compare_ids') || '[]');
        const savedHospitals = JSON.parse(localStorage.getItem('med_compare_hospitals') || '{}');
        appState.comparedIds = new Set(savedIds);
        appState.comparedMap = new Map(Object.entries(savedHospitals));
        updateCompareCounters();
    } catch (e) {
        appState.comparedIds = new Set();
        appState.comparedMap = new Map();
    }
}

function saveComparisons() {
    const idsArr = Array.from(appState.comparedIds);
    const hospitalsObj = Object.fromEntries(appState.comparedMap);
    localStorage.setItem('med_compare_ids', JSON.stringify(idsArr));
    localStorage.setItem('med_compare_hospitals', JSON.stringify(hospitalsObj));
    updateCompareCounters();
}

function updateCompareCounters() {
    const count = appState.comparedIds.size;

    const barBadge = document.getElementById('compare-bar-badge');
    const mobBadge = document.getElementById('mob-compare-count');
    if (barBadge) barBadge.textContent = String(count);
    if (mobBadge) {
        mobBadge.textContent = String(count);
        if (count > 0) mobBadge.classList.remove('hidden');
        else mobBadge.classList.add('hidden');
    }

    const bar = document.getElementById('floating-compare-bar');
    if (bar) {
        if (count > 0) {
            bar.classList.remove('translate-y-36', 'opacity-0', 'pointer-events-none');
        } else {
            bar.classList.add('translate-y-36', 'opacity-0', 'pointer-events-none');
        }
    }
}

function toggleCompareHospital(hospitalId) {
    const hospital = appState.hospitals.find(h => h.id === hospitalId) || appState.comparedMap.get(hospitalId);
    if (!hospital) return;

    if (appState.comparedIds.has(hospitalId)) {
        appState.comparedIds.delete(hospitalId);
        appState.comparedMap.delete(hospitalId);
    } else {
        if (appState.comparedIds.size >= 4) {
            alert('You can compare a maximum of 4 hospitals at a time.');
            return;
        }
        appState.comparedIds.add(hospitalId);
        appState.comparedMap.set(hospitalId, hospital);
    }

    saveComparisons();
    renderHospitalCards(appState.filteredHospitals);
}

function clearAllComparisons() {
    appState.comparedIds.clear();
    appState.comparedMap.clear();
    saveComparisons();
    renderHospitalCards(appState.filteredHospitals);

    const modal = document.getElementById('compare-modal');
    if (modal) modal.classList.add('hidden');
}

function renderCompareModal() {
    const content = document.getElementById('compare-modal-content');
    if (!content) return;

    const list = Array.from(appState.comparedMap.values());
    if (list.length === 0) {
        content.innerHTML = `
      <div class="py-12 text-center">
        <i data-lucide="sliders-horizontal" class="w-12 h-12 text-slate-400 mx-auto mb-2"></i>
        <h4 class="text-base font-bold text-slate-900 dark:text-white mb-1">No Hospitals Selected</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">Click "+ Compare" on any hospital card to see side-by-side metrics.</p>
      </div>
    `;
        lucide.createIcons();
        return;
    }

    content.innerHTML = `
    <div class="flex sm:grid sm:grid-cols-${Math.min(list.length, 4)} gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar">
      ${list.map(h => `
        <div class="theme-card rounded-2xl p-4 border flex flex-col justify-between shrink-0 w-[85vw] sm:w-auto snap-center shadow-md">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <h4 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">${escapeHtml(h.name)}</h4>
              <button onclick="toggleCompareHospital('${escapeHtml(h.id)}'); renderCompareModal();" class="text-slate-400 hover:text-rose-500 p-1">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
            
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span class="truncate">${escapeHtml(h.location)}</span>
              <strong class="text-amber-500 shrink-0">★ ${h.rating}</strong>
            </div>

            <div class="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Est. Procedure Cost:</span>
                <span class="font-extrabold text-slate-900 dark:text-white">${formatCurrency(h.estimatedTreatmentCost?.min)} - ${formatCurrency(h.estimatedTreatmentCost?.max)}</span>
              </div>

              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">ICU Beds Available:</span>
                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">🟢 ${h.icuAvailable} Beds</span>
              </div>

              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Emergency Beds:</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">${h.emergencyBedsAvailable} Beds</span>
              </div>

              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Outcome Success Rate:</span>
                <span class="font-extrabold text-sky-600 dark:text-sky-400">${h.successRate}%</span>
              </div>

              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Avg. OPD Fee:</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">₹${h.avgConsultationCost}</span>
              </div>

              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">ICU Daily Charge:</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">₹${h.avgIcuCostPerDay}</span>
              </div>

              <div class="py-1">
                <span class="text-slate-500 dark:text-slate-400 block mb-1">Accreditations:</span>
                <div class="flex flex-wrap gap-1">
                  ${(h.accreditations || []).map(a => `<span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">${escapeHtml(a)}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <a href="tel:${h.phone}" class="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl text-center shadow-sm">Call</a>
            <a href="${h.mapUrl}" target="_blank" rel="noopener" class="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl text-center shadow-sm">Directions</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  lucide.createIcons();
}

// =========================================================================
// EMERGENCY PROTOCOL ACTIVATION
// =========================================================================

async function triggerEmergencyProtocol() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: appState.userCoords,
        emergencyType: 'Cardiac or Critical'
      })
    });
    const data = await res.json();
    if (data.success && data.nearestTraumaCentres) {
      const traumaList = document.getElementById('sos-trauma-list');
      if (traumaList) {
        traumaList.innerHTML = `
          <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">Nearest 24/7 Apex Trauma Centres</span>
          ${data.nearestTraumaCentres.map(t => `
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <strong class="text-slate-900 dark:text-white block text-xs">${escapeHtml(t.name)}</strong>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">${t.distanceKm} km • ${t.emergencyBeds} Emergency Beds</span>
              </div>
              <a href="tel:${t.phone}" class="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-black">Call ER</a>
            </div>
          `).join('')}
        `;
      }
    }
  } catch (e) {
    console.warn('Emergency dispatch request fallback:', e);
  }
}

// =========================================================================
// UTILITY HELPERS
// =========================================================================

function formatCurrency(val) {
  if (val == null || !Number.isFinite(Number(val))) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
}

function escapeHtml(val) {
  return String(val ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function resetFilters() {
  appState.selectedFilter = 'all';
  document.querySelectorAll('.filter-chip').forEach(c => {
    if (c.getAttribute('data-filter') === 'all') {
      c.classList.add('bg-sky-500', 'text-white', 'font-bold');
      c.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
    } else {
      c.classList.remove('bg-sky-500', 'text-white', 'font-bold');
      c.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
    }
  });
  applyFiltersAndSort();
}

function checkAuthSession() {
  const token = localStorage.getItem('medadvisor_token');
  const accountLink = document.getElementById('account-link');
  const accountText = document.getElementById('account-btn-text');

  if (token && accountText) {
    accountText.textContent = 'My Profile';
    if (accountLink) accountLink.href = 'profile.html';
  }
}

// =========================================================================
// TOAST NOTIFICATION ENGINE
// =========================================================================

function showNotificationToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `p-3.5 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-xl transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0 ${
    type === 'success'
      ? 'bg-slate-900/95 border-emerald-500/50 text-slate-100'
      : 'bg-slate-900/95 border-rose-500/50 text-slate-100'
  }`;

  toast.innerHTML = `
    <div class="w-7 h-7 rounded-xl ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'} flex items-center justify-center shrink-0">
      <i data-lucide="${type === 'success' ? 'sparkles' : 'alert-circle'}" class="w-4 h-4"></i>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-xs font-black text-white leading-snug">${escapeHtml(title)}</h4>
      <p class="text-[11px] text-slate-300 mt-0.5 leading-relaxed">${escapeHtml(message)}</p>
    </div>
    <button class="p-1 text-slate-400 hover:text-white text-xs" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 350);
  }, 4800);
}

function checkLoginToast() {
  const loginToastData = localStorage.getItem('medigo_login_toast');
  if (loginToastData) {
    localStorage.removeItem('medigo_login_toast');
    try {
      const info = JSON.parse(loginToastData);
      showNotificationToast(
        info.mode === 'signup' ? '🎉 Welcome to MediGo!' : '👋 Welcome Back to MediGo!',
        `Logged in successfully as ${info.name || 'Citizen'}. You can now save preferences and review hospitals.`
      );
    } catch (e) {}
  }
}

// =========================================================================
// REVIEWS SYSTEM & MODAL
// =========================================================================

function initReviewsModal() {
  const closeBtn = document.getElementById('close-reviews-modal-btn');
  const modal = document.getElementById('reviews-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeReviewModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeReviewModal();
    });
  }

  const reviewForm = document.getElementById('write-review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hospitalId = document.getElementById('review-hospital-id').value;
      const hospitalName = document.getElementById('review-hospital-name').value;
      const userName = document.getElementById('review-user-name').value.trim() || 'Verified Citizen';
      const rating = parseInt(document.getElementById('review-rating-val').value, 10) || 5;
      const treatment = document.getElementById('review-treatment').value.trim() || 'General Medicine';
      const comment = document.getElementById('review-comment').value.trim();

      const submitBtn = document.getElementById('submit-review-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Submitting...`;
        lucide.createIcons();
      }

      try {
        const res = await fetch(`${API_BASE}/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospitalId,
            hospitalName,
            userName,
            rating,
            treatment,
            comment
          })
        });

        const data = await res.json();
        if (data.success) {
          showNotificationToast('⭐ Review Submitted!', `Thank you ${userName}! Your review for ${hospitalName} has been published.`);
          document.getElementById('review-comment').value = '';
          loadHospitalReviews(hospitalId);
          // Also update hospital in appState
          const hosp = appState.hospitals.find(h => h.id === hospitalId);
          if (hosp) {
            hosp.reviewsCount = data.reviewsCount || (hosp.reviewsCount + 1);
            if (data.updatedRating) hosp.rating = data.updatedRating;
            applyFiltersAndSort();
          }
        } else {
          alert(data.error || 'Failed to submit review.');
        }
      } catch (err) {
        alert('Network error while posting review.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i data-lucide="send" class="w-3.5 h-3.5"></i> Submit Review`;
          lucide.createIcons();
        }
      }
    });
  }
}

window.openReviewModal = function(hospitalId, hospitalName) {
  const modal = document.getElementById('reviews-modal');
  if (!modal) return;

  document.getElementById('modal-hospital-name').textContent = hospitalName;
  document.getElementById('review-hospital-id').value = hospitalId;
  document.getElementById('review-hospital-name').value = hospitalName;

  modal.classList.remove('hidden');
  loadHospitalReviews(hospitalId);
  lucide.createIcons();
};

window.closeReviewModal = function() {
  const modal = document.getElementById('reviews-modal');
  if (modal) modal.classList.add('hidden');
};

async function loadHospitalReviews(hospitalId) {
  const listContainer = document.getElementById('modal-reviews-list');
  if (!listContainer) return;

  listContainer.innerHTML = `<div class="text-center py-4 text-xs text-slate-400">Loading verified reviews...</div>`;

  try {
    const res = await fetch(`${API_BASE}/api/reviews?hospitalId=${encodeURIComponent(hospitalId)}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.reviews)) {
      if (data.reviews.length === 0) {
        listContainer.innerHTML = `<div class="p-3 text-center text-xs text-slate-400 theme-card rounded-xl border">No reviews yet for this hospital. Be the first to share your experience!</div>`;
        return;
      }

      listContainer.innerHTML = data.reviews.map(r => `
        <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(r.userName)}</span>
            <span class="text-amber-500 font-bold">${'★'.repeat(r.rating)} <span class="text-slate-400 text-[10px]">(${r.rating}/5)</span></span>
          </div>
          <div class="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">${escapeHtml(r.treatment || 'Clinical Consultation')} • ${r.date || 'Recent'}</div>
          <p class="text-xs text-slate-600 dark:text-slate-300 italic pt-0.5">"${escapeHtml(r.comment)}"</p>
        </div>
      `).join('');
    }
  } catch (err) {
    listContainer.innerHTML = `<div class="p-3 text-center text-xs text-rose-400">Failed to load reviews.</div>`;
  }
}