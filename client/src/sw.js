const cacheName = 'test';
const staticAssets = [
    './',
    './index.js'
]

self.addEventListener('install', async e => {
    const cache = await caches.open(cacheName);
    await cache.andAll(staticAssets);
    return self.skipWaiting();
});