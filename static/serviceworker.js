let cachedItems = ['/', '/index.html', '/index.css', '/index.js'];
let staticCacheName = 'Checklist';

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll(cachedItems);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.waitUntil(
        //TODO: THIS IS DEBUG CODE
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll(cachedItems);
        })
    );

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
