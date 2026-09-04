/**
 * Web push scaffold.
 * ---------------------------------------------------------------
 * Real push notifications need three things beyond this file:
 *   1. A service worker file (see /public/seba-staff-sw.js in the README)
 *   2. A VAPID key pair (generate once, put the public key below)
 *   3. A tiny server-side sender (Supabase Edge Function) that reads
 *      `push_subscriptions` and POSTs to each endpoint when something
 *      happens (new appointment, order update, etc.)
 *
 * This file handles step-by-step permission + subscription on the client
 * and hands the resulting subscription to staffData.savePushSubscription().
 * Until you deploy the Edge Function, subscriptions are stored but nothing
 * will actually be sent — in-app + toast notifications work regardless.
 */

// Generate this once with `npx web-push generate-vapid-keys` and set the
// public value in VITE_VAPID_PUBLIC_KEY. The private key stays server-side.
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim() ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function enablePushNotifications(): Promise<PushSubscription | null> {
  if (!isPushSupported()) throw new Error("Push notifications aren't supported in this browser.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was denied.");

  const registration = await navigator.serviceWorker.register("/seba-staff-sw.js");
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  if (!VAPID_PUBLIC_KEY) {
    // No key configured yet — permission is granted and the service worker
    // is registered, but we can't create a push subscription without it.
    return null;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}
