// src/features/Appointments/components/AppointmentDrawer.tsx

import { X } from "lucide-react";

import type { Appointment, AppointmentStatus } from "../types/appointment";

import AppointmentDetails from "./AppointmentDetails";
import AppointmentActions from "./AppointmentActions";

type Props = {
  appointment: Appointment | null;
  open: boolean;
  dark: boolean;
  onClose: () => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onMarkPaid: () => void;
  onInvoice: () => void;
  onEdit: () => void;
  onDelete: () => void;
  actionLoading?: boolean;
};

export default function AppointmentDrawer({
  appointment,
  open,
  dark,
  onClose,
  onStatusChange,
  onMarkPaid,
  onInvoice,
  onEdit,
  onDelete,
  actionLoading = false,
}: Props) {
  if (!open || !appointment) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={() => !actionLoading && onClose()} />

      <div className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col shadow-2xl ${dark ? "bg-[#1c1c1c]" : "bg-white"}`}>
        <div className={`flex items-center justify-between border-b p-5 ${dark ? "border-white/10" : "border-gray-200"}`}>
          <div>
            <h2 className={`text-xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>Appointment</h2>
            <p className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>{appointment.customer}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              dark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <AppointmentDetails appointment={appointment} dark={dark} />
        </div>

        <div className={`border-t p-5 ${dark ? "border-white/10" : "border-gray-200"}`}>
          <AppointmentActions
            appointment={appointment}
            onStatusChange={onStatusChange}
            onMarkPaid={onMarkPaid}
            onInvoice={onInvoice}
            onEdit={onEdit}
            onDelete={onDelete}
            loading={actionLoading}
          />
        </div>
      </div>
    </>
  );
}
