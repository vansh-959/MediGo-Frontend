/* MediGo offline-first app shell. Bump CACHE_VERSION when changing the shell. */
const CACHE_VERSION = "medigo-pwa-v22";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const LOCAL_CORE_ASSETS = [
  "./",
  "./index.html",
  "./auth.html",
  "./results.html",
  "./offline.html",
  "./manifest.json",
  "./css/style.css",
  "./js/config.js",
  "./js/auth.js",
  "./js/i18n.js",
  "./js/main.js",
  "./js/chat.js",
  "./js/report-reader.js",
  "./js/cost-estimator.js",
  "./js/schemes.js",
  "./js/sos-dispatch.js",
  "./emergency.html",
  "./js/emergency.js",
  "./compare.html",
  "./js/compare.js",
  "./icons/medigo-192.png",
  "./icons/medigo-512.png",
  "./icons/medigo-maskable-512.png"
];

// Tailwind's browser runtime and icon/map libraries currently load from CDNs.
// Cache them opportunistically because opaque CDN responses cannot use Cache.add().
const EXTERNAL_CORE_ASSETS = [
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/lucide@latest",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

const scopeUrl = new URL(self.registration.scope);
const localUrl = (relativePath) => new URL(relativePath, scopeUrl).href;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(LOCAL_CORE_ASSETS.map(localUrl));
    await Promise.allSettled(EXTERNAL_CORE_ASSETS.map(async (assetUrl) => {
      const request = new Request(assetUrl, { mode: "no-cors", cache: "reload" });
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        await cache.put(request, response);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter((name) => name.startsWith("medigo-pwa-") && !keep.has(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    if (isApiRequest(request)) {
      event.respondWith(fetch(request).catch(() => jsonOfflineResponse()));
    }
    return;
  }

  const url = new URL(request.url);
  if (isApiRequest(request)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isCoreAsset(url) || isStaticAsset(request)) {
    event.respondWith(cacheFirstAsset(request));
  }
});

function isApiRequest(request) {
  return new URL(request.url).pathname.startsWith("/api/");
}

function isCoreAsset(url) {
  return EXTERNAL_CORE_ASSETS.some((assetUrl) => new URL(assetUrl).href === url.href) || LOCAL_CORE_ASSETS.some((path) => localUrl(path) === url.href);
}

function isStaticAsset(request) {
  return ["script", "style", "image", "font"].includes(request.destination);
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok && isCacheablePage(new URL(request.url))) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const requestedUrl = new URL(request.url);
    const cachedPage = isCacheablePage(requestedUrl) ? await caches.match(request) : null;
    if (cachedPage) return cachedPage;
    const homeUrl = localUrl("./index.html");
    if (requestedUrl.pathname === new URL(homeUrl).pathname || requestedUrl.pathname === new URL(scopeUrl).pathname) {
      return (await caches.match(homeUrl)) || await caches.match(localUrl("./offline.html"));
    }
    return await caches.match(localUrl("./offline.html"));
  }
}

function isCacheablePage(url) {
  return ["./", "./index.html", "./auth.html", "./results.html", "./emergency.html", "./compare.html", "./offline.html"]
    .some((path) => new URL(localUrl(path)).pathname === url.pathname);
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline asset unavailable", { status: 503, statusText: "Offline" });
  }
}

async function networkFirstApi(request) {
  try {
    const response = await fetch(request);
    if (request.method === "GET" && isCacheableApi(request) && response.ok && response.type !== "opaque") {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached = request.method === "GET" && isCacheableApi(request) ? await caches.match(request) : null;
    return cached || jsonOfflineResponse();
  }
}

function isCacheableApi(request) {
  // Only public hospital directory responses are persisted. Never cache admin,
  // account, report, review, or other potentially sensitive API responses.
  return new URL(request.url).pathname === "/api/hospitals";
}

function jsonOfflineResponse() {
  return new Response(JSON.stringify({
    success: false,
    offline: true,
    error: "MediGo is offline. Emergency email and server services are unavailable; call 108 for ambulance assistance."
  }), {
    status: 503,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
