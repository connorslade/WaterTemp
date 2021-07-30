let cachedItems = ['/', '/index.html', '/index.css', '/index.js'];
let staticCacheName = 'Checklist';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(staticCacheName).then(cache => {
            return cache.addAll(cachedItems);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
