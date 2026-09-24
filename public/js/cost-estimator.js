document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cost-estimate-form");
  const citySelect = document.getElementById("cost-city");
  const cityOptions = document.getElementById("cost-city-options");
  const procedureInput = document.getElementById("cost-procedure");
  const schemeHint = document.getElementById("cost-scheme-hint");
  const beneficiaryToggle = document.getElementById("cost-beneficiary");
  const schemeWrap = document.getElementById("cost-scheme-wrap");
  const schemeSelect = document.getElementById("cost-scheme");
  const status = document.getElementById("cost-estimate-status");
  const results = document.getElementById("cost-estimate-results");
  const submit = document.getElementById("cost-estimate-submit");
  if (!form || !citySelect || !beneficiaryToggle || !status || !results || !submit) return;

  const apiBase = window.MEDIGO_API_BASE;
  const t = (key) => window.medigoText?.(key) || key;
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  let userCoordinates = null;

  beneficiaryToggle.addEventListener("change", () => {
    schemeWrap.classList.toggle("hidden", !beneficiaryToggle.checked);
    schemeSelect.required = beneficiaryToggle.checked;
    if (beneficiaryToggle.checked) loadOptions();
  });

  let cityListLoaded = false;
  let lastEstimateData = null;
  let lastEstimateFailed = false;
  let optionTimer;
  async function loadOptions() {
    const params = new URLSearchParams();
    if (citySelect.value.trim()) params.set("city", citySelect.value.trim());
    if (procedureInput.value.trim()) params.set("procedure", procedureInput.value.trim());
    try {
      const response = await fetch(`${apiBase}/api/cost-estimate/options?${params}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not load suggestions.");
      if (!cityListLoaded && Array.isArray(data.cities)) {
        cityOptions.replaceChildren(...data.cities.map((city) => {
          const option = document.createElement("option"); option.value = city; return option;
        }));
        cityListLoaded = true;
      }
      const procedureOptions = document.getElementById("cost-procedure-options");
      if (procedureOptions && Array.isArray(data.procedures)) procedureOptions.replaceChildren(...data.procedures.map((item) => new Option(item.procedureName, item.procedureName)));
      const current = schemeSelect.value;
      schemeSelect.replaceChildren(new Option(t("chooseScheme"), ""));
      (data.schemes || []).forEach((scheme) => schemeSelect.add(new Option(scheme, scheme)));
      if ([...schemeSelect.options].some((option) => option.value === current)) schemeSelect.value = current;
      if (schemeHint) schemeHint.textContent = citySelect.value.trim()
        ? (data.schemes?.length ? t("schemesListed").replace("{city}", citySelect.value.trim()) : t("noSchemesListed"))
        : t("enterCitySchemes");
    } catch (error) {
      if (schemeHint) schemeHint.textContent = t("cityChoicesError");
    }
  }
  const scheduleOptions = () => { clearTimeout(optionTimer); optionTimer = setTimeout(loadOptions, 250); };
  loadOptions();
  window.addEventListener("medigo:languagechange", () => {
    scheduleOptions();
    if (lastEstimateData) {
      renderResults(lastEstimateData);
      status.textContent = t("estimateReady");
    } else if (lastEstimateFailed) {
      status.textContent = t("estimateFailed");
    }
  });
  citySelect.addEventListener("input", scheduleOptions);
  procedureInput.addEventListener("input", scheduleOptions);
  document.getElementById("cost-use-location")?.addEventListener("click", () => {
    if (!navigator.geolocation) { status.textContent = "Location is unavailable; enter your city."; return; }
    status.textContent = "Waiting for location permission…";
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        userCoordinates = { lat: coords.latitude, lng: coords.longitude };
        const params = new URLSearchParams({ lat: String(coords.latitude), lng: String(coords.longitude) });
        const response = await fetch(`${apiBase}/api/location/resolve?${params}`); const data = await response.json();
        if (!response.ok || !data.city) throw new Error("Could not determine a city from this location.");
        citySelect.value = data.city; scheduleOptions(); status.textContent = `Using your location: ${data.city}.`;
      } catch (error) { status.textContent = `${error.message} Enter your city instead.`; }
    }, () => { status.textContent = "Location permission was not granted. Enter your city instead."; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      procedureKey: document.getElementById("cost-procedure").value,
      city: citySelect.value,
      isBeneficiary: beneficiaryToggle.checked,
      scheme: beneficiaryToggle.checked ? schemeSelect.value : null,
      language: window.MEDIGO_LANGUAGE || "en",
      ...(userCoordinates || {}),
    };
    submit.disabled = true;
    status.textContent = t("preparingEstimate");
    status.className = "mt-2 text-xs text-slate-600";
    results.replaceChildren();
    results.classList.add("hidden");

    try {
      const response = await fetch(`${apiBase}/api/cost-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("medigo_auth_token") || ""}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) { const error = new Error(data.error || "Could not create estimate."); error.status = response.status; error.suggestions = data.suggestions || []; throw error; }
      lastEstimateData = data;
      lastEstimateFailed = false;
      renderResults(data);
      status.textContent = t("estimateReady");
      status.className = "mt-2 text-xs font-semibold text-emerald-700";
    } catch (error) {
      if (error.status === 401) window.openMediGoAuth?.("Please sign in again to continue.");
      lastEstimateData = null;
      lastEstimateFailed = true;
      status.textContent = error.suggestions?.length
        ? `${error.message} ${error.suggestions.join(", ")}`
        : error.message || t("estimateFailed");
      status.className = "mt-2 text-xs font-semibold text-rose-700";
    } finally {
      submit.disabled = false;
    }
  });

  function renderResults(data) {
    results.replaceChildren();
    const estimate = data.estimate;
    const panel = document.createElement("div");
    panel.className = "rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900";
    const heading = document.createElement("h3");
    heading.className = "font-extrabold text-slate-950";
    heading.textContent = `${estimate.procedureName} · ${estimate.city}`;
    panel.append(heading);

    const costGrid = document.createElement("div");
    costGrid.className = "mt-3 grid grid-cols-2 gap-2";
    costGrid.append(
      metricCard(t("privateRange"), `${formatCurrency(estimate.privateAverage.min)}–${formatCurrency(estimate.privateAverage.max)}${estimate.unit === "session" ? " / session" : ""}`),
    );
    costGrid.append(
      metricCard(estimate.scheme ? `${estimate.scheme} · ${t("schemeRate")}` : t("schemeRate"), estimate.packageRateReference == null ? t("noScheme") : formatCurrency(estimate.packageRateReference)),
    );
    panel.append(costGrid);

    if (estimate.scheme && estimate.potentialSavings != null) {
      const savings = document.createElement("p");
      savings.className = "mt-3 text-xs font-bold text-emerald-800";
      savings.textContent = estimate.potentialSavings >= 0
        ? `${t("privateMidpoint")}: ${formatCurrency(estimate.potentialSavings)}${estimate.unit === "session" ? " / session" : ""}`
        : `${t("schemeReference")}: ${formatCurrency(Math.abs(estimate.potentialSavings))}`;
      panel.append(savings);

      const barLabel = document.createElement("div");
      barLabel.className = "mt-3 flex justify-between text-[10px] font-semibold text-slate-700";
      const privateLabel = document.createElement("span");
      privateLabel.textContent = t("privateMidpoint");
      const schemeLabel = document.createElement("span");
      schemeLabel.textContent = t("schemeReference");
      barLabel.append(privateLabel, schemeLabel);
      const track = document.createElement("div");
      track.className = "mt-1 h-3 overflow-hidden rounded-full bg-slate-200";
      const fill = document.createElement("div");
      fill.className = "h-full rounded-full bg-emerald-600 transition-all";
      fill.style.width = `${estimate.progressPercent}%`;
      fill.setAttribute("role", "progressbar");
      fill.setAttribute("aria-label", t("schemeReference"));
      fill.setAttribute("aria-valuemin", "0");
      fill.setAttribute("aria-valuemax", "100");
      fill.setAttribute("aria-valuenow", String(estimate.progressPercent));
      track.append(fill);
      panel.append(barLabel, track);
    }

    const source = document.createElement("p");
    source.className = "mt-2 text-[10px] text-slate-600";
    source.textContent = `${estimate.isDemo ? "DEMO DATA · " : ""}${estimate.source || "Rate source not specified"}${estimate.reviewedAt ? ` · Reviewed ${new Date(estimate.reviewedAt).toLocaleDateString()}` : ""}`;
    panel.append(source);
    results.append(panel);

    const hospitalTitle = document.createElement("h3");
    hospitalTitle.className = "text-sm font-extrabold text-slate-900";
    hospitalTitle.textContent = `${estimate.scheme || t("relevantHospitals")} · ${estimate.city} (${data.hospitals.length})`;
    results.append(hospitalTitle);

    if (data.hospitals.length) {
      const list = document.createElement("div");
      list.className = "space-y-2";
      data.hospitals.forEach((hospital) => list.append(hospitalCard(hospital)));
      results.append(list);
    } else {
      const empty = document.createElement("p");
      empty.className = "rounded-xl bg-slate-100 p-3 text-xs text-slate-700";
      empty.textContent = t("noCostHospitals");
      results.append(empty);
    }

    const disclaimer = document.createElement("p");
    disclaimer.className = "text-[11px] leading-relaxed text-slate-600";
    disclaimer.textContent = t("costDisclaimer");
    results.append(disclaimer);
    results.classList.remove("hidden");
  }

  function metricCard(label, value) {
    const card = document.createElement("div");
    card.className = "rounded-lg border border-slate-200 bg-white p-2";
    const labelNode = document.createElement("span");
    labelNode.className = "block text-[10px] font-semibold text-slate-600";
    labelNode.textContent = label;
    const valueNode = document.createElement("strong");
    valueNode.className = "mt-1 block text-sm text-slate-950";
    valueNode.textContent = value;
    card.append(labelNode, valueNode);
    return card;
  }

  function hospitalCard(hospital) {
    const card = document.createElement("article");
    card.className = "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3";
    const info = document.createElement("div");
    info.className = "min-w-0";
    const name = document.createElement("p");
    name.className = "truncate text-xs font-extrabold text-slate-900";
    name.textContent = hospital.name;
    const location = document.createElement("p");
    location.className = "mt-1 text-[11px] text-slate-600";
    const packageStatus = hospital.schemeAccepted
      ? hospital.procedurePackageListed ? " · Procedure package listed" : " · Confirm procedure package"
      : "";
    location.textContent = `${hospital.location || hospital.city}${Number.isFinite(Number(hospital.distanceKm)) ? ` · ${hospital.distanceKm} km` : ""}${hospital.rating ? ` · ★ ${hospital.rating}` : ""}${packageStatus}`;
    info.append(name, location);
    card.append(info);

    const actions = document.createElement("div");
    actions.className = "flex shrink-0 gap-1";
    if (hospital.phone) actions.append(link(`tel:${String(hospital.phone).replace(/[^+\d]/g, "")}`, t("call"), "bg-emerald-700"));
    if (hospital.mapUrl?.startsWith("https://www.google.com/maps/")) actions.append(link(hospital.mapUrl, t("navMap"), "bg-sky-700", true));
    card.append(actions);
    return card;
  }

  function link(href, label, color, newTab = false) {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.className = `inline-flex min-h-10 items-center rounded-lg ${color} px-3 text-[11px] font-bold text-white`;
    anchor.textContent = label;
    if (newTab) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    return anchor;
  }
});
