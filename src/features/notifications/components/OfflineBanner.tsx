// src/features/Notifications/components/OfflineBanner.tsx

import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <WifiOff className="h-4 w-4 shrink-0" />
      You're offline — showing your last saved notifications. New ones and
      any changes will sync once you're back online.
    </div>
  );
}
