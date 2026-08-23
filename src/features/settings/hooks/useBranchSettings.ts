import { useCallback, useEffect, useState } from "react";

import { branchSettingsService } from "../services/branch-settings.service";

import type { Branch } from "../types/branch-settings";

export function useBranchSettings() {
  const [settings, setSettings] =
    useState<Branch[]>([]);

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
        await branchSettingsService.list();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load branch settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (
      id: string,
      changes: Partial<Branch>
    ) => {
      try {
        setSaving(true);
        setError(null);

        const updated =
          await branchSettingsService.update(id, changes);

        setSettings((current) =>
          current.map((branch) => branch.id === id ? updated : branch),
        );

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update branch settings";

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
