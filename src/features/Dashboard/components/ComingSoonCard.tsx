// File: src/features/Dashboard/components/ComingSoonCard.tsx
// Shared "coming soon" tile — used for Reviews and Promo Codes so unfinished
// features feel intentional, not broken.

import GlassCard from "./GlassCard";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function ComingSoonCard({ icon, title, description }: Props) {
  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A441]/12 text-[#B4841F]">
          {icon}
        </span>
        <span className="shrink-0 rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#B4841F]">
          Coming soon
        </span>
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#241413]">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-[#6B5A56]">
        {description}
      </p>
    </GlassCard>
  );
}
