// ==========================================================
// RETO ACTIVO PWA — Background Push Notification Worker
// ==========================================================

self.addEventListener('push', (event) => {
  let data = {
    title: 'Reto Activo',
    body: '¡Hola! Recuerda sincronizar tus pasos de hoy para mantener tu racha. 🏃‍♂️🔥',
    url: '/'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Reto Activo',
        body: event.data.text(),
        url: '/'
      };
    }
  }

  const options = {
    body: data.body,
    // Using version query v=3 for cache-busting as defined in App Icon upgrade
    icon: data.icon || '/icons/icon-192.png?v=3',
    badge: data.badge || '/icons/icon-192.png?v=3',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with the same URL or focusable
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If we have any active client window, focus it and redirect
      if (windowClients.length > 0) {
        const firstClient = windowClients[0];
        if ('focus' in firstClient) {
          if ('navigate' in firstClient) {
            firstClient.navigate(urlToOpen);
          }
          return firstClient.focus();
        }
      }

      // If no window is open, open a new tab/window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
