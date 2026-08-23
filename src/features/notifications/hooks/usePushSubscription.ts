// src/features/Notifications/hooks/usePushSubscription.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { pushService } from "../services/push.service";

export function usePushSubscription() {
  const [permission, setPermission] = useState(pushService.permission());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPermission(pushService.permission());
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const result = await pushService.requestPermissionAndSubscribe();
      setPermission(pushService.permission());
      if (result.ok) {
        toast.success("Push notifications enabled");
      } else {
        toast.error(result.reason ?? "Couldn't enable push notifications");
      }
      return result.ok;
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await pushService.unsubscribe();
      toast("Push notifications turned off");
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    supported: pushService.isSupported(),
    permission,
    busy,
    enable,
    disable,
  };
}
