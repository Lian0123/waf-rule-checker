const CACHE_NAME = "waf-rule-checker-v4";
const APP_SHELL = ["/", "/index.html", "/webmcp-demo.html", "/manifest.webmanifest", "/robots.txt", "/sitemap.xml", "/icon.svg"];
const CDN_ASSETS = [
  "https://unpkg.com/react@18/umd/react.development.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "https://d3js.org/d3.v7.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);
      await Promise.all(
        CDN_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { mode: "no-cors" });
            await cache.put(url, response);
          } catch {
            // CDN 快取失敗不阻斷安裝；仍允許線上模式運行。
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match("/index.html");
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
    })
  );
});
