type Props = {
  label: string;
  icon?: React.ReactNode;
};

// Shared "coming soon" affordance for #16 (dark mode), #27 (CSV import),
// and #38 (sale price) - visible and discoverable, but intentionally
// disabled rather than half-working.
export default function ComingSoonButton({ label, icon }: Props) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400"
    >
      {icon}
      {label}
      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        Soon
      </span>
    </button>
  );
}
