import type { PublicBusiness } from "../types/publicBusiness";

/**
 * Converts existing SEBA business data into the public-page contract.
 *
 * Keep database-specific mapping here instead of inside templates.
 *
 * The exact database fields should be connected once the existing
 * SEBA schema is mapped.
 */
export function normalizePublicBusiness(
  business: PublicBusiness
): PublicBusiness {
  return {
    ...business,
    username: business.username.trim().toLowerCase(),
  };
}
