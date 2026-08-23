import { Archive, CheckCircle, XCircle } from "lucide-react";

type Props = {
  count: number;
  onArchive: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onClear: () => void;
};

// Feature #6 - bulk selection toolbar, wired to #25/#26 bulk actions
export default function BulkActionBar({ count, onArchive, onActivate, onDeactivate, onClear }: Props) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F25F5C]/30 bg-[#F25F5C]/5 p-4">
      <span className="text-sm font-medium text-[#2B2B2B]">{count} selected</span>

      <div className="ml-auto flex flex-wrap gap-2">
        <button onClick={onActivate} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <CheckCircle size={15} /> Activate
        </button>
        <button onClick={onDeactivate} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <XCircle size={15} /> Deactivate
        </button>
        <button onClick={onArchive} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
          <Archive size={15} /> Archive
        </button>
        <button onClick={onClear} className="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600">
          Clear
        </button>
      </div>
    </div>
  );
}
