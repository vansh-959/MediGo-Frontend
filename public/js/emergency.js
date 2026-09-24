(() => {
  const API_BASE = window.MEDIGO_API_BASE;
  const select = document.getElementById("hospital-select");
  const hospitalList = document.getElementById("trauma-hospitals-list");
  const locationIndicator = document.getElementById("trauma-location-indicator");
  const t = (key) => window.medigoText?.(key) || key;
  let hospitals = [];
  let patientLocation = null;
  let showingDirectoryFallback = false;
  let emergencyMap = null;
  let emergencyMarkers = null;
  const localEmergencyHospitals = [
    { id: "hosp-chd-1", name: "PGIMER (Post Graduate Institute of Medical Education & Research)", city: "Chandigarh", location: "Sector 12, Chandigarh", emergencyBedsAvailable: 42, icuAvailable: 38, lat: 30.7673, lon: 76.7794, phone: "+91 172 2747585" },
    { id: "hosp-chd-2", name: "Max Super Speciality Hospital", city: "Chandigarh", location: "Phase 6, Mohali", emergencyBedsAvailable: 18, icuAvailable: 16, lat: 30.7258, lon: 76.7088, phone: "+91 172 5212000" },
    { id: "hosp-chd-3", name: "Fortis Hospital Mohali", city: "Chandigarh", location: "Sector 62, Mohali", emergencyBedsAvailable: 22, icuAvailable: 20, lat: 30.7046, lon: 76.7179, phone: "+91 172 5021222" },
    { id: "hosp-chd-4", name: "Government Medical College & Hospital (GMCH 32)", city: "Chandigarh", location: "Sector 32, Chandigarh", emergencyBedsAvailable: 34, icuAvailable: 24, lat: 30.7092, lon: 76.777, phone: "+91 172 2665253" },
    { id: "hosp-chd-5", name: "Mukat Hospital & Heart Institute", city: "Chandigarh", location: "Sector 34-A, Chandigarh", emergencyBedsAvailable: 14, icuAvailable: 12, lat: 30.7225, lon: 76.7682, phone: "+91 172 4344444" },
  ];

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });

  const distanceKm = (fromLat, fromLng, toLat, toLng) => {
    const radians = (value) => (value * Math.PI) / 180;
    const dLat = radians(toLat - fromLat);
    const dLng = radians(toLng - fromLng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radians(fromLat)) *
        Math.cos(radians(toLat)) *
        Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sortedHospitals = () => {
    const result = [...hospitals];
    if (patientLocation) {
      result.forEach((hospital) => {
        const lat = Number(hospital.lat ?? hospital.coordinates?.lat);
        const lng = Number(hospital.lon ?? hospital.lng ?? hospital.coordinates?.lng);
        hospital.distanceKm = Number.isFinite(lat) && Number.isFinite(lng)
          ? distanceKm(patientLocation.lat, patientLocation.lng, lat, lng)
          : Number.POSITIVE_INFINITY;
      });
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      result.sort((a, b) => (Number.isFinite(Number(a.distanceKm)) ? Number(a.distanceKm) : Number.POSITIVE_INFINITY) - (Number.isFinite(Number(b.distanceKm)) ? Number(b.distanceKm) : Number.POSITIVE_INFINITY));
    }
    return result;
  };

  const renderEmergencyMap = (ordered) => {
    const mapNode = document.getElementById("emergency-hospital-map");
    const mapCount = document.getElementById("emergency-map-count");
    if (!mapNode) return;
    if (!window.L) { if (mapCount) mapCount.textContent = "Map unavailable"; return; }
    if (!emergencyMap) {
      const first = ordered.find((hospital) => Number.isFinite(Number(hospital.lat ?? hospital.coordinates?.lat)) && Number.isFinite(Number(hospital.lon ?? hospital.lng ?? hospital.coordinates?.lng)));
      emergencyMap = L.map(mapNode).setView(patientLocation ? [patientLocation.lat, patientLocation.lng] : first ? [Number(first.lat ?? first.coordinates.lat), Number(first.lon ?? first.lng ?? first.coordinates.lng)] : [30.7333, 76.7794], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors", maxZoom: 18 }).addTo(emergencyMap);
      emergencyMarkers = L.layerGroup().addTo(emergencyMap);
    }
    emergencyMarkers.clearLayers();
    const points = [];
    if (patientLocation) {
      L.circleMarker([patientLocation.lat, patientLocation.lng], { radius: 8, color: "#0284c7", fillColor: "#38bdf8", fillOpacity: .95, weight: 3 }).bindPopup("Your current location").addTo(emergencyMarkers);
      points.push([patientLocation.lat, patientLocation.lng]);
    }
    ordered.forEach((hospital, index) => {
      const lat = Number(hospital.lat ?? hospital.coordinates?.lat);
      const lng = Number(hospital.lon ?? hospital.lng ?? hospital.coordinates?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const marker = L.marker([lat, lng]).bindPopup(`<strong>${escapeHtml(patientLocation && index === 0 ? "Nearest listed hospital · " : "")}${escapeHtml(hospital.name)}</strong><br>${escapeHtml(hospital.location || hospital.city || "")}${Number.isFinite(hospital.distanceKm) ? `<br>${hospital.distanceKm.toFixed(1)} km away` : ""}`);
      marker.addTo(emergencyMarkers); points.push([lat, lng]);
    });
    if (points.length > 1) emergencyMap.fitBounds(points, { padding: [24, 24], maxZoom: 14 });
    else if (points.length === 1) emergencyMap.setView(points[0], 13);
    if (mapCount) mapCount.textContent = `${points.length - (patientLocation ? 1 : 0)} hospitals plotted`;
    setTimeout(() => emergencyMap.invalidateSize(), 50);
  };

  const renderHospitals = ({ selectNearest = false } = {}) => {
    const ordered = sortedHospitals();
    if (!ordered.length) {
      select.innerHTML =
        `<option value="" disabled selected>${escapeHtml(t("noEmergencyHospitals"))}</option>`;
      select.disabled = true;
      hospitalList.innerHTML =
        `<p class="py-6 text-center text-xs text-slate-500">${escapeHtml(t("noEmergencyHospitals"))}</p>`;
      return;
    }

    const previouslySelected = select.value;
    select.disabled = false;
    select.innerHTML =
      `<option value="" disabled>${escapeHtml(t("selectHospital"))}</option>` +
      ordered
        .map(
          (hospital) => {
            const distance = Number.isFinite(hospital.distanceKm) ? ` · ${hospital.distanceKm.toFixed(1)} km` : "";
            const capacity = hospital.source === "OpenStreetMap"
              ? t("availabilityUnconfirmed")
              : `${Number(hospital.emergencyBedsAvailable) || 0} ${t("emergencyBeds")}`;
            return `<option value="${escapeHtml(hospital.id)}">${escapeHtml(hospital.name)} (${escapeHtml(hospital.city)} · ${escapeHtml(capacity)}${distance})</option>`;
          },
        )
        .join("");

    select.value = !selectNearest && ordered.some((hospital) => hospital.id === previouslySelected)
      ? previouslySelected
      : ordered[0].id;
    updateSelectedHospital();

    hospitalList.innerHTML = ordered
      .map((hospital, index) => {
        const latitude = Number(hospital.lat);
        const longitude = Number(hospital.lon);
        const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
        const mapUrl = hospital.mapUrl || (hasCoordinates
          ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name} ${hospital.city}`)}`);
        const phone = String(hospital.phone ?? "").replace(/[^+\d]/g, "");
        const distance = Number.isFinite(hospital.distanceKm)
          ? ` · ${hospital.distanceKm.toFixed(1)} km away`
          : "";
        return `
          <article class="theme-card rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div class="min-w-0 flex-1">
              <span class="text-[9px] uppercase font-black text-rose-500 tracking-wider block">${patientLocation && index === 0 ? "NEAREST LISTED HOSPITAL · " : ""}${escapeHtml(showingDirectoryFallback ? t("directoryHospitalFallbackLabel") : t("emergencyUnit"))}</span>
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">${escapeHtml(hospital.name)}</h4>
              <div class="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>${escapeHtml(hospital.location || hospital.city)}${distance}</span>
              <span class="text-emerald-500 font-bold">${hospital.source === "OpenStreetMap" ? escapeHtml(t("availabilityUnconfirmed")) : `${Number(hospital.emergencyBedsAvailable) || 0} ${escapeHtml(t("emergencyBeds"))} · ${Number(hospital.icuAvailable) || 0} ${escapeHtml(t("icuBedsLabel"))}`}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <a href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-xl bg-sky-500 text-white text-[11px] font-bold">${escapeHtml(t("directions"))}</a>
              ${phone ? `<a href="tel:${escapeHtml(phone)}" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-bold">${escapeHtml(t("call"))}</a>` : ""}
              <button type="button" data-select-hospital="${escapeHtml(hospital.id)}" class="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-bold">${escapeHtml(t("select"))}</button>
            </div>
          </article>`;
      })
      .join("");

    renderEmergencyMap(ordered);

    hospitalList.querySelectorAll("[data-select-hospital]").forEach((button) => {
      button.addEventListener("click", () => {
        select.value = button.dataset.selectHospital;
        updateSelectedHospital();
        select.focus();
      });
    });
    window.lucide?.createIcons();
  };

  const updateSelectedHospital = () => {
    const hospital = hospitals.find((item) => item.id === select.value);
    const info = document.getElementById("hospital-live-info");
    if (!hospital) {
      info.classList.add("hidden");
      return;
    }
    info.classList.remove("hidden");
    document.getElementById("hospital-beds-preview").textContent = hospital.source === "OpenStreetMap"
      ? t("availabilityUnconfirmed")
      : `${t("emergencyBeds")}: ${Number(hospital.emergencyBedsAvailable) || 0} · ${t("icuBedsLabel")}: ${Number(hospital.icuAvailable) || 0} ${t("available")}`;
    const callLink = document.getElementById("hospital-call-direct");
    const phone = String(hospital.phone ?? "").replace(/[^+\d]/g, "");
    callLink.href = phone ? `tel:${phone}` : "#";
    callLink.hidden = !phone;
  };

  const loadHospitals = async (coordinates = patientLocation, { selectNearest = false } = {}) => {
    let gpsDirectoryHadNoNearbyResults = false;
    if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng)) {
      try {
        const nearbyUrl = new URL(`${API_BASE}/api/hospitals/nearby`);
        nearbyUrl.searchParams.set("lat", String(coordinates.lat));
        nearbyUrl.searchParams.set("lng", String(coordinates.lng));
        nearbyUrl.searchParams.set("radiusKm", "50");
        const nearbyResponse = await fetch(nearbyUrl, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(26000),
        });
        const nearbyData = await nearbyResponse.json();
        if (nearbyResponse.ok && nearbyData.success && Array.isArray(nearbyData.hospitals)) {
          if (nearbyData.hospitals.length) {
            hospitals = nearbyData.hospitals;
            showingDirectoryFallback = false;
            document.getElementById("hospital-directory-note")?.classList.add("hidden");
            const heading = document.getElementById("trauma-hospitals-heading");
            if (heading) heading.lastChild.textContent = ` ${t("nearbyTraumaHeading")}`;
            locationIndicator.textContent = t("nearestGps");
            renderHospitals({ selectNearest: true });
            return;
          }
          gpsDirectoryHadNoNearbyResults = true;
        }
      } catch (error) {
        console.warn("GPS nearby hospital discovery unavailable; using MediGo directory:", error.message);
      }
    }
    const locationParams = new URLSearchParams();
    locationParams.set("emergencyOnly", "true");
    if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng)) {
      locationParams.set("lat", String(coordinates.lat));
      locationParams.set("lng", String(coordinates.lng));
    }
    try {
      let data = null;
      try {
        const emergencyResponse = await fetch(`${API_BASE}/api/hospitals?${locationParams}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(12000),
        });
        if (emergencyResponse.ok) data = await emergencyResponse.json();
      } catch (error) {
        console.warn("Emergency-only hospital list unavailable; trying the directory.", error.message);
      }

      hospitals = data?.success && Array.isArray(data.hospitals) ? data.hospitals : [];
      showingDirectoryFallback = hospitals.length === 0;
      if (showingDirectoryFallback) {
        const directoryUrl = new URL(`${API_BASE}/api/hospitals`);
        if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng)) {
          directoryUrl.searchParams.set("lat", String(coordinates.lat));
          directoryUrl.searchParams.set("lng", String(coordinates.lng));
        }
        const directoryResponse = await fetch(directoryUrl, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(12000),
        });
        const directory = await directoryResponse.json();
        if (!directoryResponse.ok || !directory.success || !Array.isArray(directory.hospitals)) {
          throw new Error(directory.error || `Hospital directory returned ${directoryResponse.status}`);
        }
        const listed = directory.hospitals;
        const emergencyCandidates = listed.filter((hospital) => {
          const listedCare = [
            ...(hospital.specialties || []),
            ...(hospital.features || []),
            ...(hospital.services || []),
            hospital.hours || "",
          ].join(" ").toLowerCase();
          return Number(hospital.emergencyBedsAvailable) > 0 || /emergency|trauma|24\s*hours|24\/7/.test(listedCare);
        });
        hospitals = emergencyCandidates.length ? emergencyCandidates : listed;
        const note = document.getElementById("hospital-directory-note");
        if (note) {
          note.textContent = t("directoryHospitalFallbackNote");
          note.classList.remove("hidden");
        }
        const heading = document.getElementById("trauma-hospitals-heading");
        if (heading) heading.lastChild.textContent = ` ${t("directoryHospitalFallbackHeading")}`;
      }
      if (!hospitals.length) throw new Error("The hospital directory returned no hospitals.");
      if (gpsDirectoryHadNoNearbyResults) {
        const note = document.getElementById("hospital-directory-note");
        if (note) {
          note.textContent = t("noNearbyHospitalsFallback");
          note.classList.remove("hidden");
        }
      }
      renderHospitals({ selectNearest });
    } catch (error) {
      console.error("Failed to load emergency hospitals:", error);
      hospitals = localEmergencyHospitals.map((hospital) => ({ ...hospital }));
      showingDirectoryFallback = true;
      const note = document.getElementById("hospital-directory-note");
      if (note) {
        note.textContent = t("localEmergencyFallbackNote");
        note.classList.remove("hidden");
      }
      locationIndicator.textContent = t("localEmergencyFallbackHeading");
      renderHospitals();
    }
  };

  const setLocation = (position) => {
    patientLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    locationIndicator.textContent = t("nearestGps");
    void loadHospitals(patientLocation, { selectNearest: true });
  };

  const locationErrorText = (error) => {
    if (error?.code === 1) return t("gpsPermissionDenied");
    if (error?.code === 3) return t("gpsTimeout");
    if (error?.code === 2) return t("gpsPositionUnavailable");
    return t("locationUnavailableAll");
  };

  const requestGpsLocation = (onDone = () => {}) => {
    if (!navigator.geolocation) {
      locationIndicator.textContent = t("gpsUnavailableAll");
      onDone();
      return;
    }
    if (!window.isSecureContext && !["localhost", "127.0.0.1"].includes(location.hostname)) {
      locationIndicator.textContent = t("gpsSecureContextRequired");
      onDone();
      return;
    }

    locationIndicator.textContent = t("loadingTrauma");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        onDone();
      },
      (error) => {
        console.warn("Could not get emergency page GPS location:", error.message);
        // A device may not have a quick GPS fix indoors. Retry with network/Wi-Fi location.
        if (error.code === 2 || error.code === 3) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation(position);
              onDone();
            },
            (retryError) => {
              locationIndicator.textContent = locationErrorText(retryError);
              onDone();
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
          );
          return;
        }
        locationIndicator.textContent = locationErrorText(error);
        onDone();
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  window.addEventListener("medigo:languagechange", renderHospitals);

  document.getElementById("theme-toggle-btn").addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("medadvisor_theme", isDark ? "dark" : "light");
    window.lucide?.createIcons();
  });

  const savedTheme = localStorage.getItem("medadvisor_theme");
  if (savedTheme === "light") document.documentElement.classList.remove("dark");
  if (savedTheme === "dark") document.documentElement.classList.add("dark");



  select.addEventListener("change", updateSelectedHospital);
  document
    .getElementById("detect-gps-hospitals")
    .addEventListener("click", (event) => {
      const button = event.currentTarget;
      const originalLabel = button.innerHTML;
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      requestGpsLocation(() => {
        button.disabled = false;
        button.removeAttribute("aria-busy");
        button.innerHTML = originalLabel;
        window.lucide?.createIcons();
      });
    });

  document
    .getElementById("emergency-alert-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!hospitals.some((hospital) => hospital.id === select.value)) {
        select.setCustomValidity("Select an available receiving hospital.");
        select.reportValidity();
        return;
      }
      select.setCustomValidity("");

      const chosenHospital = hospitals.find((hospital) => hospital.id === select.value);
      if (chosenHospital?.source === "OpenStreetMap") {
        window.alert(`${t("mapOnlyHospitalNotice")} ${chosenHospital.phone ? `${t("call")}: ${chosenHospital.phone}.` : ""} ${t("call108Notice")}`);
        return;
      }

      const button = document.getElementById("dispatch-alert-btn");
      button.disabled = true;
      button.textContent = t("sendingEmergencyAlert");
      const payload = {
        patientName: document.getElementById("patient-name").value.trim(),
        patientAge: document.getElementById("patient-age").value,
        patientGender: document.getElementById("patient-gender").value,
        patientPhone: document.getElementById("patient-phone").value.trim(),
        condition: document.getElementById("emergency-condition").value,
        urgency: "Emergency",
        requiredCare: Array.from(
          document.querySelectorAll('input[name="prep"]:checked'),
        ).map((checkbox) => checkbox.value),
        hospitalId: chosenHospital.id,
        hospitalName: chosenHospital.name,
        notes: document.getElementById("emergency-notes").value.trim(),
        location: patientLocation,
      };

      try {
        const response = await fetch(`${API_BASE}/api/emergency/notify-hospital`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Could not send the emergency alert.");
        }

        document.getElementById("dispatch-success-banner").classList.remove("hidden");
        document.getElementById("ticket-ref-id").textContent = data.referenceId;
        document.getElementById("ticket-summary").textContent = data.emailSent
          ? `Email sent to ${chosenHospital.name}; hospital receipt is not confirmed. Call the hospital and dial 108 for ambulance dispatch.`
          : `The hospital email was not sent. Call ${chosenHospital.name} at ${chosenHospital.phone} or dial 108 now.`;
        document.getElementById("eta-countdown-display").textContent = "Not available · call 108";
        const mapLink = document.getElementById("ticket-map-link");
        mapLink.href = chosenHospital.mapUrl;
        const callLink = document.getElementById("ticket-call-link");
        callLink.href = `tel:${String(chosenHospital.phone ?? "").replace(/[^+\d]/g, "")}`;
        button.textContent = "Alert logged · call 108 for immediate help";
        document.getElementById("dispatch-success-banner").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } catch (error) {
        window.alert(`${error.message} If this is urgent, call 108 now.`);
        button.disabled = false;
        button.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Retry Emergency Alert</span>';
        window.lucide?.createIcons();
      }
    });

  loadHospitals();
  requestGpsLocation();
  window.lucide?.createIcons();
})();
