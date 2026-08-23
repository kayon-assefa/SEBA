import {
  Clock,
  CheckCircle2,
  PackageSearch,
  PackageCheck,
  Trophy,
  XCircle,
} from "lucide-react";

import type { OrderStatus } from "../types/order";

type Props = {
  status: OrderStatus;
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  ready: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusIcons: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: PackageSearch,
  ready: PackageCheck,
  completed: Trophy,
  cancelled: XCircle,
};

export default function OrderStatus({ status }: Props) {
  const Icon = statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      <Icon size={13} />
      {statusLabels[status]}
    </span>
  );
}
