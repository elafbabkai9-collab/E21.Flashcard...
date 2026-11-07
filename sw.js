// E21Flashcard — service worker: تەنها فایلەکانی ئەپەکە بۆ کارکردنی بێ ئینتەرنێت دەپارێزێت.
// داتای بەکارهێنەر (localStorage) هیچ پەیوەندییەکی بەم فایلەوە نییە و هەرگیز دەست لێنادرێت.
const CACHE = 'e21-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// network-first: کاتێک ئینتەرنێت هەیە وەشانی نوێ وەردەگرێت، کاتێک نییە لە cache دەخوێنرێتەوە
self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    if (new URL(req.url).origin !== self.location.origin) return; // CDN و سایتی تر: وێبگەڕ خۆی بەڕێوەی دەبات
    e.respondWith(
        fetch(req).then(res => {
            if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
            return res;
        }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
});
