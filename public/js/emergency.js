(() => {
  const API_BASE = window.MEDIGO_API_BASE;
  const select = document.getElementById("hospital-select");
  const hospitalList = document.getElementById("trauma-hospitals-list");
  const locationIndicator = document.getElementById("trauma-location-indicator");
  let hospitals = [];
  let patientLocation = null;
  let selectedEta = 10;

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
        hospital.distanceKm = distanceKm(
          patientLocation.lat,
          patientLocation.lng,
          Number(hospital.lat),
          Number(hospital.lon),
        );
      });
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return result;
  };

  const renderHospitals = () => {
    const ordered = sortedHospitals();
    if (!ordered.length) {
      select.innerHTML =
        '<option value="" disabled selected>No emergency hospitals are available right now</option>';
      select.disabled = true;
      hospitalList.innerHTML =
        '<p class="py-6 text-center text-xs text-slate-500">No emergency hospitals are available right now. Call 108 for immediate help.</p>';
      return;
    }

    select.disabled = false;
    select.innerHTML =
      '<option value="" disabled>Select trauma-ready hospital...</option>' +
      ordered
        .map(
          (hospital) =>
            `<option value="${escapeHtml(hospital.id)}">${escapeHtml(hospital.name)} (${escapeHtml(hospital.city)} · ${Number(hospital.icuAvailable) || 0} ICU beds)</option>`,
        )
        .join("");

    if (!ordered.some((hospital) => hospital.id === select.value)) {
      select.value = ordered[0].id;
    }
    updateSelectedHospital();

    hospitalList.innerHTML = ordered
      .slice(0, 4)
      .map((hospital) => {
        const mapUrl =
          hospital.mapUrl ||
          `https://www.google.com/maps/dir/?api=1&destination=${Number(hospital.lat)},${Number(hospital.lon)}`;
        const phone = String(hospital.phone ?? "").replace(/[^+\d]/g, "");
        const distance = Number.isFinite(hospital.distanceKm)
          ? ` · ${hospital.distanceKm.toFixed(1)} km away`
          : "";
        return `
          <article class="theme-card rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div class="min-w-0 flex-1">
              <span class="text-[9px] uppercase font-black text-rose-500 tracking-wider block">24/7 Emergency Unit</span>
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">${escapeHtml(hospital.name)}</h4>
              <div class="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>${escapeHtml(hospital.location || hospital.city)}${distance}</span>
                <span class="text-emerald-500 font-bold">${Number(hospital.emergencyBedsAvailable) || 0} emergency beds · ${Number(hospital.icuAvailable) || 0} ICU beds</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <a href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-xl bg-sky-500 text-white text-[11px] font-bold">Directions</a>
              ${phone ? `<a href="tel:${escapeHtml(phone)}" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-bold">Call</a>` : ""}
              <button type="button" data-select-hospital="${escapeHtml(hospital.id)}" class="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-bold">Select</button>
            </div>
          </article>`;
      })
      .join("");

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
    document.getElementById("hospital-beds-preview").textContent =
      `Emergency: ${Number(hospital.emergencyBedsAvailable) || 0} beds · ICU: ${Number(hospital.icuAvailable) || 0} available`;
    const callLink = document.getElementById("hospital-call-direct");
    const phone = String(hospital.phone ?? "").replace(/[^+\d]/g, "");
    callLink.href = phone ? `tel:${phone}` : "#";
    callLink.hidden = !phone;
  };

  const loadHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/hospitals?emergencyOnly=true`);
      if (!response.ok) throw new Error(`Hospital API returned ${response.status}`);
      const data = await response.json();
      if (!data.success || !Array.isArray(data.hospitals)) {
        throw new Error(data.error || "Invalid hospital response");
      }
      hospitals = data.hospitals;
      renderHospitals();
    } catch (error) {
      console.error("Failed to load emergency hospitals:", error);
      select.innerHTML =
        '<option value="" disabled selected>Could not load hospitals · call 108</option>';
      select.disabled = true;
      hospitalList.innerHTML =
        '<p class="py-6 text-center text-xs text-rose-500">Could not load emergency hospitals. Check your connection or call 108.</p>';
    }
  };

  const setLocation = (position) => {
    patientLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    locationIndicator.textContent = "Nearest to your GPS location";
    renderHospitals();
  };

  document.getElementById("theme-toggle-btn").addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("medadvisor_theme", isDark ? "dark" : "light");
    window.lucide?.createIcons();
  });

  const savedTheme = localStorage.getItem("medadvisor_theme");
  if (savedTheme === "light") document.documentElement.classList.remove("dark");
  if (savedTheme === "dark") document.documentElement.classList.add("dark");

  document.querySelectorAll(".eta-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".eta-btn").forEach((item) => {
        item.classList.remove("border-rose-500", "bg-rose-500", "text-white");
        item.classList.add(
          "border-slate-200",
          "dark:border-slate-800",
          "bg-slate-50",
          "dark:bg-slate-900",
        );
      });
      button.classList.add("border-rose-500", "bg-rose-500", "text-white");
      button.classList.remove(
        "border-slate-200",
        "dark:border-slate-800",
        "bg-slate-50",
        "dark:bg-slate-900",
      );
      selectedEta = Number(button.dataset.eta) || 10;
    });
  });

  select.addEventListener("change", updateSelectedHospital);
  document
    .getElementById("detect-gps-hospitals")
    .addEventListener("click", () => {
      if (!navigator.geolocation) {
        locationIndicator.textContent = "GPS is unavailable · showing all centers";
        return;
      }
      navigator.geolocation.getCurrentPosition(
        setLocation,
        () => {
          locationIndicator.textContent = "Location unavailable · showing all centers";
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
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

      const button = document.getElementById("dispatch-alert-btn");
      button.disabled = true;
      button.textContent = "Sending emergency alert…";
      const chosenHospital = hospitals.find((hospital) => hospital.id === select.value);
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
        etaMinutes: selectedEta,
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
          ? `Preparation alert emailed to ${chosenHospital.name}. Call the hospital if you do not receive confirmation.`
          : `The request was logged, but the hospital email was not sent. Call ${chosenHospital.name} at ${chosenHospital.phone} or dial 108 now.`;
        document.getElementById("eta-countdown-display").textContent = `~${selectedEta} minutes`;
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
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      setLocation,
      () => {
        locationIndicator.textContent = "Enable location to sort by distance";
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  } else {
    locationIndicator.textContent = "GPS unavailable · showing all centers";
  }
  window.lucide?.createIcons();
})();
