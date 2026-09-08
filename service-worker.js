const CACHE_NAME = "bandplanner-v9";

const urlsToCache = [
    "./",
    "./index.html",
    "./app.js",
    "./firebase.js",
    "./styles.css",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});