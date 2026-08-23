// File: src/features/Dashboard/components/OnboardingChecklist.tsx
// Setup checklist. Deliberately a plain list (not a progress ring) — once
// every item is complete the whole card unmounts so finished businesses
// aren't stuck staring at a "you're done" panel forever.

import GlassCard from "./GlassCard";

type Item = {
  title: string;
  complete: boolean;
  optional?: boolean;
};

type Props = {
  items: Item[];
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function OnboardingChecklist({ items }: Props) {
  const requiredItems = items.filter((i) => !i.optional);
  const allRequiredComplete = requiredItems.every((i) => i.complete);
  const allComplete = items.every((i) => i.complete);

  // Everything's done — the checklist has served its purpose. Hide it.
  if (allComplete) {
    return null;
  }

  const doneCount = items.filter((i) => i.complete).length;

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#241413]">Business Setup</h2>
        <span className="seba-tabular text-xs font-semibold text-[#B4841F]">
          {doneCount}/{items.length}
        </span>
      </div>

      <p className="mt-1 text-xs text-[#6B5A56]">
        {allRequiredComplete
          ? "The essentials are done — a couple of optional steps left."
          : "A few quick steps and your page is fully ready."}
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                item.complete
                  ? "bg-[#D9A441] text-white"
                  : "border-2 border-[#E5D8D3] text-transparent"
              }`}
            >
              <CheckIcon />
            </div>

            <div className="min-w-0">
              <p
                className={`text-sm font-medium ${
                  item.complete ? "text-[#6B5A56] line-through" : "text-[#241413]"
                }`}
              >
                {item.title}
              </p>
              {item.optional && (
                <p className="text-[10px] text-[#B4A29C]">Optional</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
