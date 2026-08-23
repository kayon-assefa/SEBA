type Props = {
  totalProducts: number;
  showing: number;
  totalStock: number;
  lowStockCount: number;
};

export default function SummaryCards({ totalProducts, showing, totalStock, lowStockCount }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <SummaryCard label="Total products" value={totalProducts} />
      <SummaryCard label="Showing" value={showing} />
      <SummaryCard label="Total stock" value={totalStock} />
      <SummaryCard label="Low stock" value={lowStockCount} accent={lowStockCount > 0} />
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-red-600" : "text-[#2B2B2B]"}`}>{value}</p>
    </div>
  );
}
