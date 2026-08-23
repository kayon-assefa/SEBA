import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import type { Customer, DuplicateCandidate } from "../types/customer";
import { customerService } from "../services/customer.service";

type Props = {
  candidate: DuplicateCandidate | null;
  onClose: () => void;
  onMerged: (survivor: Customer) => void;
};

export default function MergeCustomersModal({ candidate, onClose, onMerged }: Props) {
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);

  if (!candidate) return null;

  const { customerA, customerB } = candidate;
  const chosenPrimary = primaryId ?? customerA.id;
  const duplicateId = chosenPrimary === customerA.id ? customerB.id : customerA.id;

  async function handleMerge() {
    setMerging(true);
    try {
      const survivor = await customerService.mergeCustomers(chosenPrimary, duplicateId);
      toast.success("Customers merged");
      onMerged(survivor);
      onClose();
    } catch (err) {
      console.error("Merge error:", err);
      toast.error("Failed to merge customers");
    } finally {
      setMerging(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Merge customers</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Pick which record to keep. The other will be merged into it (visits, orders, spend,
          tags and notes are combined) and then removed.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[customerA, customerB].map((c) => (
            <button
              key={c.id}
              onClick={() => setPrimaryId(c.id)}
              className={`rounded-lg border-2 p-3 text-left ${
                chosenPrimary === c.id ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-500">{c.phone || "no phone"}</p>
              <p className="text-xs text-gray-500">{c.email || "no email"}</p>
              <p className="mt-1 text-xs text-gray-500">
                {c.total_visits} visits · {c.total_orders} orders
              </p>
              {chosenPrimary === c.id && (
                <p className="mt-1 text-xs font-medium text-gray-900">Keep this one</p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={merging}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {merging ? "Merging..." : "Merge"}
          </button>
        </div>
      </div>
    </div>
  );
}
