import { useCallback, useEffect, useState } from "react";

import { subscriptionSettingsService } from "../services/subscription-settings.service";

export function useSubscriptionSettings() {
  const [subscription, setSubscription] =
    useState<Awaited<
      ReturnType<
        typeof subscriptionSettingsService.getContext
      >
    > | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await subscriptionSettingsService.getContext();

      setSubscription(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load subscription"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    subscription,
    loading,
    error,
    refresh,
  };
}
