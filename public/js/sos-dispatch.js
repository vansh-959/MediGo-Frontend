document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("emergency-sos-trigger");
  const dialog = document.getElementById("emergency-sos-dialog");
  const status = document.getElementById("emergency-sos-status");
  let countdownLabel = document.getElementById("emergency-sos-countdown");
  const result = document.getElementById("emergency-sos-result");
  const cancel = document.getElementById("emergency-sos-cancel");
  if (!trigger || !dialog || !status || !countdownLabel || !result || !cancel) return;
  const t = (key) => window.medigoText?.(key) || key;

  const COUNTDOWN_SECONDS = 8;
  let timer = null;
  let activeRequest = 0;
  let requestInProgress = false;
  let dispatchStarted = false;
  let capturedLocation = null;

  trigger.addEventListener("click", startSos);
  cancel.addEventListener("click", () => {
    if (dispatchStarted) {
      dialog.classList.add("hidden");
      dialog.classList.remove("flex");
      return;
    }
    cancelSos();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && !requestInProgress) cancelSos();
  });

  function startSos() {
    if (requestInProgress) return;
    if (!navigator.geolocation) {
      showDialog();
      status.textContent = t("sosNoGps");
      countdownLabel.textContent = "—";
      cancel.textContent = t("close");
      return;
    }

    const requestId = ++activeRequest;
    requestInProgress = true;
    trigger.disabled = true;
    capturedLocation = null;
    cancel.textContent = t("sosCancel");
    result.replaceChildren();
    result.classList.add("hidden");
    showDialog();

    let secondsLeft = COUNTDOWN_SECONDS;
    countdownLabel.textContent = String(secondsLeft);
    const countdownText = t("sosGettingLocation").replace("{seconds}", String(secondsLeft));
    status.replaceChildren(document.createTextNode(countdownText.split(String(secondsLeft))[0]));
    const boldCountdown = document.createElement("strong");
    boldCountdown.id = "emergency-sos-countdown";
    boldCountdown.textContent = String(secondsLeft);
    status.append(boldCountdown, document.createTextNode(countdownText.split(String(secondsLeft)).slice(1).join(String(secondsLeft))));
    countdownLabel = status.querySelector("#emergency-sos-countdown");

    const locationPromise = new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracyMeters: Math.round(position.coords.accuracy),
          },
        }),
        (error) => resolve({ error }),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });

    timer = window.setInterval(() => {
      secondsLeft -= 1;
      if (countdownLabel) countdownLabel.textContent = String(Math.max(secondsLeft, 0));
      if (secondsLeft <= 0) {
        window.clearInterval(timer);
        timer = null;
        dispatchStarted = true;
        dispatchSos(requestId, locationPromise);
      }
    }, 1000);
  }

  async function dispatchSos(requestId, locationPromise) {
    if (requestId !== activeRequest) return;
    cancel.textContent = t("close");
    status.textContent = t("sosSending");
    try {
      const locationResult = await locationPromise;
      if (locationResult.error) throw locationResult.error;
      const location = locationResult.location;
      capturedLocation = location;
      if (requestId !== activeRequest) return;
      const response = await fetch(`${window.MEDIGO_API_BASE}/api/emergency/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          accuracyMeters: location.accuracyMeters,
          clientTimestamp: new Date().toISOString(),
          clientStatus: `MediGo browser SOS request; geolocation accuracy ±${location.accuracyMeters} m; network ${navigator.onLine ? "online" : "offline"}`,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "SOS notification could not be processed.");
      showDispatchResult(data);
    } catch (error) {
      status.textContent = error.code === 1
        ? t("sosPermission")
        : error.code === 3
          ? t("sosGpsTimeout")
          : t("sosNetworkError");
      status.className = "mt-1 text-sm font-bold text-rose-800";
      countdownLabel.textContent = "!";
      result.classList.remove("hidden");
      result.replaceChildren();
      const offlineNote = document.createElement("p");
      offlineNote.textContent = t("noLiveDispatch");
      result.append(offlineNote);
      if (capturedLocation) {
        const coordinates = document.createElement("p");
        coordinates.className = "mt-2 font-mono text-xs font-bold text-slate-900";
        coordinates.textContent = `Your coordinates: ${capturedLocation.lat.toFixed(6)}, ${capturedLocation.lng.toFixed(6)}`;
        result.append(coordinates);
        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.className = "mt-2 min-h-10 rounded-lg bg-slate-700 px-3 text-xs font-bold text-white";
        copyButton.textContent = t("copyCoordinates");
        copyButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(`${capturedLocation.lat}, ${capturedLocation.lng}`);
            copyButton.textContent = t("copied");
          } catch {
            copyButton.textContent = t("copyUnavailable");
          }
        });
        result.append(copyButton);
      }
      cancel.textContent = t("close");
    } finally {
      requestInProgress = false;
      dispatchStarted = false;
      trigger.disabled = false;
    }
  }

  function showDispatchResult(data) {
    status.className = "mt-1 text-sm font-bold text-slate-900";
    status.textContent = data.emailSent ? t("sosEmailSent") : t("sosEmailFailed");
    countdownLabel.textContent = "✓";
    result.replaceChildren();

    if (data.resolvedAddress) {
      const address = document.createElement("p");
      address.className = "mb-2 text-xs font-semibold text-slate-800";
      address.textContent = data.resolvedAddress;
      result.append(address);
    }
    const timestamp = document.createElement("p");
    timestamp.className = "mb-2 text-[11px] text-slate-600";
    timestamp.textContent = `${t("requestTime")}: ${new Date(data.timestamp).toLocaleString()}`;
    result.append(timestamp);

    const nearest = data.nearestEmergencyHospital;
    if (nearest) {
      const hospital = document.createElement("p");
      hospital.className = "text-xs font-bold text-slate-900";
      hospital.textContent = `${t("nearestListedHospital")}: ${nearest.name}${Number.isFinite(nearest.distanceKm) ? ` · ${nearest.distanceKm} km` : ""}`;
      result.append(hospital);
      const links = document.createElement("div");
      links.className = "mt-2 flex flex-wrap gap-2";
      if (nearest.phone) links.append(makeLink(`tel:${String(nearest.phone).replace(/[^+\d]/g, "")}`, `${t("call")} ${nearest.phone}`, "bg-emerald-700"));
      if (nearest.mapUrl) links.append(makeLink(nearest.mapUrl, t("directions"), "bg-sky-700", true));
      result.append(links);
    }
    result.classList.remove("hidden");
    cancel.textContent = t("close");
    window.lucide?.createIcons();
  }

  function makeLink(href, label, colorClass, newTab = false) {
    const link = document.createElement("a");
    link.href = href;
    link.className = `inline-flex min-h-10 items-center justify-center rounded-lg ${colorClass} px-3 text-xs font-bold text-white`;
    link.textContent = label;
    if (newTab) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function showDialog() {
    dialog.classList.remove("hidden");
    dialog.classList.add("flex");
    window.lucide?.createIcons();
  }

  function cancelSos() {
    activeRequest += 1;
    requestInProgress = false;
    dispatchStarted = false;
    if (timer) window.clearInterval(timer);
    timer = null;
    trigger.disabled = false;
    dialog.classList.add("hidden");
    dialog.classList.remove("flex");
  }
});
