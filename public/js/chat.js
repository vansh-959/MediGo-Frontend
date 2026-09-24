document.addEventListener("DOMContentLoaded", () => {
  const apiBase = window.MEDIGO_API_BASE;
  const chatDrawer = document.getElementById("chat-drawer");
  const openChatBtn = document.getElementById("floating-chat-trigger");
  const closeChatBtn = document.getElementById("close-chat-btn");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const chatSubmitBtn = document.getElementById("chat-submit-btn");
  const chatMicBtn = document.getElementById("chat-mic-btn");
  const chatHistory = [];
  const t = (key) => window.medigoText?.(key) || key;
  if (!chatDrawer || !chatForm || !chatInput || !chatMessages) return;

  openChatBtn?.addEventListener("click", openChat);
  closeChatBtn?.addEventListener("click", () => chatDrawer.classList.add("translate-x-full"));

  function openChat() {
    chatDrawer.classList.remove("translate-x-full");
    setTimeout(() => chatInput.focus(), 250);
  }

  document.querySelectorAll(".chat-prompt-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      chatInput.value = pill.textContent.trim();
      submitChatMessage(chatInput.value);
    });
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  const setSpeechLanguage = () => {
    if (!recognition) return;
    const selectedLanguage = window.MEDIGO_LANGUAGE || localStorage.getItem("medadvisor_lang") || "en";
    recognition.lang = selectedLanguage === "hi" || selectedLanguage === "hi-Latn"
      ? "hi-IN"
      : selectedLanguage === "pa" ? "pa-IN" : "en-IN";
  };
  if (chatMicBtn && SpeechRecognition) {
    recognition = new SpeechRecognition();
    setSpeechLanguage();
    recognition.interimResults = false;
    chatMicBtn.addEventListener("click", () => {
      try {
        setSpeechLanguage();
        recognition.start();
        chatMicBtn.classList.add("bg-rose-500", "text-white", "animate-pulse");
      } catch (error) {
        console.warn("Voice input could not start:", error.message);
        appendMessage("ai", t("chatVoiceUnavailable"));
      }
    });
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      submitChatMessage(transcript);
    };
    recognition.onend = () => chatMicBtn.classList.remove("bg-rose-500", "text-white", "animate-pulse");
    recognition.onerror = (event) => {
      chatMicBtn.classList.remove("bg-rose-500", "text-white", "animate-pulse");
      if (event.error === "no-speech" || event.error === "aborted") return;
      appendMessage("ai", event.error === "not-allowed" ? t("chatVoiceDenied") : t("chatVoiceUnavailable"));
    };
    window.addEventListener("medigo:languagechange", setSpeechLanguage);
  } else if (chatMicBtn) {
    chatMicBtn.hidden = true;
  }

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitChatMessage(chatInput.value.trim());
  });

  async function submitChatMessage(message) {
    if (!message || chatSubmitBtn?.disabled) return;
    appendMessage("user", message);
    chatInput.value = "";
    chatInput.disabled = true;
    if (chatSubmitBtn) chatSubmitBtn.disabled = true;
    const typingId = appendTypingIndicator();

    try {
      const detectedCity = typeof appState !== "undefined" ? appState.detectedLocationName || "" : "";
      const typedCity = document.getElementById("city-override-input")?.value.trim() || "";
      const city = typedCity || (/^(local region|chandigarh region|nearby|your area|gps location|your gps location|all listed locations)$/i.test(detectedCity.trim()) ? "" : detectedCity);
      let location = typeof appState !== "undefined" ? appState.userCoords || null : null;
      if (needsNearbyHospitals(message) && !hasUsableLocation(location)) {
        location = await requestChatLocation();
        if (location && typeof appState !== "undefined") appState.userCoords = location;
      }
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, city, location, language: window.MEDIGO_LANGUAGE || "en", history: chatHistory.slice(-8) }),
        signal: AbortSignal.timeout(40000),
      });
      const data = await response.json().catch(() => ({}));
      removeTypingIndicator(typingId);

      if (!response.ok || !data.success || !data.reply) {
        appendMessage("ai", data.error || "MediGo AI could not answer right now. Please try again.");
        return;
      }

      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "model", content: data.reply });
      if (chatHistory.length > 10) chatHistory.splice(0, chatHistory.length - 10);
      appendMessage("ai", data.reply, data);
    } catch (error) {
      removeTypingIndicator(typingId);
      const messageText = error.name === "TimeoutError" ? t("chatTimeout") : t("chatBackend");
      appendMessage("ai", messageText);
    } finally {
      chatInput.disabled = false;
      if (chatSubmitBtn) chatSubmitBtn.disabled = false;
      chatInput.focus();
    }
  }

  function needsNearbyHospitals(message) {
    const asksNearby = /\bnear\s+me\b|\bnearby\b|\bnearest\b|\baround\s+me\b|\bin\s+my\s+area\b|\bclose\s+to\s+me\b|\bmy\s+location\b|mere\s+(?:paas|area|nazdeek)|aas\s+paas|nazdeek|\bpaas\b|मेरे\s+पास|मेरे\s+इलाके|नज़दीक|पास\s+में|ਨੇੜੇ|ਮੇਰੇ\s+ਨੇੜੇ/i.test(message);
    const asksForCare = /\bhospitals?\b|\bclinics?\b|\bdoctors?\b|\bspecialists?\b|\w+ologist\b|\bcardio\w*\b|\bneuro\w*\b|\bortho\w*\b|\b(onco|kidney|heart|cancer|fracture)\b|अस्पताल|डॉक्टर|ਹਸਪਤਾਲ|ਡਾਕਟਰ/i.test(message);
    return asksNearby && asksForCare;
  }

  function hasUsableLocation(location) {
    return Number.isFinite(Number(location?.lat)) && Math.abs(Number(location.lat)) <= 90 &&
      Number.isFinite(Number(location?.lng ?? location?.lon)) && Math.abs(Number(location.lng ?? location.lon)) <= 180;
  }

  function requestChatLocation() {
    if (!navigator.geolocation) return Promise.resolve(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => {
          console.info("Chat location was not available:", error.code);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
      );
    });
  }

  function appendMessage(role, text, data = null) {
    const msgDiv = document.createElement("div");
    msgDiv.className = role === "user" ? "flex justify-end" : "flex justify-start";
    const formattedText = escapeHtml(text)
      .replace(/^#{1,3}\s*(.+)$/gm, "<strong>$1</strong>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^[-*]\s+(.+)$/gm, "• $1")
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");

    let recommendationsHtml = "";
    if (Array.isArray(data?.recommendations) && data.recommendations.length) {
      recommendationsHtml = `
        <div class="mt-3 space-y-2 border-t border-slate-200 pt-3">
          <div class="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider text-sky-700">
            <span>${escapeHtml(t("directoryMatches"))}</span><span class="text-slate-500">${escapeHtml(t("availabilityNotLive"))}</span>
          </div>
          ${data.recommendations.map((hospital) => `
            <article class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
              <div class="min-w-0 flex-1">
                <strong class="block truncate text-xs text-slate-900">${escapeHtml(hospital.name)}</strong>
                <span class="block text-[10px] text-slate-600">${escapeHtml(hospital.city)}${Number.isFinite(hospital.distanceKm) ? ` · ${hospital.distanceKm} km` : ""}${Number.isFinite(hospital.rating) ? ` · ★ ${hospital.rating}` : ""}</span>
              </div>
              <div class="flex shrink-0 gap-1">
                ${hospital.mapUrl ? `<a href="${escapeHtml(hospital.mapUrl)}" target="_blank" rel="noopener noreferrer" class="rounded-lg bg-sky-700 px-2 py-1 text-[10px] font-bold text-white">${escapeHtml(t("navMap"))}</a>` : ""}
                ${hospital.phone ? `<a href="tel:${escapeHtml(hospital.phone)}" class="rounded-lg bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">${escapeHtml(t("call"))}</a>` : ""}
              </div>
            </article>`).join("")}
        </div>`;
    }

    const bubble = document.createElement("div");
    bubble.className = role === "user"
      ? "max-w-[90%] rounded-2xl rounded-tr-none bg-gradient-to-r from-sky-600 to-indigo-700 p-3.5 text-sm font-semibold leading-relaxed text-white shadow-md"
      : "theme-card max-w-[92%] rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-900 shadow-md";
    if (role === "ai") {
      const heading = document.createElement("div");
      heading.className = "mb-2 flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-sky-800";
      heading.innerHTML = `<span class="flex items-center gap-1.5"><i data-lucide="bot" class="h-3.5 w-3.5"></i>MediGo AI</span><span class="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-[9px] text-sky-800">${escapeHtml(data?.source || "Status")}</span>`;
      bubble.append(heading);
    }
    const copy = document.createElement("div");
    copy.className = "chat-ai-copy break-words";
    copy.innerHTML = formattedText;
    bubble.append(copy);
    if (recommendationsHtml) {
      const extra = document.createElement("div");
      extra.innerHTML = recommendationsHtml;
      bubble.append(extra);
    }
    msgDiv.append(bubble);
    chatMessages.append(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    window.lucide?.createIcons?.();
  }

  function appendTypingIndicator() {
    const id = `typing-${Date.now()}`;
    const indicator = document.createElement("div");
    indicator.id = id;
    indicator.className = "flex justify-start";
    indicator.innerHTML = `<div class="rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-xs text-slate-700"><span class="animate-pulse">${escapeHtml(t("chatThinking"))}</span></div>`;
    chatMessages.append(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }
});
