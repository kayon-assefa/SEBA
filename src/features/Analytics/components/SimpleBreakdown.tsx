import type { BreakdownItem } from "../types/analytics";

type Props = {
  items: BreakdownItem[];
};

export default function SimpleBreakdown({
  items,
}: Props) {
  if (!items.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No data available for this period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              {item.label}
            </span>

            <span className="text-gray-500">
              {item.percentage}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#F25F5C]"
              style={{
                width: `${Math.min(
                  item.percentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}