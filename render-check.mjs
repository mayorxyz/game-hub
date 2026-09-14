import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";

// --- Minimal global stubs so SSR can render the router/app ---
globalThis.window = globalThis;
const listenerMap = new Map();
globalThis.addEventListener = (t, f) => listenerMap.set(t, f);
globalThis.removeEventListener = (t, f) => listenerMap.delete(t);
globalThis.dispatchEvent = (e) => {
  if (listenerMap.has(e.type)) listenerMap.get(e.type)(e);
  return true;
};
globalThis.Event = class Event {
  constructor(t) { this.type = t; }
};
globalThis.CustomEvent = class CustomEvent {
  constructor(t) { this.type = t; this.detail = undefined; }
};
globalThis.document = {
  defaultView: globalThis,
  documentElement: { setAttribute() {}, getAttribute: () => null, classList: { toggle() {} } },
  baseURI: "http://localhost:3000/",
  querySelector: () => null,
  getElementById: () => "root-stub",
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ style: {}, setAttribute() {}, addEventListener() {}, removeEventListener() {} }),
};
Object.defineProperty(globalThis, "navigator", {
  value: { serviceWorker: { register: async () => {} }, userAgent: "node" },
  configurable: true,
});
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.location = { pathname: "/", search: "", hash: "" };
Object.defineProperty(globalThis, "history", {
  value: {
    state: null,
    length: 1,
    pushState: () => {},
    replaceState: () => {},
    back: () => {},
    forward: () => {},
    go: () => {},
  },
  configurable: true,
});

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const React = (await import("react")).default;
  const { MemoryRouter } = await import("react-router-dom");
  const wrap = (comp) =>
    React.createElement(MemoryRouter, { initialEntries: ["/"] }, comp);
  const checks = [
    ["/src/features/home/Home.tsx", "Home"],
    ["/src/components/app/AppShell.tsx", "AppShell"],
  ];
  for (const [path, name] of checks) {
    const mod = await server.ssrLoadModule(path);
    const Comp = mod.default;
    try {
      const html = renderToStaticMarkup(wrap(React.createElement(Comp)));
      console.log(`[OK]   ${name}: rendered ${html.length} chars`);
    } catch (e) {
      console.log(`[FAIL] ${name}: ${String(e)}`);
      console.log("  stack: " + (e && e.stack ? String(e.stack).split("\n").slice(0, 12).join(" | ") : "(none)"));
    }
  }
} catch (e) {
  console.log("LOAD/IMPORT ERROR:", String(e));
}
await server.close();