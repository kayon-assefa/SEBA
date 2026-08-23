import { useCallback, useEffect, useState } from "react";

import { notificationSettingsService } from "../services/notification-settings.service";

import type {
  NotificationSettings,
} from "../types/notification-settings";

export function useNotificationSettings() {
  const [settings, setSettings] =
    useState<NotificationSettings | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await notificationSettingsService.get();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notification settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      changes: Partial<NotificationSettings>
    ) => {
      try {
        setSaving(true);
        setError(null);

        const updated =
          await notificationSettingsService.save(
            changes
          );

        setSettings(updated);

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update notification settings";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    settings,
    loading,
    saving,
    error,
    refresh,
    update,
  };
}
