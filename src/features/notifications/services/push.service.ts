// src/features/Notifications/services/push.service.ts
//
// Real browser Web Push (works even when the tab/app is fully closed).
// This is NOT a toast simulation - it registers the service worker,
// asks for Notification permission, subscribes via the PushManager
// with your VAPID public key, and stores the subscription in
// `push_subscriptions`. The actual sending happens server-side in
// supabase/functions/send-push (see README) - a browser can never hold
// the VAPID *private* key safely.

import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

// Set this to the VAPID public key you generate in the README step.
// Safe to expose - it's the public half of the key pair.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export const pushService = {
  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  },

  permission(): NotificationPermission | "unsupported" {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  },

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;
    return navigator.serviceWorker.register("/sw.js");
  },

  /** Shows a native permission prompt. Call this from a user gesture
   *  (a button click), not on page load - browsers block/penalize
   *  prompts that fire automatically. */
  async requestPermissionAndSubscribe(): Promise<{
    ok: boolean;
    reason?: string;
  }> {
    if (!this.isSupported()) {
      return { ok: false, reason: "Push isn't supported in this browser." };
    }
    if (!VAPID_PUBLIC_KEY) {
      return {
        ok: false,
        reason:
          "Missing VITE_VAPID_PUBLIC_KEY - see README step 4 to generate one.",
      };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: "Permission was not granted." };
    }

    const registration = await this.registerServiceWorker();
    if (!registration) return { ok: false, reason: "Service worker failed to register." };

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "Not signed in." };

    const businessId = await getActiveBusinessId();
    const json = subscription.toJSON();

    await supabase.from("push_subscriptions").upsert(
      {
        business_id: businessId,
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      },
      { onConflict: "user_id,endpoint" }
    );

    return { ok: true };
  },

  /** Revoke on logout (Security feature #24) so a signed-out device
   *  stops receiving push for this business. */
  async unsubscribe(): Promise<void> {
    if (!this.isSupported()) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);
    }
  },
};
