/* ════════════════════════════════════════
   Service Worker for 観測する、ヒマジン。ポートフォリオ
   目的：ホーム画面への追加（PWAインストール）を有効化する。
   方針：常に最新のHTMLを優先し（network-first）、
         オフライン時のみキャッシュにフォールバックする。
════════════════════════════════════════ */

const CACHE_NAME = 'himajin-portfolio-v1';
const APP_SHELL = [
  './portfolio.html',
  './manifest-portfolio.json',
  './icon-portfolio-192.png',
  './icon-portfolio-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        /* 一部アイコンが見つからなくてもインストール自体は続行する */
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match('./portfolio.html'))
      )
  );
});
