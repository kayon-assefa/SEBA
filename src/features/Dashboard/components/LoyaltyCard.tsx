// File: src/features/Dashboard/components/LoyaltyCard.tsx
// Points are computed from real activity: bookings and shop orders — not a
// hardcoded number. Formula is shown so the owner can see where it comes
// from; tune the per-action point values whenever the real rewards rules
// are finalized.

import { Gift } from "lucide-react";
import GlassCard from "./GlassCard";

const POINTS_PER_BOOKING = 10;
const POINTS_PER_ORDER = 15;

type Props = {
  bookingsCount: number;
  ordersCount: number;
  nextTierAt?: number;
  tierName?: string;
};

export default function LoyaltyCard({
  bookingsCount,
  ordersCount,
  nextTierAt = 2000,
  tierName = "Gold Perks",
}: Props) {
  const pointsIssued =
    bookingsCount * POINTS_PER_BOOKING + ordersCount * POINTS_PER_ORDER;
  const pct = Math.min(100, Math.round((pointsIssued / nextTierAt) * 100));

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5A5F]/12 text-[#E14549]">
          <Gift size={18} />
        </span>
        <h2 className="text-sm font-bold text-[#241413]">Loyalty Rewards</h2>
      </div>

      <p className="mt-4 text-2xl font-bold text-[#241413]">
        {pointsIssued.toLocaleString()}{" "}
        <span className="text-sm font-medium text-[#6B5A56]">
          points issued
        </span>
      </p>

      <p className="mt-1 text-[11px] text-[#B4A29C]">
        {bookingsCount} bookings × {POINTS_PER_BOOKING}pt + {ordersCount} orders × {POINTS_PER_ORDER}pt
      </p>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#F0E3DE]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF7A6E] to-[#D9A441] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-[#6B5A56]">
        {nextTierAt - pointsIssued > 0
          ? `${(nextTierAt - pointsIssued).toLocaleString()} points to unlock "${tierName}"`
          : `"${tierName}" tier unlocked`}
      </p>
    </GlassCard>
  );
}
