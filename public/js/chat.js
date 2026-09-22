// Gemini AI Chatbot Drawer JS Interaction
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.location.port === '5501' ? 'http://localhost:3000' : '';
  const chatDrawer = document.getElementById('chat-drawer');
  const openChatBtn = document.getElementById('open-chat-btn');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  if (!chatDrawer) return;

  // Toggle Drawer
  if (openChatBtn) {
    openChatBtn.addEventListener('click', () => {
      if (!localStorage.getItem('medadvisor_token')) {
        window.location.href = 'auth.html?mode=signup';
        return;
      }
      chatDrawer.classList.remove('translate-x-full');
      if (chatInput) chatInput.focus();
    });
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
      chatDrawer.classList.add('translate-x-full');
    });
  }

  // Submit Prompt
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!localStorage.getItem('medadvisor_token')) {
        window.location.href = 'auth.html?mode=signup';
        return;
      }
      const message = chatInput.value.trim();
      if (!message) return;

      // Render User Message
      appendMessage('user', message);
      chatInput.value = '';

      // Show Typing Indicator
      const typingId = appendTypingIndicator();

      try {
        const location = await getLocation();
        const city = location ? '' : (window.prompt('We could not access your location. Which city should we use?') || '');
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, location, city })
        });
        const data = await res.json();
        removeTypingIndicator(typingId);

        if (data.success) {
          appendMessage('ai', data.reply, data);
        } else {
          appendMessage('ai', 'Sorry, I am unable to connect to Gemini AI right now. Please try again.');
        }
      } catch (err) {
        removeTypingIndicator(typingId);
        appendMessage('ai', 'Network error while reaching MedAdvisor AI.');
      }
    });
  }

  async function getLocation() {
    if (!navigator.geolocation) return null;
    return new Promise(resolve => navigator.geolocation.getCurrentPosition(
      position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { timeout: 2500 }
    ));
  }

  function appendMessage(role, text, recommendation = null) {
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = role === 'user' 
      ? 'flex justify-end' 
      : 'flex justify-start';

    // Format basic bold markdown (**text**)
    const formattedText = escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const comparisons = recommendation?.comparisons?.length ? `
      <div class="mt-3 space-y-2 border-t border-slate-700 pt-3">
        <div class="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Patient comparison: ${recommendation.triage.specialty}</div>
        ${recommendation.comparisons.map((hospital, index) => `
          <div class="rounded-xl bg-slate-950/60 border border-slate-700/70 p-2.5">
            <div class="flex items-start justify-between gap-2"><strong class="text-white">${index + 1}. ${hospital.name}</strong><span class="text-amber-300">${hospital.rating}/5</span></div>
            <div class="mt-1 text-[10px] text-slate-400">${hospital.reviewsCount.toLocaleString()} reviews · ${hospital.waitMinutes} min wait · $${hospital.consultationCost} consult · ${hospital.distanceKm} km</div>
            <div class="mt-1 text-[10px] text-emerald-300">${hospital.successRate}% reported outcome rate</div>
          </div>
        `).join('')}
      </div>` : '';

    msgDiv.innerHTML = `
      <div class="max-w-[85%] rounded-2xl p-3.5 text-xs ${
        role === 'user' 
          ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-sky-500/20' 
          : 'glass-panel text-slate-200 border border-slate-800 rounded-tl-none leading-relaxed'
      }">
        ${role === 'ai' ? `
          <div class="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
            <i data-lucide="bot" class="w-3.5 h-3.5"></i> MedAdvisor Gemini AI
          </div>
        ` : ''}
        <div>${formattedText}</div>${comparisons}
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex justify-start';
    div.innerHTML = `
      <div class="glass-panel text-slate-400 text-xs p-3 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-2">
        <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-sky-400"></i> MedAdvisor is analyzing symptoms...
      </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
});
