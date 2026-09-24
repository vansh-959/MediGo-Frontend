window.MEDIGO_API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "https://medigo-backend-doxa.onrender.com"
    : "https://medigo-backend-doxa.onrender.com";
