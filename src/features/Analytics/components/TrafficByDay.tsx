import type { DayTraffic } from "../types/analytics";

type Props = {
  data: DayTraffic[];
};

export default function TrafficByDay({
  data,
}: Props) {
  const max = Math.max(
    ...data.map((item) => item.visitors),
    1
  );

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.day}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-gray-700">
              {item.day}
            </span>

            <span className="text-gray-500">
              {item.visitors}
            </span>
          </div>

          <div className="h-3 rounded-full bg-gray-100">
            <div
              className="h-3 rounded-full bg-[#D9A441]"
              style={{
                width: `${
                  (item.visitors / max) * 100
                }%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}