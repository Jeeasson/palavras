// ── SERVICE WORKER — ¡Aprende Palabras! ──────────────────────────────────────
// Versión del caché — incrementar para forzar actualización
const CACHE_VERSION = 'v2.1.0';
const CACHE_STATIC  = `aprende-static-${CACHE_VERSION}`;
const CACHE_IMAGES  = `aprende-images-${CACHE_VERSION}`;
const CACHE_FONTS   = `aprende-fonts-${CACHE_VERSION}`;

// Assets estáticos que siempre deben estar en caché
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Dominios de fuentes (Google Fonts)
const FONT_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Dominio de imágenes Wikipedia
const WIKI_ORIGIN = 'upload.wikimedia.org';

// ── INSTALL: pre-cachear assets estáticos ────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Pre-cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente sin esperar
  );
});

// ── ACTIVATE: limpiar cachés viejos ──────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión', CACHE_VERSION);
  const validCaches = [CACHE_STATIC, CACHE_IMAGES, CACHE_FONTS];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => {
            console.log('[SW] Eliminando caché obsoleto:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) // Tomar control de todos los tabs
  );
});

// ── FETCH: estrategias de caché ───────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar GET
  if (request.method !== 'GET') return;

  // ── Fuentes Google: Cache-First (raramente cambian) ─────────────────────
  if (FONT_ORIGINS.some(origin => url.hostname.includes(origin))) {
    event.respondWith(cacheFirst(request, CACHE_FONTS));
    return;
  }

  // ── Imágenes Wikipedia: Network-First con fallback a caché ──────────────
  if (url.hostname.includes(WIKI_ORIGIN)) {
    event.respondWith(networkFirstWithCache(request, CACHE_IMAGES));
    return;
  }

  // ── API Wikipedia (summaries): Network-First, sin caché ─────────────────
  if (url.hostname === 'en.wikipedia.org' && url.pathname.includes('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // ── Assets estáticos propios: Cache-First ────────────────────────────────
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }
});

// ── ESTRATEGIAS ───────────────────────────────────────────────────────────────

/**
 * Cache-First: sirve del caché; si no está, va a red y guarda en caché.
 * Ideal para: assets estáticos, fuentes.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Sin red y sin caché — devolver página offline si es navegación
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    return new Response('Sin conexión', { status: 503 });
  }
}

/**
 * Network-First con fallback a caché.
 * Ideal para: imágenes Wikipedia (quiero la versión más reciente, pero offline funciona).
 */
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('', { status: 503 });
  }
}

/**
 * Network-Only: siempre va a la red, sin caché.
 * Ideal para: API calls que siempre deben ser frescos.
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'sin conexión' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ── BACKGROUND SYNC: subir datos pendientes al reconectarse ──────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-progress') {
    console.log('[SW] Background sync: subiendo progreso pendiente...');
    event.waitUntil(syncPendingProgress());
  }
});

async function syncPendingProgress() {
  // En esta versión el progreso es local (completedCats)
  // Si en el futuro se agrega backend, aquí iría el código de subida
  console.log('[SW] Progreso sincronizado');
}

// ── PUSH NOTIFICATIONS (preparado para el futuro) ─────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || '¡Es hora de aprender palabras! 🎒',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '¡Abrir!' },
      { action: 'dismiss', title: 'Después' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || '¡Aprende Palabras!', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
  }
});
