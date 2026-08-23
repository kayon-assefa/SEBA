import { useCallback, useEffect, useState } from "react";

import { integrationSettingsService } from "../services/integration-settings.service";

export function useIntegrationSettings() {
  const [integrations, setIntegrations] =
    useState<Awaited<
      ReturnType<
        typeof integrationSettingsService.list
      >
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
        await integrationSettingsService.list();

      setIntegrations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load integrations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(
    async (integrationId: string) => {
      try {
        setSaving(true);
        setError(null);

        await integrationSettingsService.disconnect(
          integrationId
        );

        await refresh();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to disconnect integration";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    integrations,
    loading,
    saving,
    error,
    refresh,
    disconnect,
  };
}
