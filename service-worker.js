importScripts(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey:
        "AIzaSyAvlN5TvJWyqZMQ6IpcgCNUCx0A0KsR6j4",
    authDomain:
        "bandplanner-35c5f.firebaseapp.com",
    projectId:
        "bandplanner-35c5f",
    storageBucket:
        "bandplanner-35c5f.firebasestorage.app",
    messagingSenderId:
        "905591319348",
    appId:
        "1:905591319348:web:58efc3599b068c4ae11361"
});

const messaging =
    firebase.messaging();

messaging.onBackgroundMessage(
    payload => {
        const notification =
            payload.notification || {};

        self.registration.showNotification(
            notification.title ||
                "BandPlanner",
            {
                body:
                    notification.body ||
                    "V aplikaci je nová událost.",
                icon:
                    "./image/icon-192.png"
            }
        );
    }
);

const CACHE_NAME = "bandplanner-v41";

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
            .then(cache =>
                cache.addAll(urlsToCache)
            )
            .then(() =>
                self.skipWaiting()
            )
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames =>
                Promise.all(
                    cacheNames
                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(name)
                        )
                )
            )
            .then(() =>
                self.clients.claim()
            )
    );
});

self.addEventListener("fetch", event => {
    if (
        event.request.method !== "GET"
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseCopy =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(
                            event.request,
                            responseCopy
                        );
                    });

                return response;
            })
            .catch(() =>
                caches.match(event.request)
            )
    );
});