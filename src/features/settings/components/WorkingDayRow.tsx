import { SettingsInput, SettingsToggle } from "./index";

export type WorkingDay = {
  day: string;
  enabled: boolean;
  open: string;
  close: string;
};

type Props = {
  value: WorkingDay;
  onChange: (value: WorkingDay) => void;
};

export default function WorkingDayRow({
  value,
  onChange,
}: Props) {
  function update(changes: Partial<WorkingDay>) {
    onChange({
      ...value,
      ...changes,
    });
  }

  return (
    <div className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-[180px_1fr_1fr] md:items-end">
      <SettingsToggle
        checked={value.enabled}
        onChange={(checked) =>
          update({ enabled: checked })
        }
        label={value.day}
      />

      <SettingsInput
        label="Opening time"
        type="time"
        value={value.open}
        disabled={!value.enabled}
        onChange={(event) =>
          update({ open: event.target.value })
        }
      />

      <SettingsInput
        label="Closing time"
        type="time"
        value={value.close}
        disabled={!value.enabled}
        onChange={(event) =>
          update({ close: event.target.value })
        }
      />
    </div>
  );
}