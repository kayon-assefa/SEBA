import { useState } from "react";

import { dangerZoneService } from "../services/danger-zone.service";

export function useDangerZone() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function pauseBusiness() {
    try {
      setLoading(true);
      setError(null);

      await dangerZoneService.pauseBusiness();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to pause business";

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function unpublishPage() {
    try {
      setLoading(true);
      setError(null);

      await dangerZoneService.unpublishBusiness();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to unpublish page";

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness(
    confirmation: string
  ) {
    if (confirmation !== "DELETE BUSINESS") {
      throw new Error(
        "Please type DELETE BUSINESS exactly"
      );
    }

    try {
      setLoading(true);
      setError(null);

      await dangerZoneService.deleteBusiness();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete business";

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    pauseBusiness,
    unpublishPage,
    deleteBusiness,
  };
}
