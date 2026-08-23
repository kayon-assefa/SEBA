// src/features/Notifications/components/EmptyState.tsx

import { BellOff } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "You're all caught up",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <BellOff className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}
