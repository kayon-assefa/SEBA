// src/features/Notifications/components/NotificationSettingsPanel.tsx

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { notificationService } from "../services/notification.service";
import { usePushSubscription } from "../hooks/usePushSubscription";
import type {
  NotificationCategory,
  NotificationSettings,
} from "../types/notification";
import { DEFAULT_NOTIFICATION_SETTINGS } from "../types/notification";

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  order: "New orders & order updates",
  appointment: "New appointments & cancellations",
  customer: "New customers & unpaid balances",
  auth: "Logins to your account",
  system: "System messages",
};

interface NotificationSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationSettingsPanel({
  open,
  onClose,
}: NotificationSettingsPanelProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const push = usePushSubscription();

  useEffect(() => {
    if (!open) return;
    notificationService.getSettings().then(setSettings).catch(() => {});
  }, [open]);

  if (!open) return null;

  async function update(patch: Partial<NotificationSettings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      await notificationService.saveSettings(next);
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(category: NotificationCategory) {
    if (!settings) return;
    void update({
      categories_enabled: {
        ...settings.categories_enabled,
        [category]: !settings.categories_enabled[category],
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Notification settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!settings ? (
          <div className="p-5 text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto p-5">
            {/* Push */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900">
                Push notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get notified even when this tab is closed.
              </p>
              {!push.supported ? (
                <p className="mt-2 text-sm text-amber-600">
                  Not supported in this browser.
                </p>
              ) : push.permission === "granted" ? (
                <button
                  onClick={() => push.disable()}
                  disabled={push.busy}
                  className="mt-3 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Turn off push
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const ok = await push.enable();
                    if (ok) void update({ push_enabled: true });
                  }}
                  disabled={push.busy}
                  className="mt-3 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Enable push
                </button>
              )}
            </section>

            {/* Categories */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900">
                Notify me about
              </h3>
              <div className="mt-2 space-y-2">
                {(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map(
                  (category) => (
                    <label
                      key={category}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <span className="text-sm text-gray-700">
                        {CATEGORY_LABELS[category]}
                      </span>
                      <input
                        type="checkbox"
                        checked={
                          settings.categories_enabled[category] ??
                          DEFAULT_NOTIFICATION_SETTINGS.categories_enabled[
                            category
                          ]
                        }
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                  )
                )}
              </div>
            </section>

            {/* Digest */}
            <section>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                <span>
                  <span className="block text-sm text-gray-700">
                    Daily unpaid-balance digest
                  </span>
                  <span className="block text-xs text-gray-400">
                    One summary a day instead of one push per unpaid customer
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.unpaid_digest_enabled}
                  onChange={(e) =>
                    update({ unpaid_digest_enabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </label>
            </section>

            {/* Quiet hours */}
            <section>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  Quiet hours
                </span>
                <input
                  type="checkbox"
                  checked={settings.quiet_hours_enabled}
                  onChange={(e) =>
                    update({ quiet_hours_enabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </label>
              {settings.quiet_hours_enabled && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) =>
                      update({ quiet_hours_start: e.target.value })
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  />
                  <span className="text-sm text-gray-400">to</span>
                  <input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) =>
                      update({ quiet_hours_end: e.target.value })
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  />
                </div>
              )}
            </section>

            {/* Sound */}
            <section>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  Sound while tab is open
                </span>
                <input
                  type="checkbox"
                  checked={settings.sound_enabled}
                  onChange={(e) => {
                    update({ sound_enabled: e.target.checked });
                    try {
                      localStorage.setItem(
                        "seba_notif_sound",
                        e.target.checked ? "on" : "off"
                      );
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </label>
            </section>

            {saving && (
              <p className="text-xs text-gray-400">Saving...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
