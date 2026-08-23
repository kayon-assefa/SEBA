import { useCallback, useEffect, useState } from "react";

import { settingsService } from "../services/settings.service";

type UseSettingsResult = {
  settings: Record<string, unknown> | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (
    changes: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;
};

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] =
    useState<Record<string, unknown> | null>(null);

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

      const context =
        await Promise.all([
          settingsService.getCurrentUser(),
          settingsService.getCurrentBusiness(),
        ]);

      setSettings({ user: context[0], business: context[1] });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load settings";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (changes: Record<string, unknown>) => {
      try {
        setSaving(true);
        setError(null);

        const updated = { ...settings, ...changes };

        setSettings(updated);

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update settings";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [settings]
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
