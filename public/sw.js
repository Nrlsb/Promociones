self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/logoMercurio.png',
        badge: data.badge || '/logoMercurio.png',
        image: data.image || null,
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        }
      };
      event.waitUntil(
        self.registration.showNotification(data.title || 'Nueva promoción de Pinturerías Mercurio', options)
      );
    } catch (e) {
      console.error('Error parseando JSON de push event:', e);
      event.waitUntil(
        self.registration.showNotification('Nueva promoción de Pinturerías Mercurio', {
          body: event.data.text() || 'Ingresá para ver la nueva promoción.',
          icon: '/logoMercurio.png',
          data: {
            url: '/'
          }
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Obtener la URL del target, asegurando que sea absoluta si es necesario
  let targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Intentar enfocar una pestaña existente con la misma URL
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        // Comparamos el path relativo o absoluto para enfocar
        const clientUrl = new URL(client.url);
        const targetUrlObj = new URL(targetUrl, self.location.origin);
        
        if (clientUrl.pathname === targetUrlObj.pathname && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
