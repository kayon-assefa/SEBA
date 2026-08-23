import { Users } from "lucide-react";
import type { Customer } from "../types/customer";
import CustomerRow from "./CustomerRow";

type Props = {
  customers: Customer[];
  loading: boolean;
  density: "compact" | "comfortable";
  onSelect: (customer: Customer) => void;
  onAddFirst: () => void;
};

const COLUMNS = ["Customer", "Phone", "Email", "Visits", "Orders", "Total Spent", "Last Visit"];

export default function CustomerTable({ customers, loading, density, onSelect, onAddFirst }: Props) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="animate-pulse divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 rounded bg-gray-200" />
                <div className="h-3 w-1/6 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 text-center">
        <Users size={40} className="mb-3 text-gray-300" />
        <p className="font-medium text-gray-700">No customers yet</p>
        <p className="mb-4 max-w-xs text-sm text-gray-500">
          Customers show up here automatically once someone orders or books an appointment - or
          add one manually.
        </p>
        <button
          onClick={onAddFirst}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add your first customer
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-xl border bg-white">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-gray-100">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              density={density}
              onClick={() => onSelect(customer)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
