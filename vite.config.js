import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Development-only: recover browsers controlled by an old cache-first service
// worker (which would otherwise serve stale modules and render a blank app).
const swCleanupPlugin = () => ({
  name: "dev-sw-cleanup",
  apply: "serve",
  transformIndexHtml() {
    return [
      {
        tag: "script",
        injectTo: "head-prepend",
        children: `(function () {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    if (!regs.length) return;
    Promise.all(regs.map(function (r) { return r.unregister(); })).then(function () {
      var clear = (typeof caches !== "undefined" && caches.keys)
        ? caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { return caches.delete(k); }));
          })
        : Promise.resolve();
      clear.then(function () {
        if (!sessionStorage.getItem("gh-sw-clean")) {
          sessionStorage.setItem("gh-sw-clean", "1");
          location.reload();
        }
      });
    });
  });
})();`,
      },
    ];
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), swCleanupPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
