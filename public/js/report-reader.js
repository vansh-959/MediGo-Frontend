document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("report-image-input");
  const previewWrap = document.getElementById("report-preview-wrap");
  const preview = document.getElementById("report-image-preview");
  const fileName = document.getElementById("report-file-name");
  const analyzeButton = document.getElementById("analyze-report-btn");
  const status = document.getElementById("report-reader-status");
  const results = document.getElementById("report-analysis-results");
  if (!input || !analyzeButton || !status || !results) return;
  const t = (key) => window.medigoText?.(key) || key;

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  let selectedFile = null;
  let previewUrl = null;

  input.addEventListener("change", () => {
    selectedFile = input.files?.[0] || null;
    results.replaceChildren();
    results.classList.add("hidden");
    status.textContent = "";

    if (!selectedFile) {
      analyzeButton.disabled = true;
      previewWrap.classList.add("hidden");
      return;
    }
    if (!allowedTypes.has(selectedFile.type)) {
      rejectFile(t("reportImageType"));
      return;
    }
    if (selectedFile.size > 8 * 1024 * 1024) {
      rejectFile(t("reportImageLarge"));
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(selectedFile);
    preview.src = previewUrl;
    fileName.textContent = selectedFile.name;
    previewWrap.classList.remove("hidden");
    analyzeButton.disabled = false;
  });

  analyzeButton.addEventListener("click", async () => {
    if (!selectedFile) return;
    analyzeButton.disabled = true;
    analyzeButton.querySelector("span").textContent = t("reportAnalyzing");
    status.textContent = t("reportWorking");
    status.className = "mt-2 text-xs text-slate-600";
    results.replaceChildren();
    results.classList.add("hidden");

    try {
      const params = new URLSearchParams();
      params.set("language", window.MEDIGO_LANGUAGE || "en");
      const city = document.getElementById("city-override-input")?.value.trim();
      if (city) params.set("city", city);
      const coords = typeof appState !== "undefined" ? appState.userCoords : null;
      if (coords && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lng ?? coords.lon))) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng ?? coords.lon));
      }

      const token = localStorage.getItem("medigo_auth_token");
      const headers = { "Content-Type": selectedFile.type };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${window.MEDIGO_API_BASE}/api/reports/analyze?${params}`, {
        method: "POST",
        headers,
        body: selectedFile,
        // Gemini may retry a temporary model failure before returning a result.
        signal: AbortSignal.timeout(90000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        if (response.status === 401) {
          localStorage.removeItem("medigo_auth_token");
          localStorage.removeItem("medigo_user");
          const error = new Error("Your session expired. Sign in again, then analyze the report.");
          error.authRequired = true;
          throw error;
        }
        throw new Error(data.error || t("reportCouldNotReach"));
      }
      syncDirectoryAndMap(data.hospitals || [], data.analysis);
      renderAnalysis(data);
      status.textContent = data.analysisAvailable === false
        ? data.message || data.analysis?.summary || t("reportCouldNotReach")
        : t("reportDone");
      status.className = data.analysisAvailable === false
        ? "mt-2 text-xs font-semibold text-amber-800"
        : "mt-2 text-xs font-semibold text-emerald-700";
    } catch (error) {
      status.textContent = error.name === "TimeoutError"
        ? t("reportTimeout")
        : error.authRequired
          ? error.message
        : (error.message?.includes("GEMINI_API_KEY") || error.message?.includes("configured")
          ? t("reportCouldNotReach")
          : error.message || t("reportCouldNotReach"));
      status.className = "mt-2 text-xs font-semibold text-rose-700";
      if (error.authRequired) window.openMediGoAuth?.();
    } finally {
      analyzeButton.disabled = !selectedFile;
      analyzeButton.querySelector("span").textContent = t("analyzeReport");
    }
  });

  function rejectFile(message) {
    selectedFile = null;
    input.value = "";
    analyzeButton.disabled = true;
    previewWrap.classList.add("hidden");
    status.textContent = message;
    status.className = "mt-2 text-xs font-semibold text-rose-700";
  }

  function renderAnalysis(data) {
    const analysis = data.analysis || {};
    const panel = document.createElement("div");
    panel.className = "rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900";
    const header = document.createElement("div");
    header.className = "flex items-center justify-between gap-2";
    const title = document.createElement("h3");
    title.className = "font-extrabold";
    title.textContent = analysis.documentType || t("reportTitle");
    const severity = document.createElement("span");
    severity.className = "rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-900";
    severity.textContent = `${t("priority")}: ${analysis.severity || "unclear"}`;
    header.append(title, severity);
    panel.append(header);
    addField(panel, t("possibleCondition"), analysis.possibleCondition);
    addField(panel, t("recommendedDepartment"), analysis.department);
    addField(panel, t("summary"), analysis.summary);

    const keywords = document.createElement("div");
    keywords.className = "mt-3";
    const keywordHeading = document.createElement("p");
    keywordHeading.className = "text-xs font-bold text-slate-700";
    keywordHeading.textContent = t("extractedKeywords");
    keywords.append(keywordHeading);
    const keywordList = document.createElement("div");
    keywordList.className = "mt-1 flex flex-wrap gap-1.5";
    (analysis.diagnosisKeywords || []).forEach((word) => {
      const chip = document.createElement("span");
      chip.className = "rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-900";
      chip.textContent = word;
      keywordList.append(chip);
    });
    if (!keywordList.childElementCount) {
      const empty = document.createElement("span");
      empty.className = "text-xs text-slate-600";
      empty.textContent = t("noKeywords");
      keywordList.append(empty);
    }
    keywords.append(keywordList);
    panel.append(keywords);
    results.append(panel);

    const hospitalsHeading = document.createElement("h3");
    hospitalsHeading.className = "text-sm font-extrabold text-slate-900";
    hospitalsHeading.textContent = `${t("reportHospitalHeading")}: ${analysis.department || "General Medicine"} (${data.hospitals?.length || 0})`;
    results.append(hospitalsHeading);

    if (data.hospitals?.length) {
      const list = document.createElement("div");
      list.className = "space-y-2";
      data.hospitals.forEach((hospital) => list.append(renderHospital(hospital)));
      results.append(list);
    } else {
      const empty = document.createElement("p");
      empty.className = "rounded-xl bg-slate-100 p-3 text-xs text-slate-700";
      empty.textContent = t("noHospitals");
      results.append(empty);
    }

    const disclaimer = document.createElement("p");
    disclaimer.className = "text-[11px] text-slate-600";
    disclaimer.textContent = t("reportResultDisclaimer");
    results.append(disclaimer);
    results.classList.remove("hidden");
  }

  function syncDirectoryAndMap(hospitals, analysis) {
    if (typeof appState === "undefined") return;
    appState.hospitals = hospitals.map((hospital) => ({
      ...hospital,
      lat: Number.isFinite(Number(hospital.lat)) ? Number(hospital.lat) : null,
      lon: Number.isFinite(Number(hospital.lon)) ? Number(hospital.lon) : null,
      rankScore: Number(hospital.rating) || 0,
    }));
    appState.currentQuery = analysis?.possibleCondition || "Medical report results";
    appState.currentIntent = analysis || null;
    appState.selectedFilter = "all";
    if (typeof rememberSavedHospitalRecords === "function") {
      rememberSavedHospitalRecords(appState.hospitals);
    }
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      const active = chip.dataset.filter === "all";
      chip.classList.toggle("bg-sky-500", active);
      chip.classList.toggle("text-white", active);
      chip.classList.toggle("font-bold", active);
      chip.classList.toggle("bg-white", !active);
    });
    document.getElementById("results-map-section")?.classList.remove("hidden");
    if (typeof applyFiltersAndSort === "function") applyFiltersAndSort();
    if (typeof initOrUpdateMap === "function") initOrUpdateMap();
  }

  function addField(parent, label, value) {
    const row = document.createElement("p");
    row.className = "mt-2 text-xs leading-relaxed text-slate-800";
    const strong = document.createElement("strong");
    strong.className = "text-slate-950";
    strong.textContent = `${label}: `;
    row.append(strong, document.createTextNode(value || "Not identified"));
    parent.append(row);
  }

  function renderHospital(hospital) {
    const card = document.createElement("article");
    card.className = "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3";
    const info = document.createElement("div");
    info.className = "min-w-0";
    const name = document.createElement("p");
    name.className = "truncate text-xs font-extrabold text-slate-900";
    name.textContent = hospital.name;
    const location = document.createElement("p");
    location.className = "mt-1 text-[11px] text-slate-600";
    const distance = Number.isFinite(hospital.distanceKm) ? ` · ${hospital.distanceKm} km` : "";
    location.textContent = `${hospital.location || hospital.city || ""}${distance}${hospital.rating ? ` · ★ ${hospital.rating}` : ""}`;
    info.append(name, location);
    card.append(info);
    const actions = document.createElement("div");
    actions.className = "flex shrink-0 gap-1";
    if (hospital.mapUrl?.startsWith("https://www.google.com/maps/")) {
      const directions = document.createElement("a");
      directions.href = hospital.mapUrl;
      directions.target = "_blank";
      directions.rel = "noopener noreferrer";
      directions.className = "rounded-lg bg-sky-600 px-2 py-2 text-[10px] font-bold text-white";
      directions.textContent = t("directions");
      actions.append(directions);
    }
    if (hospital.phone) {
      const call = document.createElement("a");
      call.href = `tel:${String(hospital.phone).replace(/[^+\d]/g, "")}`;
      call.className = "rounded-lg bg-emerald-600 px-2 py-2 text-[10px] font-bold text-white";
      call.textContent = t("call");
      actions.append(call);
    }
    card.append(actions);
    return card;
  }
});
