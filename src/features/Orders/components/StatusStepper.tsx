import { Check } from "lucide-react";

import type { OrderStatus } from "../types/order";

type Props = {
  status: OrderStatus;
};

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

export default function StatusStepper({ status }: Props) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <div
            key={step.key}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                  done
                    ? "bg-orange-600 text-white"
                    : active
                      ? "bg-orange-100 text-orange-700 ring-2 ring-orange-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check size={14} /> : index + 1}
              </div>

              <span
                className={`text-[10px] font-medium ${
                  done || active
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`mx-1 mb-4 h-0.5 flex-1 rounded ${
                  done ? "bg-orange-600" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
