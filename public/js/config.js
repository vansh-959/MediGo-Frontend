<<<<<<< HEAD
const isLocalMediGo =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.port === "5500" ||
  window.location.port === "5501";

window.MEDIGO_API_BASE = isLocalMediGo
=======
const medigoNativeApp =
  typeof window.Capacitor?.isNativePlatform === "function" &&
  window.Capacitor.isNativePlatform();

const medigoLocalBrowser =
  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  !medigoNativeApp;

window.MEDIGO_API_BASE = medigoLocalBrowser
  ? "http://localhost:3000"
  : "https://medigo-backend-doxa.onrender.com";