import { useCallback, useEffect, useState } from "react";

import { staffSettingsService } from "../services/staff-settings.service";

import type {
  StaffMember,
  UpdateStaffInput,
} from "../types/staff-settings";

export function useStaffSettings() {
  const [settings, setSettings] =
    useState<StaffMember[]>([]);

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
        await staffSettingsService.list();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load staff settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      id: string,
      changes: UpdateStaffInput
    ) => {
      try {
        setSaving(true);
        setError(null);

        await staffSettingsService.update(
          id,
          changes
        );

        await refresh();

        const updated = settings.find(s => s.id === id);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update staff settings";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [settings, refresh]
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