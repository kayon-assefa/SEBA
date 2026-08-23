// src/features/Notifications/components/NotificationItem.tsx

import { useNavigate } from "react-router-dom";
import {
  Calendar,
  LogIn,
  ShoppingBag,
  Trash2,
  Users,
  Info,
} from "lucide-react";

import type { AppNotification } from "../types/notification";

const CATEGORY_ICON: Record<AppNotification["category"], typeof ShoppingBag> = {
  order: ShoppingBag,
  appointment: Calendar,
  customer: Users,
  auth: LogIn,
  system: Info,
};

const SEVERITY_DOT: Record<AppNotification["severity"], string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-green-500",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDelete: (notification: AppNotification) => void;
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = CATEGORY_ICON[notification.category];

  function handleClick() {
    if (!notification.read) onRead(notification.id);
    if (notification.link) navigate(notification.link);
  }

  return (
    <div
      onClick={handleClick}
      className={`group flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
        notification.read
          ? "border-gray-100 bg-white"
          : "border-orange-100 bg-orange-50/40"
      } hover:border-gray-200 hover:bg-gray-50`}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-900">
            {notification.title}
          </p>
          {!notification.read && (
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[notification.severity]}`}
            />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">
          {notification.body}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification);
        }}
        className="shrink-0 rounded-md p-1.5 text-gray-300 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
        aria-label="Delete notification"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
