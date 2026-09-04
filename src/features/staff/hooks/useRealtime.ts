import { useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";

/**
 * Subscribes to postgres_changes on the given tables (filtered by business_id)
 * and calls `onChange` whenever a row is inserted/updated/deleted. Use this to
 * keep dashboard stats and lists live without polling.
 *
 * Safe no-op if `businessId` is falsy (e.g. still loading).
 */
export function useRealtime(
  tables: string[],
  businessId: string | undefined | null,
  onChange: () => void
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!businessId) return;
    // A page and the staff shell can subscribe to the same table at once.
    // Supabase does not allow callbacks to be added to an already-subscribed
    // channel, so every hook invocation must use its own channel name.
    const channel = supabase.channel(
      `seba-staff-${tables.join("-")}-${businessId}-${crypto.randomUUID()}`
    );

    tables.forEach(table => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `business_id=eq.${businessId}` },
        () => onChangeRef.current()
      );
    });

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(","), businessId]);
}
