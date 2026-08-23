import { useCallback, useEffect, useState } from "react";

import { pageSettingsService } from "../services/page-settings.service";

export function usePageSettings() {
  const [settings, setSettings] =
    useState<Awaited<
      ReturnType<typeof pageSettingsService.getTheme>
    > | null>(null);

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
        await pageSettingsService.getTheme();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load page settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      changes: Record<string, unknown>
    ) => {
      try {
        setSaving(true);
        setError(null);

        const updated =
          await pageSettingsService.saveTheme(
            changes
          );

        setSettings(updated);

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update page settings";

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
