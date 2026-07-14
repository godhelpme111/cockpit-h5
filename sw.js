/* 景区智能观光车乘客端 — Service Worker
 * 缓存策略：
 *   - 静态资源（HTML/CSS/JS/字体/图标）：CacheFirst，命中后立刻返回，未命中走网络并回填
 *   - 导航请求（HTML）：NetworkFirst，3s 超时回落到缓存
 *   - 其他请求：网络透传
 *
 * 路径说明：所有路径都使用相对 URL './...'，
 *   这样在 Capacitor（file://）、GitHub Pages（/cockpit-h5/）等任意子路径下都能正确解析。
 */

const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// 预缓存：构建时由 vite-plugin-pwa 或我们手动写入
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 导航请求：网络优先
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源：缓存优先
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'manifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 其他：网络透传 + 失败回落
  event.respondWith(
    fetch(request).catch(async () => (await caches.match(request)) || Response.error())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch (e) {
    return cached || Response.error();
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // 兜底：相对路径解析到 SW 自身所在目录，确保子路径部署时也能找到 index.html
    const fallback = await caches.match('./index.html');
    return fallback || Response.error();
  }
}
