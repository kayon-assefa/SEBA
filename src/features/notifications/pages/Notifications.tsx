// src/features/Notifications/pages/Notifications.tsx

import { useMemo, useState } from "react";
import { Settings } from "lucide-react";

import NotificationFilters from "../components/NotificationFilters";
import NotificationItem from "../components/NotificationItem";
import NotificationSkeleton from "../components/NotificationSkeleton";
import EmptyState from "../components/EmptyState";
import OfflineBanner from "../components/OfflineBanner";
import NotificationSettingsPanel from "../components/NotificationSettingsPanel";

import { useNotifications } from "../hooks/useNotifications";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

import type { NotificationFilter } from "../types/notification";

function groupByDay<T extends { created_at: string }>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const item of items) {
    const day = new Date(item.created_at).toDateString();
    const label =
      day === today ? "Today" : day === yesterday ? "Yesterday" : "Earlier";
    groups[label] = groups[label] || [];
    groups[label].push(item);
  }
  return groups;
}

export default function Notifications() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const online = useOnlineStatus();
  const { items, loading, markAsRead, markAllAsRead, remove } =
    useNotifications(filter);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }, [items, search]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="seba-dashboard mx-auto w-full max-w-5xl">
      <div className="seba-glass seba-rise p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Notifications
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Orders, appointments, customers, and account activity, all in
                one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-white hover:text-gray-900"
                aria-label="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!online && (
            <div className="mb-4">
              <OfflineBanner />
            </div>
          )}

          <NotificationFilters
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
          />

          <div className="mt-4">
            {loading ? (
              <NotificationSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState
                message={
                  search
                    ? "No notifications match your search"
                    : filter === "unread"
                      ? "No unread notifications"
                      : "You're all caught up"
                }
              />
            ) : (
              Object.entries(grouped).map(([label, group]) => (
                <div key={label} className="mb-6">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                  </h2>
                  <div className="space-y-2">
                    {group.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onRead={markAsRead}
                        onDelete={remove}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
      </div>

      <NotificationSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
