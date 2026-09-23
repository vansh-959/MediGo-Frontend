// MedAdvisor Gemini AI Chatbot Drawer JS Interaction (TECHNOVA 2026)
// Multi-turn context, Voice Recognition, Dual Theme (Light/Dark) & Hospital Cards

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.location.port === '5501' ? 'http://localhost:3000' : '';
  const chatDrawer = document.getElementById('chat-drawer');
  const openChatBtn = document.getElementById('floating-chat-trigger');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatMicBtn = document.getElementById('chat-mic-btn');

  // Maintain in-memory conversation history
  const chatHistory = [];

  if (!chatDrawer) return;

  // Toggle Drawer Open / Close
  if (openChatBtn) {
    openChatBtn.addEventListener('click', () => {
      chatDrawer.classList.remove('translate-x-full');
      if (chatInput) setTimeout(() => chatInput.focus(), 300);
    });
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
      chatDrawer.classList.add('translate-x-full');
    });
  }

  // Quick Prompt Pills
  document.querySelectorAll('.chat-prompt-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const text = pill.textContent.trim();
      if (chatInput) {
        chatInput.value = text;
        submitChatMessage(text);
      }
    });
  });

  // Voice Speech-To-Text Recognition in Chat
  if (chatMicBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      const currentLang = localStorage.getItem('medadvisor_lang') || 'en';
      recognition.lang = currentLang === 'hi' ? 'hi-IN' : (currentLang === 'pa' ? 'pa-IN' : 'en-IN');
      recognition.interimResults = false;

      chatMicBtn.addEventListener('click', () => {
        chatMicBtn.classList.add('bg-rose-500', 'text-white', 'animate-pulse');
        recognition.start();
      });

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (chatInput) {
          chatInput.value = transcript;
          submitChatMessage(transcript);
        }
      };

      recognition.onend = () => {
        chatMicBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
      };
    } else {
      chatMicBtn.style.display = 'none';
    }
  }

  // Chat Form Submit
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput?.value.trim();
      if (message) {
        submitChatMessage(message);
      }
    });
  }

  async function submitChatMessage(message) {
    if (!message) return;

    // Render User Message
    appendMessage('user', message);
    if (chatInput) chatInput.value = '';

    // Add to history
    chatHistory.push({ role: 'user', content: message });

    // Show Typing Indicator
    const typingId = appendTypingIndicator();

    try {
      const city = appState?.detectedLocationName || '';
      const location = appState?.userCoords || null;

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          city,
          location,
          history: chatHistory.slice(-6)
        })
      });

      const data = await res.json();
      removeTypingIndicator(typingId);

      if (data.success && data.reply) {
        chatHistory.push({ role: 'model', content: data.reply });
        appendMessage('ai', data.reply, data);
      } else {
        appendMessage('ai', 'I couldn’t get a response just now. Please try again in a moment.');
      }
    } catch (err) {
      removeTypingIndicator(typingId);
      appendMessage('ai', 'I can’t reach the assistant right now. Please try again in a moment.');
    }
  }

  function appendMessage(role, text, data = null) {
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = role === 'user' ? 'flex justify-end' : 'flex justify-start';

    // Format basic bolding and line breaks
    let formattedText = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n•/g, '<br/>•')
      .replace(/\n/g, '<br/>');

    // Recommendation hospital cards snippet
    let recommendationsHtml = '';
    if (data && data.recommendations && data.recommendations.length > 0) {
      recommendationsHtml = `
        <div class="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div class="text-[10px] uppercase font-extrabold tracking-wider text-sky-600 dark:text-sky-400 flex items-center justify-between">
            <span>Matching Verified Hospitals (${escapeHtml(data.triage?.specialty || 'General')})</span>
            <span class="text-slate-400">Live Registry</span>
          </div>
          ${data.recommendations.map(h => `
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-between gap-2 shadow-sm">
              <div class="min-w-0 flex-1">
                <strong class="text-slate-900 dark:text-white text-xs block truncate">${escapeHtml(h.name)}</strong>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 block">${escapeHtml(h.city)}${Number.isFinite(h.distanceKm) ? ` • ${h.distanceKm} km away` : ''} • <span class="text-emerald-600 dark:text-emerald-400 font-bold">🛏️ ${h.icuAvailable ?? 8} ICU Beds</span> • <span class="text-amber-500">★ ${h.rating}</span></span>
              </div>
              <div class="shrink-0 flex gap-1">
                <a href="${escapeHtml(h.mapUrl)}" target="_blank" rel="noopener" class="px-2 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] rounded-lg shadow-sm">Directions</a>
                <a href="tel:${escapeHtml(h.phone)}" class="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] rounded-lg shadow-sm">Call</a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    msgDiv.innerHTML = `
      <div class="max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs ${
        role === 'user'
          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold rounded-tr-none shadow-md shadow-sky-500/20'
          : 'theme-card text-slate-800 dark:text-slate-200 border rounded-tl-none leading-relaxed shadow-md'
      }">
        ${role === 'ai' ? `
          <div class="flex items-center justify-between gap-1 text-sky-600 dark:text-sky-400 font-bold mb-1.5 border-b border-slate-200 dark:border-slate-800/80 pb-1">
            <span class="flex items-center gap-1.5"><i data-lucide="bot" class="w-3.5 h-3.5"></i> MediGo AI</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-300 font-mono">${escapeHtml(data?.source || 'Gemini 3.8')}</span>
          </div>
        ` : ''}
        <div class="leading-relaxed">${formattedText}</div>
        ${recommendationsHtml}
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
  }

  function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex justify-start';
    div.innerHTML = `
      <div class="theme-card text-slate-500 dark:text-slate-400 text-xs p-3 rounded-2xl rounded-tl-none border flex items-center gap-2">
        <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-sky-500"></i> MediGo AI is thinking...
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

  function escapeHtml(val) {
    return String(val ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
});
