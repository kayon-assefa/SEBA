type Props = {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
};

export default function AnalyticsCard({
  title,
  value,
  change,
  icon,
}: Props) {
  const positive = change !== undefined && change >= 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-[#2B2B2B]">
            {value.toLocaleString()}
          </p>

          {change !== undefined && (
            <p
              className={`mt-2 text-sm font-medium ${
                positive
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {positive ? "↑" : "↓"}{" "}
              {Math.abs(change)}%
              <span className="ml-1 font-normal text-gray-400">
                vs previous period
              </span>
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
}