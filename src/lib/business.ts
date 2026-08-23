import { supabase } from "./supabase";

/**
 * Returns the business that the signed-in owner is actively managing.
 *
 * A UUID's alphabetical order has no relationship to when a business was
 * created.  Selecting a business by `id` therefore makes accounts with old
 * test/draft businesses appear to have no orders, appointments, or products.
 * A completed onboarding record is the reliable link to the live business.
 */
export async function getActiveBusinessIdForUser(userId: string): Promise<string> {
  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId);

  if (businessError) throw businessError;

  const businessIds = businesses?.map((business) => business.id) ?? [];
  if (!businessIds.length) throw new Error("Business not found");

  const { data: completedProgress, error: progressError } = await supabase
    .from("onboarding_progress")
    .select("business_id")
    .in("business_id", businessIds)
    .or("completed.eq.true,current_step.gte.6")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (progressError) throw progressError;

  if (completedProgress?.[0]?.business_id) {
    return completedProgress[0].business_id;
  }

  const { data: progressRows, error: latestProgressError } = await supabase
    .from("onboarding_progress")
    .select("business_id")
    .in("business_id", businessIds)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (latestProgressError) throw latestProgressError;

  // Existing accounts created before onboarding_progress was introduced still
  // work when they have one business.
  return progressRows?.[0]?.business_id ?? businessIds[0];
}

export async function getActiveBusinessId(): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  return getActiveBusinessIdForUser(user.id);
}
