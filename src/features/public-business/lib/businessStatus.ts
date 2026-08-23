// File:
// src/features/public-business/lib/businessStatus.ts

import type {
  PublicBusiness,
  PublicBusinessStatus,
} from "../types/publicBusiness";

export function getBusinessStatus(
  business: PublicBusiness
): PublicBusinessStatus {
  // Business is not published.
  if (!business.published) {
    return "unpublished";
  }

  // Owner has temporarily closed the business.
  if (business.temporarilyClosed) {
    return "temporarily_closed";
  }

  // For now, we do NOT check:
  // - working hours
  // - opening time
  // - closing time
  // - timezone
  // - current date
  // - current time
  //
  // If the business is published and not
  // temporarily closed, consider it open.
  return "open";
}