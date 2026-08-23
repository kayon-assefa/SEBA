import type { PeakHour } from "../types/analytics";

type Props = {
  data: PeakHour[];
};

const days = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const hours = [
  8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18,
];

function getValue(
  data: PeakHour[],
  day: string,
  hour: number
) {
  return (
    data.find(
      (item) =>
        item.day === day &&
        item.hour === hour
    )?.value ?? 0
  );
}

export default function PeakHours({
  data,
}: Props) {
  const max = Math.max(
    ...data.map((item) => item.value),
    1
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[650px]">
        <div className="mb-3 grid grid-cols-[70px_repeat(11,1fr)] gap-1">
          <div />

          {hours.map((hour) => (
            <div
              key={hour}
              className="text-center text-[10px] text-gray-400"
            >
              {hour > 12
                ? hour - 12
                : hour}
              {hour >= 12 ? "p" : "a"}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {days.map((day) => (
            <div
              key={day}
              className="grid grid-cols-[70px_repeat(11,1fr)] gap-1"
            >
              <div className="flex items-center text-xs font-medium text-gray-500">
                {day}
              </div>

              {hours.map((hour) => {
                const value = getValue(
                  data,
                  day,
                  hour
                );

                const intensity =
                  value / max;

                return (
                  <div
                    key={hour}
                    title={`${day} ${hour}:00 — ${value} visitors`}
                    className="h-7 rounded-md bg-[#F25F5C]"
                    style={{
                      opacity:
                        value === 0
                          ? 0.08
                          : 0.15 +
                            intensity *
                              0.85,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}