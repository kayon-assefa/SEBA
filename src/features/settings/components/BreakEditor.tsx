import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type BreakTime = {
  id: string;
  start: string;
  end: string;
};

type Props = {
  value: BreakTime[];
  onChange: (value: BreakTime[]) => void;
};

export default function BreakEditor({
  value,
  onChange,
}: Props) {
  const [counter, setCounter] = useState(0);

  function addBreak() {
    setCounter((current) => current + 1);

    onChange([
      ...value,
      {
        id: `${Date.now()}-${counter}`,
        start: "13:00",
        end: "14:00",
      },
    ]);
  }

  function updateBreak(
    index: number,
    changes: Partial<BreakTime>
  ) {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, ...changes }
          : item
      )
    );
  }

  function removeBreak(index: number) {
    onChange(
      value.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div
          key={item.id}
          className="grid gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Start
            </label>

            <input
              type="time"
              value={item.start}
              onChange={(event) =>
                updateBreak(index, {
                  start: event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              End
            </label>

            <input
              type="time"
              value={item.end}
              onChange={(event) =>
                updateBreak(index, {
                  end: event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => removeBreak(index)}
            className="self-end rounded-lg p-2.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addBreak}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        <Plus size={16} />
        Add break
      </button>
    </div>
  );
}