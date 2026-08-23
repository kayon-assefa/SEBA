import type { ProductForm } from "../types/product";

/**
 * Feature #60 - offline support / caching with sync.
 * Lightweight, dependency-free queue: while offline, mutations are
 * stashed in localStorage; once the browser reports "online" again,
 * `flushQueue` replays them through productService in order.
 *
 * This is a pragmatic implementation for a single-tab, best-effort case.
 * It is NOT a conflict resolver - if the same product was edited
 * elsewhere while offline, last-write-wins on sync, same as the rest
 * of this module.
 */

const QUEUE_KEY = "products_offline_queue_v1";

export type QueuedMutation =
  | { type: "create"; tempId: string; form: ProductForm }
  | { type: "update"; id: string; form: ProductForm }
  | { type: "delete"; id: string };

function readQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMutation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueMutation(mutation: QueuedMutation) {
  const queue = readQueue();
  queue.push(mutation);
  writeQueue(queue);
}

export function getQueueLength(): number {
  return readQueue().length;
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Call this once from Products.tsx (see the useOfflineSync hook) with the
 * live productService so queued mutations run in order as soon as
 * connectivity returns.
 */
export async function flushQueue(handlers: {
  create: (form: ProductForm) => Promise<unknown>;
  update: (id: string, form: ProductForm) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}): Promise<{ succeeded: number; failed: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;
  const remaining: QueuedMutation[] = [];

  for (const mutation of queue) {
    try {
      if (mutation.type === "create") await handlers.create(mutation.form);
      if (mutation.type === "update")
        await handlers.update(mutation.id, mutation.form);
      if (mutation.type === "delete") await handlers.remove(mutation.id);
      succeeded += 1;
    } catch {
      failed += 1;
      remaining.push(mutation); // retry next time we come online
    }
  }

  writeQueue(remaining);
  return { succeeded, failed };
}
