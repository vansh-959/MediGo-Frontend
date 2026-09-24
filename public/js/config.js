const isLocalMediGo =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.port === "5500" ||
  window.location.port === "5501";

window.MEDIGO_API_BASE = isLocalMediGo
  ? "http://localhost:3000"
  : "https://medigo-backend-doxa.onrender.com";
