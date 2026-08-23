import WorkingDayRow, {
  type WorkingDay,
} from "./WorkingDayRow";

type Props = {
  value: WorkingDay[];
  onChange: (value: WorkingDay[]) => void;
};

export default function WorkingHoursEditor({
  value,
  onChange,
}: Props) {
  function updateDay(
    index: number,
    day: WorkingDay
  ) {
    const next = [...value];
    next[index] = day;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {value.map((day, index) => (
        <WorkingDayRow
          key={day.day}
          value={day}
          onChange={(next) =>
            updateDay(index, next)
          }
        />
      ))}
    </div>
  );
}