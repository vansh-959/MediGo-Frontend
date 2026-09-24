// MedAdvisor Main Frontend Logic (TECHNOVA 2026)
// Mobile-First Disease Discovery, Theme Engine (Light/Dark), Voice Recognition & Comparison

const API_BASE = window.MEDIGO_API_BASE;

function loadSavedHospitalIds() {
    try {
        const ids = JSON.parse(localStorage.getItem('medigo_saved_hospitals') || '[]');
        return Array.isArray(ids) ? ids : [];
    } catch (error) {
        return [];
    }
}

function loadSavedHospitalRecords() {
    try {
        const records = JSON.parse(localStorage.getItem('medigo_saved_hospital_data') || '{}');
        return records && typeof records === 'object' && !Array.isArray(records) ? records : {};
    } catch {
        return {};
    }
}

function rememberSavedHospitalRecords(hospitals) {
    let changed = false;
    for (const hospital of hospitals || []) {
        if (hospital?.id && appState.savedHospitalIds.has(hospital.id)) {
            appState.savedHospitalRecords[hospital.id] = hospital;
            changed = true;
        }
    }
    if (changed) localStorage.setItem('medigo_saved_hospital_data', JSON.stringify(appState.savedHospitalRecords));
}

let appState = {
    hospitals: [],
    filteredHospitals: [],
    selectedFilter: 'all',
    selectedBudgetCaps: new Set(),
    sortBy: 'rank',
    currentQuery: '',
    userCoords: null,
    searchCenterCoords: null,
    detectedLocationName: 'Chandigarh Region',
    savedHospitalRecords: loadSavedHospitalRecords(),
    currentIntent: null,
    comparedIds: new Set(),
    comparedMap: new Map(),
    savedHospitalIds: new Set(loadSavedHospitalIds()),
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
        heroDescription: "Search the hospital directory by condition, location, or budget. Call hospitals to confirm current services and availability.",
        inputPlaceholder: "Type disease or condition, e.g. Kidney treatment under 2 lakh in Chandigarh...",
        searchBtn: "Search",
        quickLabel: "Quick Condition Shortcuts (Tap to Search)",
        resultsTitle: "Recommended Nearest Hospitals",
        locateText: "Using GPS Location",
        readySearch: "Ready to search across India",
    },
    hi: {
        headerSubtitle: "राष्ट्रीय स्वास्थ्य सेवा खोज पोर्टल",
        heroBadge: "सरकारी स्वास्थ्य सेवा खोज एवं अस्पताल सिफारिश प्रणाली",
        heroTitlePrefix: "अपनी बीमारी के लिए खोजें",
        heroTitleHighlight: "सबसे सही और नजदीकी अस्पताल",
        heroDescription: "बीमारी, लोकेशन या बजट से अस्पतालों की सूची खोजें। मौजूदा सेवाओं और उपलब्धता की पुष्टि अस्पताल से करें।",
        inputPlaceholder: "अपनी बीमारी लिखें, जैसे: 2 लाख में चंडीगढ़ में पथरी का इलाज, दिल का दर्द...",
        searchBtn: "खोजें",
        quickLabel: "त्वरित रोग शॉर्टकट (टैप करके खोजें)",
        resultsTitle: "अनुशंसित नजदीकी अस्पताल",
        locateText: "वर्तमान जीपीएस स्थान सक्रिय",
        readySearch: "पूरे भारत में खोजने के लिए तैयार",
    },
    'hi-Latn': {
        headerSubtitle: "National Healthcare Discovery",
        heroBadge: "Sarkari healthcare discovery aur hospital recommendation",
        heroTitlePrefix: "Apni bimari ke liye khojein",
        heroTitleHighlight: "sahi hospital",
        heroDescription: "Bimari, location ya budget ke hisaab se hospital khojein. Jaane se pehle services aur availability confirm karein.",
        inputPlaceholder: "Bimari likhein, jaise kidney treatment ya chest pain...",
        searchBtn: "Search",
        quickLabel: "Jaldi search ke liye bimari chunein",
        resultsTitle: "Sujhaye gaye paas ke hospitals",
        locateText: "GPS location use ho rahi hai",
        readySearch: "Poore India mein search karne ke liye taiyar",
    },
    pa: {
        headerSubtitle: "ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਸੇਵਾ ਖੋਜ ਪੋਰਟਲ",
        heroBadge: "ਸਰਕਾਰੀ ਸਿਹਤ ਸੇਵਾ ਖੋਜ ਅਤੇ ਹਸਪਤਾਲ ਸਿਫਾਰਸ਼ ਪ੍ਰਣਾਲੀ",
        heroTitlePrefix: "ਆਪਣੀ ਬਿਮਾਰੀ ਲਈ ਲੱਭੋ",
        heroTitleHighlight: "ਸਭ ਤੋਂ ਵਧੀਆ ਅਤੇ ਨੇੜਲਾ ਹਸਪਤਾਲ",
        heroDescription: "ਬਿਮਾਰੀ, ਥਾਂ ਜਾਂ ਬਜਟ ਨਾਲ ਹਸਪਤਾਲਾਂ ਦੀ ਸੂਚੀ ਖੋਜੋ। ਮੌਜੂਦਾ ਸੇਵਾਵਾਂ ਅਤੇ ਉਪਲਬਧਤਾ ਦੀ ਪੁਸ਼ਟੀ ਹਸਪਤਾਲ ਤੋਂ ਕਰੋ।",
        inputPlaceholder: "ਆਪਣੀ ਬਿਮਾਰੀ ਲਿਖੋ, ਜਿਵੇਂ: ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ ਦਾ ਇਲਾਜ, ਦਿਲ ਦੀ ਬਿਮਾਰੀ...",
        searchBtn: "ਖੋਜੋ",
        quickLabel: "ਤੁਰੰਤ ਬਿਮਾਰੀ ਸ਼ਾਰਟਕੱਟ (ਟੈਪ ਕਰਕੇ ਲੱਭੋ)",
        resultsTitle: "ਸਿਫਾਰਸ਼ ਕੀਤੇ ਨੇੜਲੇ ਹਸਪਤਾਲ",
        locateText: "ਮੌਜੂਦਾ GPS ਲੋਕੇਸ਼ਨ ਸਰਗਰਮ",
        readySearch: "ਪੂਰੇ ਦੇਸ਼ ਵਿੱਚ ਖੋਜ ਲਈ ਤਿਆਰ",
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSavedComparisons();
    initLanguage();
    initEventListeners();
    initReviewsModal();
    if (location.hash === '#saved') document.querySelector('.filter-chip[data-filter="saved"]')?.click();

    // Hospital search is started only after the visitor submits a query.
});

window.addEventListener('medigo:languagechange', (event) => {
    appState.currentLanguage = event.detail?.language || window.MEDIGO_LANGUAGE || 'en';
    if (appState.filteredHospitals.length) renderHospitalCards(appState.filteredHospitals);
    const compareModal = document.getElementById('compare-modal');
    if (compareModal && !compareModal.classList.contains('hidden')) renderCompareModal();
});

// =========================================================================
// THEME ENGINE (DARK & LIGHT MODE)
// =========================================================================

function initTheme() {
    const saved = localStorage.getItem('medadvisor_theme');
    if (saved === 'light' || saved === 'dark') {
        setTheme(saved, false);
    } else {
      setTheme('light', false);
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

    window.lucide?.createIcons?.();
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
            const query = input?.value.trim();
            if (query) void openNearestResults(query);
        });
    }

    // Quick disease shortcut chips
    document.querySelectorAll('.quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const diseaseQuery = chip.getAttribute('data-disease');
            const input = document.getElementById('disease-search-input');
            if (input && diseaseQuery) {
                input.value = diseaseQuery;
                void openNearestResults(diseaseQuery);
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

    document.getElementById('compare-selected-btn')?.addEventListener('click', () => {
        if (appState.comparedIds.size < 2) {
            showNotificationToast('Select 2 hospitals', 'Tap Compare on at least two hospital cards first.', 'error');
            return;
        }
        window.location.href = 'compare.html';
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
    const mobNavCost = document.getElementById('mob-nav-cost');
    const mobNavReportReader = document.getElementById('mob-nav-report-reader');
    const mobNavChat = document.getElementById('mob-nav-chat');
    const mobNavMore = document.getElementById('mob-nav-more');
    const mobileMoreMenu = document.getElementById('mobile-more-menu');
    const closeMobileMoreMenu = () => {
        mobileMoreMenu?.classList.add('hidden');
        mobNavMore?.setAttribute('aria-expanded', 'false');
    };

    if (mobNavDiscover) {
        mobNavDiscover.addEventListener('click', () => {
            closeMobileMoreMenu();
            switchView('cards');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateMobNavActive('mob-nav-discover');
        });
    }

    if (mobNavMap) {
        mobNavMap.addEventListener('click', async () => {
            closeMobileMoreMenu();
            switchView('map');
            const mapStatus = document.getElementById('map-status');
            const locationText = document.getElementById('current-location-text');
            const typedCity = document.getElementById('city-override-input')?.value.trim() || '';
            if (mapStatus) mapStatus.textContent = 'Finding your location and nearby hospitals…';
            try {
                if (!appState.userCoords) {
                    try {
                        const coords = await requestCurrentCoordinates();
                        appState.userCoords = coords;
                        appState.searchCenterCoords = null;
                        appState.sortBy = 'distance';
                        const sortSelect = document.getElementById('sort-select');
                        if (sortSelect) sortSelect.value = 'distance';
                        const cityInput = document.getElementById('city-override-input');
                        if (cityInput) cityInput.value = '';
                        if (locationText) locationText.textContent = 'GPS location active · hospitals sorted by distance';
                    } catch (locationError) {
                        if (!typedCity) throw locationError;
                        appState.searchCenterCoords = await resolveCityCenter(typedCity);
                        if (locationText) locationText.textContent = appState.searchCenterCoords
                            ? `GPS unavailable · approximate distances from ${appState.searchCenterCoords.city} city center`
                            : `${locationError.message} Showing hospitals in ${typedCity}.`;
                    }
                }
                const city = appState.userCoords ? '' : typedCity;
                const referenceCoords = appState.userCoords || appState.searchCenterCoords;
                const directory = await searchPublicHospitalDirectory('', city, referenceCoords);
                appState.hospitals = directory.hospitals;
                rememberSavedHospitalRecords(appState.hospitals);
                appState.detectedLocationName = appState.userCoords ? 'Your location' : appState.searchCenterCoords ? `${appState.searchCenterCoords.city} city center (approx.)` : city || 'All listed locations';
                appState.selectedFilter = 'all';
                if (referenceCoords) {
                    appState.sortBy = 'distance';
                    const sortSelect = document.getElementById('sort-select');
                    if (sortSelect) sortSelect.value = 'distance';
                }
                applyFiltersAndSort();
                if (mapStatus) mapStatus.textContent = `${appState.hospitals.length} hospitals · ${referenceCoords ? 'nearest first' : city ? `in ${city}` : 'enable location for distance sorting'}`;
            } catch (error) {
                if (mapStatus) mapStatus.textContent = `${error.message || 'Location unavailable.'} Enter a city in the search box, then tap Nearby again.`;
            }
            document.getElementById('results-map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateMobNavActive('mob-nav-map');
        });
    }

    if (mobNavCompare) {
        mobNavCompare.addEventListener('click', () => {
            closeMobileMoreMenu();
            location.href = 'compare.html';
        });
    }

    mobNavCost?.addEventListener('click', () => {
        closeMobileMoreMenu();
        document.getElementById('cost-estimate-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateMobNavActive('mob-nav-cost');
    });

    if (mobNavReportReader) {
        mobNavReportReader.addEventListener('click', () => {
            closeMobileMoreMenu();
            document.getElementById('chat-drawer')?.classList.add('translate-x-full');
            document.getElementById('report-reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateMobNavActive('mob-nav-report-reader');
        });
    }

    if (mobNavChat) {
        mobNavChat.addEventListener('click', () => {
            closeMobileMoreMenu();
            const chatDrawer = document.getElementById('chat-drawer');
            chatDrawer?.classList.remove('translate-x-full');
            const chatInput = document.getElementById('chat-input');
            if (chatInput) setTimeout(() => chatInput.focus(), 300);
        });
    }

    mobNavMore?.addEventListener('click', () => {
        const opening = mobileMoreMenu?.classList.contains('hidden');
        mobileMoreMenu?.classList.toggle('hidden', !opening);
        mobNavMore.setAttribute('aria-expanded', String(Boolean(opening)));
    });

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
                advisoryChevron?.classList.add('rotate-180');
            } else {
                advisoryDetails.classList.add('hidden');
                advisoryChevron?.classList.remove('rotate-180');
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
        compareModal?.classList.remove('hidden');
    };

    if (openCompareModalBtn) openCompareModalBtn.addEventListener('click', openCompare);
    if (closeCompareModalBtn && compareModal) {
        closeCompareModalBtn.addEventListener('click', () => compareModal.classList.add('hidden'));
    }
    if (clearCompareBtn) clearCompareBtn.addEventListener('click', clearAllComparisons);
    if (modalClearAllBtn) modalClearAllBtn.addEventListener('click', clearAllComparisons);
}

function updateMobNavActive(activeId) {
    const ids = ['mob-nav-discover', 'mob-nav-map', 'mob-nav-cost', 'mob-nav-report-reader', 'mob-nav-more'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === activeId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
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
        viewCardsBtn?.classList.add('bg-sky-500', 'text-white', 'font-bold');
        viewCardsBtn?.classList.remove('text-slate-600', 'dark:text-slate-400');
        viewMapBtn?.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        viewMapBtn?.classList.add('text-slate-600', 'dark:text-slate-400');
        mapSection?.classList.add('hidden');
        cardsGrid?.classList.remove('hidden');
    } else {
        viewMapBtn?.classList.add('bg-sky-500', 'text-white', 'font-bold');
        viewMapBtn?.classList.remove('text-slate-600', 'dark:text-slate-400');
        viewCardsBtn?.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        viewCardsBtn?.classList.add('text-slate-600', 'dark:text-slate-400');
        mapSection?.classList.remove('hidden');
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
    const selectedLanguage = ['en', 'hi', 'hi-Latn', 'pa'].includes(langCode) ? langCode : 'en';
    appState.currentLanguage = selectedLanguage;
    if (save) localStorage.setItem('medadvisor_lang', selectedLanguage);
    window.medigoSetLanguage?.(selectedLanguage);

    const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

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

    const searchInput = document.getElementById('disease-search-input');
    if (searchInput) searchInput.placeholder = window.medigoText?.('searchPlaceholder') || t.inputPlaceholder;

    const locationText = document.getElementById('current-location-text');
    if (locationText && !appState.userCoords) locationText.textContent = window.medigoText?.('hospitalsShown') || t.readySearch;
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
    recognition.lang = appState.currentLanguage === 'hi' || appState.currentLanguage === 'hi-Latn' ? 'hi-IN' : (appState.currentLanguage === 'pa' ? 'pa-IN' : 'en-IN');
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
            void openNearestResults(transcript);
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

async function openNearestResults(query) {
    const city = document.getElementById('city-override-input')?.value.trim() || '';
    let coords = appState.userCoords;
    if (city) {
        coords = await resolveCityCenter(city);
        appState.searchCenterCoords = coords;
    } else if (!coords) {
        try {
            coords = await requestCurrentCoordinates();
            appState.userCoords = coords;
            const locationText = document.getElementById('current-location-text');
            if (locationText) locationText.textContent = 'GPS location active · nearby hospitals will be shown nearest first';
        } catch (error) {
            const locationText = document.getElementById('current-location-text');
            if (locationText) locationText.textContent = `${error.message} Enter a city to sort nearby hospitals.`;
            if (!city) return;
        }
    }
    openResultsPage(query, city, coords);
}

function openResultsPage(query, city = "", coords = null) {
    const params = new URLSearchParams({ q: query });
    if (city) params.set("city", city);
    if (coords && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lon ?? coords.lng))) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lon ?? coords.lng));
    }
    window.location.href = `results.html?${params.toString()}`;
}

// =========================================================================
// GEOLOCATION
// =========================================================================

function requestCurrentCoordinates() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('This browser does not support location.'));
        if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname)) {
            return reject(new Error('Location needs a secure HTTPS connection.'));
        }
        const onError = (error) => {
            if ((error.code === 2 || error.code === 3) && !onError.retried) {
                onError.retried = true;
                navigator.geolocation.getCurrentPosition(onSuccess, finalError, { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 });
                return;
            }
            finalError(error);
        };
        const onSuccess = (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
        const finalError = (error) => reject(new Error(error.code === 1
            ? 'Location permission is blocked.'
            : error.code === 3
                ? 'Location request timed out.'
                : 'Your device could not determine a location.'));
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
}

function triggerGeolocation() {
    const locateBtn = document.getElementById('locate-me-btn');
    const locText = document.getElementById('current-location-text');

    if (!navigator.geolocation || (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname))) {
        if (locText) locText.textContent = 'Location needs HTTPS or localhost. Open MediGo over HTTPS, or enter your city below.';
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
            appState.searchCenterCoords = null;
            const cityOverride = document.getElementById('city-override-input');
            if (cityOverride) cityOverride.value = '';
            appState.sortBy = 'distance';
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = 'distance';
            if (locateBtn) {
                locateBtn.classList.remove('animate-spin');
                locateBtn.classList.add('bg-emerald-500', 'text-white');
            }
            if (locText) {
                locText.textContent = `📍 GPS Active (${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)})`;
            }

            const input = document.getElementById('disease-search-input');
            const query = input?.value.trim();
            if (!query) {
                if (locText) locText.textContent = 'Location found. Enter a condition, then search nearby hospitals.';
                return;
            }
            openResultsPage(query, '', appState.userCoords);
        },
        (err) => {
            console.warn('Geolocation denied:', err.message);
            if (locateBtn) locateBtn.classList.remove('animate-spin');
            const reason = err.code === 1 ? 'Location permission is blocked.' : err.code === 3 ? 'Location request timed out.' : 'Your device could not find a location.';
            if (locText) locText.textContent = `${reason} Allow location access and try again, or enter a city below.`;
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
}

// =========================================================================
// DISEASE SEARCH & AI ENTITY EXTRACTION
// =========================================================================

function specialtyForDirectorySearch(query) {
    const text = String(query || '').toLowerCase();
    const rules = [
        [/cancer|tumou?r|oncolog/, 'Oncology'],
        [/heart|cardiac|chest pain|bypass/, 'Cardiology'],
        [/kidney|renal|dialysis/, 'Nephrology'], [/stone|urine|prostate/, 'Urology'],
        [/bone|fracture|knee|joint|orthop/, 'Orthopedics'],
        [/brain|stroke|nerve|neurolog/, 'Neurology'],
        [/child|baby|paediatric|pediatric/, 'Pediatrics'],
        [/lung|breath|asthma|cough/, 'Pulmonology'],
        [/stomach|appendix|liver|gastro/, 'Gastroenterology'],
        [/skin|rash|dermat/, 'Dermatology'], [/eye|vision|ophthalm/, 'Ophthalmology']
    ];
    return rules.find(([pattern]) => pattern.test(text))?.[1] || 'General Medicine';
}

async function searchPublicHospitalDirectory(query, city, coords) {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    const response = await fetch(`${API_BASE}/api/hospitals${params.size ? `?${params}` : ''}`, { headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error('Hospital directory is temporarily unavailable. Please try again.');
    const specialty = specialtyForDirectorySearch(query);
    let hospitals = (data.hospitals || []).filter((hospital) => {
        const departments = (hospital.specialties || []).join(' ').toLowerCase();
        return specialty === 'General Medicine' || departments.includes(specialty.toLowerCase());
    });
    if (!hospitals.length && specialty !== 'General Medicine') hospitals = data.hospitals || [];
    if (!coords && hospitals.some((hospital) => Number.isFinite(Number(hospital.distanceKm)))) {
        hospitals.sort((a, b) => Number(a.distanceKm ?? Infinity) - Number(b.distanceKm ?? Infinity));
    } else if (coords && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lon ?? coords.lng))) {
        const distance = (hospital) => {
            const lat = Number(hospital.lat ?? hospital.coordinates?.lat);
            const lon = Number(hospital.lon ?? hospital.lng ?? hospital.coordinates?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return Infinity;
            const rad = (n) => n * Math.PI / 180;
            const dLat = rad(lat - Number(coords.lat)), dLon = rad(lon - Number(coords.lon ?? coords.lng));
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(Number(coords.lat))) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
            return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };
        hospitals = hospitals.map((hospital) => ({ ...hospital, distanceKm: distance(hospital) })).sort((a, b) => a.distanceKm - b.distanceKm);
    } else hospitals.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return { hospitals, specialty };
}

async function resolveCityCenter(city) {
    if (!city) return null;
    try {
        const response = await fetch(`${API_BASE}/api/location/geocode?city=${encodeURIComponent(city)}`, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        if (!response.ok || !data.success) return null;
        return { lat: Number(data.lat), lon: Number(data.lng), approximate: true, city: data.city };
    } catch {
        return null;
    }
}

async function performDiseaseSearch(query, scrollResults = false) {
    if (!query || !query.trim()) return;

    const cleanQuery = query.trim();
    appState.currentQuery = cleanQuery;

    const cityInput = document.getElementById('city-override-input');
    const cityOverride = cityInput?.value.trim() || '';
    appState.searchCenterCoords = cityOverride ? await resolveCityCenter(cityOverride) : null;
    if (!cityOverride && !appState.userCoords) {
        try {
            appState.userCoords = await requestCurrentCoordinates();
        } catch (locationError) {
            showNotificationToast('Location needed', `${locationError.message} Enter a city or allow location access.`, 'error');
            return;
        }
    }
    if (appState.userCoords || appState.searchCenterCoords || cityOverride) {
        appState.sortBy = 'distance';
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'distance';
    }
    if (appState.searchCenterCoords) {
        appState.detectedLocationName = `${appState.searchCenterCoords.city} city center (approx.)`;
        appState.sortBy = 'distance';
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'distance';
    }

    const searchSubmitBtn = document.getElementById('search-submit-btn');
    if (searchSubmitBtn) {
        searchSubmitBtn.disabled = true;
        searchSubmitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Analyzing Clinical Intent...`;
        window.lucide?.createIcons?.();
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
        window.lucide?.createIcons?.();
    }

    try {
        const res = await fetch(`${API_BASE}/api/hospitals/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: cleanQuery,
                city: cityOverride,
                lat: (appState.userCoords || appState.searchCenterCoords)?.lat,
                lon: (appState.userCoords || appState.searchCenterCoords)?.lon ?? (appState.userCoords || appState.searchCenterCoords)?.lng
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to search hospitals');
        }

        appState.hospitals = data.hospitals || [];
        rememberSavedHospitalRecords(appState.hospitals);
        appState.currentIntent = data.intent || null;
        appState.detectedLocationName = data.searchLocation?.name || 'Local Region';

        renderAIIntentSection(data.intent, data.searchLocation);
        applyFiltersAndSort();

        document.getElementById('results-map-section')?.classList.remove('hidden');
        initOrUpdateMap();

        if (scrollResults) {
            const intentSection = document.getElementById('ai-intent-section');
            intentSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (err) {
        console.error('Search error:', err);
        try {
            const directory = await searchPublicHospitalDirectory(cleanQuery, cityOverride, cityOverride ? appState.searchCenterCoords : appState.userCoords);
            appState.hospitals = directory.hospitals;
            rememberSavedHospitalRecords(appState.hospitals);
            appState.currentIntent = { disease: cleanQuery, specialty: directory.specialty, urgency: 'Routine', explainability: 'Hospitals are matched using their listed departments and your selected area.' };
            appState.detectedLocationName = cityOverride || 'Nearby';
            renderAIIntentSection(appState.currentIntent, { name: appState.detectedLocationName });
            applyFiltersAndSort();
            document.getElementById('results-map-section')?.classList.remove('hidden');
            initOrUpdateMap();
            return;
        } catch (directoryError) {
            console.warn('Public hospital directory fallback failed:', directoryError);
        }
        if (container) {
            container.innerHTML = `
        <div class="col-span-full py-12 text-center theme-card rounded-3xl p-6 border">
          <i data-lucide="alert-circle" class="w-12 h-12 text-rose-500 mx-auto mb-3"></i>
          <h4 class="text-base font-bold text-slate-900 dark:text-white mb-1">Search Encountered an Issue</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">Hospitals could not be loaded right now. Please check your connection and try again.</p>
          <button onclick="performDiseaseSearch('${escapeHtml(cleanQuery)}', true)" class="px-4 py-2 bg-sky-500 text-white font-bold text-xs rounded-xl">Try Again</button>
        </div>
      `;
            window.lucide?.createIcons?.();
        }
    } finally {
        if (searchSubmitBtn) {
            searchSubmitBtn.disabled = false;
            const t = TRANSLATIONS[appState.currentLanguage] || TRANSLATIONS.en;
            searchSubmitBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> <span>${t.searchBtn}</span>`;
            window.lucide?.createIcons?.();
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
    setVal('slot-location', locationInfo?.name || intent.location || 'Local Region');
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
    let list = appState.selectedFilter === 'saved'
        ? Object.values(appState.savedHospitalRecords).filter((hospital) => appState.savedHospitalIds.has(hospital.id))
        : [...appState.hospitals];

    // Apply Filter Chips
    if (appState.selectedFilter === 'emergency') {
        list = list.filter(h => h.emergencyBedsAvailable > 0);
    } else if (appState.selectedFilter === 'ayushman') {
        list = list.filter(h => (h.insuranceAccepted || []).some(ins => ins.toLowerCase().includes('ayushman') || ins.toLowerCase().includes('pm-jay') || ins.toLowerCase().includes('sarbat')));
    } else if (appState.selectedFilter === 'icu') {
        list = list.filter(h => (h.icuAvailable || 0) >= 10);
    } else if (appState.selectedFilter === 'budget') {
        list = list.filter(h => (h.estimatedTreatmentCost?.min || h.avgConsultationCost || 0) <= 50000);
    } else if (appState.selectedFilter === 'rated') {
        list = list.filter(h => (h.rating || 0) >= 4.8);
    }

    // Apply Budget Cap Checkboxes
    if (appState.selectedFilter !== 'saved' && appState.selectedBudgetCaps && appState.selectedBudgetCaps.size > 0) {
        list = list.filter(h => {
            const minCost = h.estimatedTreatmentCost?.min ?? h.avgConsultationCost ?? 0;
            const maxCost = h.estimatedTreatmentCost?.max ?? minCost;
            const consultCost = h.avgConsultationCost ?? 0;

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
        list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (appState.sortBy === 'cost') {
        list.sort((a, b) => (a.estimatedTreatmentCost?.min ?? 999999) - (b.estimatedTreatmentCost?.min ?? 999999));
    } else if (appState.sortBy === 'beds') {
        list.sort((a, b) => (b.icuAvailable ?? 0) - (a.icuAvailable ?? 0));
    } else if (appState.sortBy === 'rating') {
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
        list.sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));
    }

    appState.filteredHospitals = list;

    const badge = document.getElementById('hospitals-count-badge');
    if (badge) badge.textContent = String(list.length);

    renderHospitalCards(list);
    const mapSection = document.getElementById('results-map-section');
    if (mapSection && !mapSection.classList.contains('hidden') && window.L) {
        initOrUpdateMap();
    }
}

// =========================================================================
// HOSPITAL CARDS RENDERING (MOBILE-FIRST & DUAL THEME)
// =========================================================================

function renderHospitalCards(hospitals) {
    const container = document.getElementById('hospitals-grid');
    if (!container) return;
    const t = (key) => window.medigoText?.(key) || key;

    if (hospitals.length === 0) {
        const isSavedView = appState.selectedFilter === 'saved';
        container.innerHTML = `
      <div class="col-span-full py-16 text-center theme-card rounded-3xl p-8 border">
        <i data-lucide="${isSavedView ? 'heart' : 'search-x'}" class="w-16 h-16 mx-auto text-slate-400 mb-3"></i>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${isSavedView ? t('noSavedHospitals') : t('noFilteredHospitals')}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">${isSavedView ? t('saveHospitalHint') : t('adjustFilters')}</p>
        <button onclick="resetFilters()" class="px-4 py-2 bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm">${isSavedView ? t('browseHospitals') : t('resetFilters')}</button>
      </div>
    `;
        window.lucide?.createIcons?.();
        return;
    }

    container.innerHTML = hospitals.map(h => {
        const isCompared = appState.comparedIds.has(h.id);
        const isSaved = appState.savedHospitalIds.has(h.id);
        const costMin = formatCurrency(h.estimatedTreatmentCost?.min);
        const distanceDisplay = h.distanceKm != null ? `${h.distanceKm} km` : t('nearYou');
        const commute = h.commuteDuration || `${Math.max(8, Math.round((h.distanceKm || 5) * 2.2 + 4))} mins`;

        // Accreditations Badges
        const accreditationsHtml = (h.accreditations || []).slice(0, 3).map(acc => `
      <span class="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        ${escapeHtml(acc)}
      </span>
    `).join('');

        return `
      <article class="theme-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between border ${isCompared ? 'theme-card-selected' : ''}" data-id="${escapeHtml(h.id)}">
        ${h.image && /^https:\/\//i.test(h.image) ? `<img src="${escapeHtml(h.image)}" alt="${escapeHtml(h.name)}" class="mb-3 h-40 w-full rounded-2xl object-cover" loading="lazy" onerror="this.hidden=true">` : `<div class="mb-3 flex h-40 w-full items-center justify-center rounded-2xl bg-sky-50 text-4xl" role="img" aria-label="${escapeHtml(h.name)}">🏥</div>`}
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

            <!-- Rating and save controls -->
            <div class="flex shrink-0 items-center gap-1.5">
              <button type="button" title="${isSaved ? t('removeSaved') : t('save')}" aria-label="${isSaved ? t('removeSaved') : t('save')}" onclick="toggleSavedHospital('${escapeHtml(h.id)}')" class="rounded-xl border px-2.5 py-1 text-xs font-bold ${isSaved ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600'}">${isSaved ? `♥ ${t('saved')}` : `♡ ${t('save')}`}</button>
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs">
              <span>★</span>
              <span>${escapeHtml(h.rating)}</span>
            </div>
            </div>
          </div>

          <!-- Commute & Distance Badge Bar -->
          <div class="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 py-1.5 border-y border-slate-200 dark:border-slate-800/80 my-2.5">
            <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <i data-lucide="navigation" class="w-3.5 h-3.5"></i> ${distanceDisplay}
            </span>
            <span class="text-slate-300 dark:text-slate-600">•</span>
            <span class="flex items-center gap-1">
              <i data-lucide="car" class="w-3.5 h-3.5"></i> ~${commute} ${t('drive')}
            </span>
            <span class="text-slate-300 dark:text-slate-600">•</span>
              <span>${escapeHtml(h.hours || t('open24Hours'))}</span>
          </div>

          <!-- 3-Pill Clinical Metric Matrix -->
          <div class="grid grid-cols-3 gap-2 my-3 text-center">
            
            <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span class="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">🛏️ ${t('icuBeds')}</span>
              <span class="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">${h.icuAvailable ?? 8} ${t('ready')}</span>
            </div>

            <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span class="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">💰 ${t('estimatedProcedure')}</span>
              <span class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">${costMin}</span>
            </div>

            <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span class="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">📈 ${t('outcome')}</span>
              <span class="text-xs sm:text-sm font-extrabold text-sky-600 dark:text-sky-400 block mt-0.5">${h.successRate ?? 95}% ${t('rate')}</span>
            </div>

          </div>

          <!-- Accreditations & Govt Schemes -->
          <div class="flex flex-wrap items-center gap-1.5 mb-3">
            ${accreditationsHtml}
          </div>

          <!-- AI Explainability Reason -->
          <div class="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-700 dark:text-sky-200 leading-relaxed mb-3">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 inline mr-1 text-sky-500"></i>
            ${escapeHtml(h.explainabilityReason || t('verifiedProvider'))}
          </div>
        </div>

        <!-- Action Buttons Row (Touch Optimized for Mobile) -->
        <div class="grid grid-cols-5 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <a href="tel:${escapeHtml(h.phone)}" class="py-2.5 px-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-sm transition-all">
            <i data-lucide="phone" class="w-3 h-3"></i>
            <span>${t('call')}</span>
          </a>

          <a href="${h.mapUrl}" target="_blank" rel="noopener" class="py-2.5 px-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-sm transition-all">
            <i data-lucide="map" class="w-3 h-3"></i>
            <span>${t('map')}</span>
          </a>

          <button type="button" onclick="openReviewModal('${escapeHtml(h.id)}', '${escapeHtml(h.name)}')" class="py-2.5 px-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-sm">
            <i data-lucide="star" class="w-3 h-3"></i>
            <span>${t('review')}</span>
          </button>

          <button type="button" onclick="shareHospital('${escapeHtml(h.id)}')" class="py-2.5 px-1 rounded-xl bg-violet-50 text-violet-700 font-bold border border-violet-200 text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-sm"><i data-lucide="share-2" class="w-3 h-3"></i><span>${t('share')}</span></button>

          <button type="button" onclick="toggleCompareHospital('${escapeHtml(h.id)}')" class="py-2.5 px-1 rounded-xl ${isCompared ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700'} text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-sm">
            <i data-lucide="sliders-horizontal" class="w-3 h-3"></i>
            <span>${isCompared ? t('added') : t('compare')}</span>
          </button>
        </div>

      </article>
    `;
    }).join('');

    window.lucide?.createIcons?.();
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

    const centerCoords = appState.searchCenterCoords
        ? { lat: Number(appState.searchCenterCoords.lat), lon: Number(appState.searchCenterCoords.lon ?? appState.searchCenterCoords.lng) }
        : appState.userCoords
        ? { lat: Number(appState.userCoords.lat), lon: Number(appState.userCoords.lon ?? appState.userCoords.lng) }
        : null;
    const hasUserCoordinates = Number.isFinite(centerCoords?.lat) && Number.isFinite(centerCoords?.lon);
    if (hasUserCoordinates) {
        if (userLocationMarker) userLocationMarker.remove();
        userLocationMarker = L.circleMarker([centerCoords.lat, centerCoords.lon], {
            radius: 9,
            color: '#0ea5e9',
            fillColor: '#38bdf8',
            fillOpacity: 0.95,
            weight: 3
        }).bindPopup(`<strong>📍 ${appState.searchCenterCoords ? 'Approximate city center' : 'GPS location'}: ${escapeHtml(appState.detectedLocationName)}</strong>`).addTo(resultsMap);
        boundsPoints.push([centerCoords.lat, centerCoords.lon]);
    } else if (userLocationMarker) {
        userLocationMarker.remove();
        userLocationMarker = null;
    }

    appState.filteredHospitals.forEach(h => {
        const lat = Number(h.lat ?? h.coordinates?.lat);
        const lon = Number(h.lon ?? h.lng ?? h.coordinates?.lng);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            const marker = L.marker([lat, lon])
                .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="color: #0f172a; font-size: 14px;">${escapeHtml(h.name)}</strong><br/>
            <span style="color: #0284c7; font-size: 11px; font-weight: bold;">⭐ ${h.rating ?? 'Rating not listed'}${h.distanceKm != null ? ` • ${h.distanceKm} km away` : ''}</span><br/>
            <span style="color: #10b981; font-size: 11px;">🛏️ ${h.icuAvailable} ICU Beds</span><br/>
            ${h.phone ? `<a href="tel:${String(h.phone).replace(/[^+\d]/g, '')}" style="display:inline-block; margin-top:6px; background:#0ea5e9; color:#fff; padding:4px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">Call Hospital</a>` : ''}
          </div>
        `)
                .addTo(mapMarkersGroup);

            boundsPoints.push([lat, lon]);
        }
    });

    if (boundsPoints.length > 0) {
        resultsMap.fitBounds(boundsPoints, { padding: [30, 30], maxZoom: 14 });
    }

    const mapStatus = document.getElementById('map-status');
    const mappedCount = boundsPoints.length - (hasUserCoordinates ? 1 : 0);
    if (mapStatus) mapStatus.textContent = `${mappedCount} hospitals shown near ${appState.detectedLocationName}`;
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
    const compareCount = document.getElementById('compare-selected-count');
    if (compareCount) compareCount.textContent = String(count);
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
    const hospital = appState.hospitals.find(h => h.id === hospitalId) || appState.savedHospitalRecords[hospitalId] || appState.comparedMap.get(hospitalId);
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
        <h4 class="text-base font-bold text-slate-900 dark:text-white mb-1">${window.medigoText?.('noHospitalsSelected') || 'No hospitals selected'}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">${window.medigoText?.('tapCompare') || 'Click + Compare on any hospital card to see side-by-side metrics.'}</p>
      </div>
    `;
        window.lucide?.createIcons?.();
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

  window.lucide?.createIcons?.();
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
  appState.selectedBudgetCaps.clear();
  document.querySelectorAll('.budget-checkbox').forEach(cb => cb.checked = false);
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

function toggleSavedHospital(id) {
  if (appState.savedHospitalIds.has(id)) {
    appState.savedHospitalIds.delete(id);
    delete appState.savedHospitalRecords[id];
  } else {
    const hospital = appState.hospitals.find((item) => item.id === id) || appState.savedHospitalRecords[id];
    if (!hospital) return;
    appState.savedHospitalIds.add(id);
    appState.savedHospitalRecords[id] = hospital;
  }
  localStorage.setItem('medigo_saved_hospitals', JSON.stringify([...appState.savedHospitalIds]));
  localStorage.setItem('medigo_saved_hospital_data', JSON.stringify(appState.savedHospitalRecords));
  applyFiltersAndSort();
}

async function shareHospital(id) {
  const hospital = appState.hospitals.find(item => item.id === id) || appState.savedHospitalRecords[id];
  if (!hospital) return;
  const shareData = { title: hospital.name, text: `${hospital.name} — ${hospital.location || 'Hospital'} | MediGo`, url: hospital.mapUrl || location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); showNotificationToast('Link copied', 'Hospital details are ready to share.'); }
  } catch (error) { if (error.name !== 'AbortError') showNotificationToast('Could not share', 'Please try again.', 'error'); }
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
  window.lucide?.createIcons?.();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 350);
  }, 4800);
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
        window.lucide?.createIcons?.();
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

        const data = await res.json().catch(() => ({}));
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
          window.lucide?.createIcons?.();
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
  window.lucide?.createIcons?.();
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
