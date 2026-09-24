const medigoNativeApp =
  typeof window.Capacitor?.isNativePlatform === "function" &&
  window.Capacitor.isNativePlatform();

const medigoLocalBrowser =
  ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
  ["5500", "5501"].includes(window.location.port);

window.MEDIGO_API_BASE = medigoLocalBrowser && !medigoNativeApp
  ? "http://localhost:3000"
  : "https://medigo-backend-doxa.onrender.com";
