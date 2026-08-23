import { X } from "lucide-react";
import type { Customer } from "../types/customer";
import CustomerProfile from "./CustomerProfile";

type Props = {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (customer: Customer) => void;
};

export default function CustomerDrawer({ customer, open, onClose, onUpdated }: Props) {
  if (!open || !customer) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />

      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
          <h2 className="text-xl font-bold">Customer</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <CustomerProfile customer={customer} onUpdated={onUpdated} />
      </div>
    </>
  );
}
