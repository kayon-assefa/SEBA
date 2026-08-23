import type { TrafficPoint } from "../types/analytics";

type Props = {
  data: TrafficPoint[];
  mode: "visitors" | "pageViews";
  onModeChange: (
    mode: "visitors" | "pageViews"
  ) => void;
};

export default function TrafficChart({
  data,
  mode,
  onModeChange,
}: Props) {
  const values = data.map((item) =>
    mode === "visitors"
      ? item.visitors
      : item.pageViews
  );

  const max =
    Math.max(...values, 1);

  const points = data
    .map((item, index) => {
      const x =
        data.length === 1
          ? 50
          : (index /
              (data.length - 1)) *
            100;

      const value =
        mode === "visitors"
          ? item.visitors
          : item.pageViews;

      const y =
        100 -
        (value / max) * 85;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2B2B2B]">
            Visitors over time
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Understand how your SEBA page is being discovered.
          </p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() =>
              onModeChange("visitors")
            }
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              mode === "visitors"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Visitors
          </button>

          <button
            onClick={() =>
              onModeChange("pageViews")
            }
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              mode === "pageViews"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Page Views
          </button>
        </div>
      </div>

      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-gray-50 p-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <line
            x1="0"
            y1="15"
            x2="100"
            y2="15"
            stroke="currentColor"
            className="text-gray-200"
          />

          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="currentColor"
            className="text-gray-200"
          />

          <line
            x1="0"
            y1="85"
            x2="100"
            y2="85"
            stroke="currentColor"
            className="text-gray-200"
          />

          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            className="text-[#F25F5C]"
          />
        </svg>
      </div>

      <div className="mt-3 flex justify-between text-xs text-gray-400">
        {data.map((item) => (
          <span key={item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}