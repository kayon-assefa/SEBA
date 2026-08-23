import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { flushQueue, getQueueLength, isOffline } from "../utils/offlineQueue";
import { productService } from "../services/product.service";

// Feature #60 - offline support / caching with sync
export function useOfflineSync(onSynced: () => void) {
  const [offline, setOffline] = useState(isOffline());
  const [pending, setPending] = useState(getQueueLength());

  useEffect(() => {
    async function handleOnline() {
      setOffline(false);

      const result = await flushQueue({
        create: (form) => productService.createProduct(form),
        update: (id, form) => productService.updateProduct(id, form),
        remove: (id) => productService.deleteProduct(id),
      });

      setPending(getQueueLength());

      if (result.succeeded > 0) {
        toast.success(`Synced ${result.succeeded} offline change(s)`);
        onSynced();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} change(s) failed to sync - will retry`);
      }
    }

    function handleOffline() {
      setOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onSynced]);

  return { offline, pending };
}
