// public/sw.js

const CACHE_NAME = "seba-app-shell-v2";

const APP_SHELL = [
  "/",
  "/notifications",
  "/offline.html",
  "/manifest.json",
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  // IMPORTANT:
  // Only handle GET requests.
  // Cache API does not support POST/PUT/PATCH/DELETE requests.
  if (event.request.method !== "GET") {
    return;
  }

  // Navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then(
          (cached) => cached || caches.match("/offline.html")
        )
      )
    );

    return;
  }

  // Static files: cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }

          return response;
        })
        .catch(() => cached);
    })
  );
});

// --------------------------------------------------
// PUSH NOTIFICATIONS
// --------------------------------------------------

self.addEventListener("push", (event) => {
  let payload = {
    title: "SEBA",
    body: "You have a new notification.",
    link: "/notifications",
  };

  try {
    if (event.data) {
      payload = {
        ...payload,
        ...event.data.json(),
      };
    }
  } catch {
    // Ignore invalid/non-JSON push payloads.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      data: {
        link: payload.link || "/notifications",
      },
      tag: payload.tag,
    })
  );
});

// --------------------------------------------------
// NOTIFICATION CLICK
// --------------------------------------------------

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link =
    event.notification.data?.link || "/notifications";

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        // Find an existing SEBA window
        for (const client of clients) {
          if (
            client.url.includes(link) &&
            "focus" in client
          ) {
            return client.focus();
          }
        }

        // Otherwise navigate an existing window
        if (clients.length > 0 && "focus" in clients[0]) {
          clients[0].navigate(link);
          return clients[0].focus();
        }

        // Otherwise open a new window
        return self.clients.openWindow(link);
      })
  );
});