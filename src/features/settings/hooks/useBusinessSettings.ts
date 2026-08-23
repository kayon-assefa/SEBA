import { useCallback, useEffect, useState } from "react";

import { businessSettingsService } from "../services/business-settings.service";

import type { BusinessSettings, BusinessSettingsUpdate as UpdateBusinessSettings } from "../types/business-settings";

export function useBusinessSettings() {
  const [settings, setSettings] =
    useState<BusinessSettings | null>(null);

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
        await businessSettingsService.get();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load business settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      changes: UpdateBusinessSettings
    ) => {
      try {
        setSaving(true);
        setError(null);

        const updated =
          await businessSettingsService.save(
            changes
          );

        setSettings(updated ?? null);

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update business settings";

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
