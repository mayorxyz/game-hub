import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker for PWA / offline support.
// Never register in development: a cache-first service worker will serve stale
// Vite modules and leave the app blank after edits/dependency changes.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is optional */
    });
  });
}

// In development, tear down any previously-installed worker and its caches so a
// stale cache can't keep serving outdated modules.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if (typeof caches !== "undefined") {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}
