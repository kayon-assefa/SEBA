import { Upload, Download } from "lucide-react";
import type { Product } from "../types/product";
import { exportProductsToCsv } from "../utils/csv";
import ComingSoonButton from "./ComingSoonButton";

type Props = {
  products: Product[];
};

// Feature #28 (export - works) and #27 (import - "Coming soon" per your request)
export default function ExportImportBar({ products }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => exportProductsToCsv(products)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <Download size={16} /> Export CSV
      </button>

      <ComingSoonButton label="Import CSV" icon={<Upload size={16} />} />
    </div>
  );
}
