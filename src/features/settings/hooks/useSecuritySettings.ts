import { useCallback, useEffect, useState } from "react";

import { securitySettingsService } from "../services/security-settings.service";

export function useSecuritySettings() {
  const [user, setUser] =
    useState<Awaited<
      ReturnType<
        typeof securitySettingsService.getUser
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
        await securitySettingsService.getUser();

      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load security information"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutAll = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      await securitySettingsService.logoutEverywhere();

      await refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to sign out sessions";

      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    user,
    loading,
    saving,
    error,
    refresh,
    signOutAll,
  };
}
