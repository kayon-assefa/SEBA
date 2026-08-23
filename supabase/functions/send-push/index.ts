// supabase/functions/send-push/index.ts
//
// Deploy with: supabase functions deploy send-push
// Then wire it to fire automatically via a Database Webhook
// (Dashboard → Database → Webhooks → New webhook):
//   Table: notifications, Event: INSERT, Type: Supabase Edge Function,
//   Function: send-push
//
// This is the ONLY place the VAPID *private* key exists - it never
// touches the browser. Set both keys as function secrets:
//   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
//
// It also needs the service role key (already available by default in
// every edge function as SUPABASE_SERVICE_ROLE_KEY) to read subscriptions
// and settings, bypassing RLS server-side - safe here because this code
// runs on Supabase's infrastructure, not in a browser.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";
if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
  throw new Error("Missing required Supabase or VAPID Edge Function secrets.");
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const supabase = createClient(supabaseUrl, serviceRoleKey);

type PushDeliveryError = Error & { statusCode?: number };

function isQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  // Handles ranges that cross midnight (e.g. 21:00 -> 08:00).
  if (startMins <= endMins) {
    return nowMins >= startMins && nowMins < endMins;
  }
  return nowMins >= startMins || nowMins < endMins;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Database Webhook payload shape: { type, table, record, ... }
    const notification = payload.record ?? payload;

    const { data: subs, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .eq("business_id", notification.business_id);

    if (subsError) throw subsError;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        // Per-user settings: category mute + quiet hours (Security/UX
        // features 15 & 16) are enforced here, server-side, not just in
        // the UI, so a muted category truly never reaches the device.
        const { data: settings } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", sub.user_id)
          .eq("business_id", notification.business_id)
          .maybeSingle();

        if (settings) {
          if (settings.push_enabled === false) return "skipped:push_disabled";
          const categoryOn =
            settings.categories_enabled?.[notification.category] ?? true;
          if (!categoryOn) return "skipped:category_muted";
          if (
            settings.quiet_hours_enabled &&
            isQuietHours(settings.quiet_hours_start, settings.quiet_hours_end)
          ) {
            return "skipped:quiet_hours";
          }
        }

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: notification.title,
              body: notification.body,
              link: notification.link,
              tag: notification.entity_id ?? undefined,
            })
          );
          return "sent";
        } catch (error) {
          // 410/404 means the subscription is dead (uninstalled, expired) -
          // clean it up so we stop trying.
          const statusCode = (error as PushDeliveryError).statusCode;
          if (statusCode === 410 || statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            return "removed:expired";
          }
          throw error;
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
