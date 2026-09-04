self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(data.title ?? "SEBA", {
      body: data.body ?? "",
      icon: "/icon.png",
      tag: data.tag,
      data: { link: data.link ?? "/staff/notifications" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.link ?? "/staff/notifications"));
});
