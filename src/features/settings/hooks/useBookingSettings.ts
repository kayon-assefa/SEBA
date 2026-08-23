import { useCallback, useEffect, useState } from "react";

import { bookingSettingsService } from "../services/booking-settings.service";

import type {
  BookingSettings,
} from "../types/booking-settings";

export function useBookingSettings() {
  const [settings, setSettings] =
    useState<BookingSettings | null>(null);

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
        await bookingSettingsService.get();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load booking settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      changes: Partial<BookingSettings>
    ) => {
      try {
        setSaving(true);
        setError(null);

        const updated =
          await bookingSettingsService.save(
            changes
          );

        setSettings(updated);

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update booking settings";

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