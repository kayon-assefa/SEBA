// src/features/Notifications/hooks/useNotifications.ts

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { notificationService } from "../services/notification.service";
import type { AppNotification, NotificationFilter } from "../types/notification";

export function useNotifications(filter: NotificationFilter) {
  const [items, setItems] = useState<AppNotification[]>(
    notificationService.getCached()
  );
  const [loading, setLoading] = useState(true);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.list(filter);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime: new rows push straight into the list + play a sound if
  // the tab is open and sound is enabled (checked inside the callback
  // so a settings change takes effect without re-subscribing).
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    notificationService
      .subscribe((row) => {
        setItems((prev) => {
          if (filter === "unread" && row.read) return prev;
          if (
            filter !== "all" &&
            filter !== "unread" &&
            row.category !== filter
          ) {
            return prev;
          }
          return [row, ...prev];
        });

        toast(row.title, { icon: "🔔" });

        try {
          const soundEnabled =
            localStorage.getItem("seba_notif_sound") !== "off";
          if (soundEnabled && document.visibilityState === "visible") {
            if (!soundRef.current) {
              soundRef.current = new Audio(
                "data:audio/mp3;base64,//uQx"
              );
            }
            // Best-effort - browsers may block autoplay without a prior gesture.
            void soundRef.current.play().catch(() => {});
          }
        } catch {
          // ignore audio errors entirely - sound is a nice-to-have
        }
      })
      .then((fn) => {
        unsubscribe = fn;
      });

    return () => unsubscribe?.();
  }, [filter]);

  const markAsRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllAsRead();
  }, []);

  const remove = useCallback(async (notification: AppNotification) => {
    setItems((prev) => prev.filter((n) => n.id !== notification.id));
    await notificationService.remove(notification.id);

    toast(
      (t) => (
        <span className="flex items-center gap-3">
          Notification deleted
          <button
            className="font-semibold text-orange-600 hover:underline"
            onClick={async () => {
              toast.dismiss(t.id);
              await notificationService.restore(notification);
              setItems((prev) => [notification, ...prev]);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 }
    );
  }, []);

  return { items, loading, reload: load, markAsRead, markAllAsRead, remove };
}
