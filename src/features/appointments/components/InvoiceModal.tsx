// src/features/Appointments/components/InvoiceModal.tsx
//
// Printable receipt. "Print / Save as PDF" uses the browser's native print
// dialog (choose "Save as PDF" as the destination) - no extra PDF library
// needed and it always matches what's on screen.

import { X, Printer } from "lucide-react";
import type { Appointment } from "../types/appointment";

type Props = {
  appointment: Appointment | null;
  onClose: () => void;
};

export default function InvoiceModal({ appointment, onClose }: Props) {
  if (!appointment) return null;

  const services = appointment.services?.length ? appointment.services : appointment.service ? [appointment.service] : [];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 print:static print:bg-white print:p-0">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl print:rounded-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 print:hidden">
          <h2 className="text-lg font-bold text-gray-900">Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-[#F25F5C] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#e14e4b]"
            >
              <Printer size={15} /> Print
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Billed to</p>
            <p className="text-lg font-bold text-gray-900">{appointment.customer}</p>
            {appointment.phone && <p className="text-sm text-gray-500">{appointment.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Date</p>
              <p className="font-semibold text-gray-900">{appointment.date}</p>
            </div>
            <div>
              <p className="text-gray-400">Time</p>
              <p className="font-semibold text-gray-900">{appointment.time} – {appointment.end_time}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100">
            {services.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0">
                <span className="text-sm text-gray-700">{s}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-dashed border-gray-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">{appointment.price} ETB</span>
            </div>
            {appointment.deposit_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Deposit paid</span>
                <span className="font-medium text-gray-900">-{appointment.deposit_amount} ETB</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-1.5 text-base font-bold text-gray-900">
              <span>Total due</span>
              <span>{Math.max(0, appointment.price - appointment.deposit_amount)} ETB</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-gray-900">{appointment.payment_status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
