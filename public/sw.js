// Service Worker per PWA + Push Notifications
const CACHE_NAME = 'task-level-v2'; // Incremento versione per forzare aggiornamento
const urlsToCache = [
  '/',
  '/static/css/',
  '/static/js/',
  '/manifest.json'
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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(() => {
            // If both cache and network fail, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
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
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Errore parsing push data:', error);
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