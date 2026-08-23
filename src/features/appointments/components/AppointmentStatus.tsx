// src/features/Appointments/components/AppointmentStatus.tsx

type Props = {
  status: string;
  dark?: boolean;
};

const COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
  Confirmed: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
  Completed: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Cancelled: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
  "No-show": "bg-gray-200 text-gray-700 ring-1 ring-inset ring-gray-300",
  Waitlisted: "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200",
};

const DOTS: Record<string, string> = {
  Pending: "bg-amber-500",
  Confirmed: "bg-blue-500",
  Completed: "bg-emerald-500",
  Cancelled: "bg-red-500",
  "No-show": "bg-gray-500",
  Waitlisted: "bg-purple-500",
};

export default function AppointmentStatus({ status }: Props) {
  const color = COLORS[status] ?? "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
  const dot = DOTS[status] ?? "bg-gray-400";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
