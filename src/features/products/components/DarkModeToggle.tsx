import { Moon } from "lucide-react";

// Feature #16 - "Coming soon" per your request. The toggle is visible so
// people know it's on the way, but it's disabled - no half-working theme.
export default function DarkModeToggle() {
  return (
    <button
      type="button"
      disabled
      title="Dark mode is coming soon"
      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400"
    >
      <Moon size={15} />
      <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">Soon</span>
    </button>
  );
}
