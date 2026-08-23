import { useCallback, useEffect, useState } from "react";

import { shopSettingsService } from "../services/shop-settings.service";

type BusinessState = {
  business_id: string;
  orders_paused?: boolean;
  appointments_paused?: boolean;
  [key: string]: unknown;
};

export function useShopSettings() {
  const [settings, setSettings] =
    useState<BusinessState | null>(null);

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
        await shopSettingsService.getBusinessState();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load shop settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      changes: Partial<BusinessState>
    ) => {
      try {
        setSaving(true);
        setError(null);

        if (changes.orders_paused !== undefined) {
          await shopSettingsService.setOrdersPaused(
            changes.orders_paused
          );
        }

        if (changes.appointments_paused !== undefined) {
          await shopSettingsService.setAppointmentsPaused(
            changes.appointments_paused
          );
        }

        const refreshed =
          await shopSettingsService.getBusinessState();

        setSettings(refreshed);

        return refreshed;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update shop settings";

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