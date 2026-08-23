// src/features/Notifications/components/NotificationBell.tsx
//
// A compact bell + badge you can drop into your existing topbar, if you
// have one, instead of (or alongside) the sidebar nav item.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

import { notificationService } from "../services/notification.service";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    notificationService.unreadCount().then(setCount).catch(() => {});

    notificationService
      .subscribe(() => {
        setCount((c) => c + 1);
      })
      .then((fn) => {
        unsubscribe = fn;
      });

    return () => unsubscribe?.();
  }, []);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
