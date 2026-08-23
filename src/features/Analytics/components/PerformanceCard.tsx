type Props = {
  label: string;
  value: number | string;
};

export default function PerformanceCard({
  label,
  value,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#2B2B2B]">
        {value}
      </p>
    </div>
  );
}