// Service Worker per PWA + Push Notifications
const CACHE_NAME = 'task-level-v3'; // Incremento versione per forzare aggiornamento
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Ignora le richieste alle API esterne (come Supabase) per evitare problemi CORS/Network
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Ritorna la risorsa dalla cache se presente
        if (response) {
          return response;
        }

        // Altrimenti prova a scaricarla dal network
        return fetch(event.request).then((networkResponse) => {
          return networkResponse;
        }).catch((error) => {
          console.error('Fetch failed for:', event.request.url, error);
          
          // Se fallisce il caricamento di una pagina HTML, mostra il fallback offline (index.html)
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/');
          }
          
          // Importante: per evitare "Failed to convert value to 'Response'", 
          // dobbiamo ritornare una Response valida anche in caso di errore.
          return new Response('Network error occurred', {
            status: 404,
            statusText: 'Network error',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 🔔 PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('📨 Push notification ricevuta:', event);

  let notificationData = {
    title: 'Task.level',
    body: 'Hai una nuova notifica!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'task-level',
    data: {},
    actions: [
      {
        action: 'open',
        title: 'Apri',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Chiudi'
      }
    ]
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData && typeof pushData === 'object') {
        // Unisci i dati e assicurati che 'url' finisca in 'data' per il click handler
        notificationData = { 
          ...notificationData, 
          ...pushData,
          data: {
            ...notificationData.data,
            ...pushData.data,
            url: pushData.url || (pushData.data && pushData.data.url) || '/'
          }
        };
      }
    } catch (error) {
      console.warn('⚠️ Push data non è JSON, provo come testo:', error);
      try {
        const textData = event.data.text();
        if (textData) notificationData.body = textData;
      } catch (e) {
        console.error('❌ Errore parsing push data as text:', e);
      }
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  // Handle different actions
  if (action === 'dismiss') {
    return; // Just close the notification
  }

  // Default action or 'open' action
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if no existing one
      if (clients.openWindow) {
        const targetUrl = notificationData.url || '/';
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Notification closed:', event);
  
  // Optional: track notification close analytics
  if (event.notification.data && event.notification.data.trackClose) {
    // Send analytics data
  }
});

// Background sync (per future offline support)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Placeholder for future notification logic
  console.log('Background sync triggered');
}