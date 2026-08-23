import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type SpecialHour = {
  id: string;
  date: string;
  closed: boolean;
  open?: string;
  close?: string;
  label?: string;
};

type Props = {
  value: SpecialHour[];
  onChange: (value: SpecialHour[]) => void;
};

export default function SpecialHoursEditor({
  value,
  onChange,
}: Props) {
  const [counter, setCounter] = useState(0);

  function addSpecialHour() {
    setCounter((current) => current + 1);

    onChange([
      ...value,
      {
        id: `${Date.now()}-${counter}`,
        date: "",
        closed: true,
        label: "",
      },
    ]);
  }

  function update(
    index: number,
    changes: Partial<SpecialHour>
  ) {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, ...changes }
          : item
      )
    );
  }

  function remove(index: number) {
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
          className="rounded-xl border border-gray-200 p-4"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Date
              </label>

              <input
                type="date"
                value={item.date}
                onChange={(event) =>
                  update(index, {
                    date: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Label
              </label>

              <input
                value={item.label ?? ""}
                onChange={(event) =>
                  update(index, {
                    label: event.target.value,
                  })
                }
                placeholder="Holiday"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-lg p-2.5 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.closed}
              onChange={(event) =>
                update(index, {
                  closed: event.target.checked,
                })
              }
            />
            Closed all day
          </label>

          {!item.closed && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Opening time
                </label>

                <input
                  type="time"
                  value={item.open ?? ""}
                  onChange={(event) =>
                    update(index, {
                      open: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Closing time
                </label>

                <input
                  type="time"
                  value={item.close ?? ""}
                  onChange={(event) =>
                    update(index, {
                      close: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSpecialHour}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
      >
        <Plus size={16} />
        Add special hour
      </button>
    </div>
  );
}