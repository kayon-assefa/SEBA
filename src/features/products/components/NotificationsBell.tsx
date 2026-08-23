import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import type { AppNotification } from "../types/catalog";
import { notificationService } from "../services/notification.service";

// Feature #57 - in-app low stock notifications, live via Supabase realtime
export default function NotificationsBell({ businessId }: { businessId: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    notificationService.list().then(setNotifications);
    const unsubscribe = notificationService.subscribe(businessId, (n) =>
      setNotifications((current) => [n, ...current])
    );
    return unsubscribe;
  }, [businessId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F25F5C] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-4 text-sm font-semibold text-[#2B2B2B]">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    notificationService.markRead(n.id);
                    setNotifications((current) =>
                      current.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
                    );
                  }}
                  className={`block w-full border-b border-gray-50 p-4 text-left text-sm hover:bg-gray-50 ${
                    n.is_read ? "opacity-60" : ""
                  }`}
                >
                  <p className="font-medium text-[#2B2B2B]">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-gray-500">{n.body}</p>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
