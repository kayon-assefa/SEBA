import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";
import type { AppNotification } from "../types/catalog";

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const businessId = await getActiveBusinessId();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    return data ?? [];
  },

  async markRead(id: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  },

  subscribe(
    businessId: string,
    onInsert: (n: AppNotification) => void
  ) {
    const channelName = `notifications-${businessId}-${crypto.randomUUID()}`;

    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        onInsert(payload.new as AppNotification);
      }
    );

    void channel.subscribe();

    let removed = false;

    return () => {
      if (removed) return;
      removed = true;
      void supabase.removeChannel(channel);
    };
  },
};
