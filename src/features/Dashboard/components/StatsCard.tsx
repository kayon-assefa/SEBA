// File: src/features/Dashboard/components/StatsCard.tsx
// Bento-grid stat tile. Trend arrows/sparklines were removed along with the
// fake demo numbers — showing a trend requires real historical data we
// don't have yet, so we only show what's real: the current count.
// Card surface uses a warm cream→white tint (instead of plain glass-white)
// so stat cards read as a distinct "layer" from the content cards below.

import { useNavigate } from "react-router-dom";
import { useCountUp } from "../hooks/useCountUp";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accent?: "coral" | "gold";
  linkToAnalytics?: boolean;
};

export default function StatCard({
  icon,
  label,
  value,
  suffix = "",
  prefix = "",
  accent = "coral",
  linkToAnalytics = true,
}: Props) {
  const navigate = useNavigate();
  const animated = useCountUp(value);

  const accentSoftBg = accent === "gold" ? "bg-[#D9A441]/14" : "bg-[#FF5A5F]/14";
  const accentText = accent === "gold" ? "text-[#B4841F]" : "text-[#E14549]";
  const topBorder = accent === "gold" ? "#D9A441" : "#FF5A5F";

  const Tag = linkToAnalytics ? "button" : "div";

  return (
    <Tag
      onClick={linkToAnalytics ? () => navigate("/dashboard/analytics") : undefined}
      className={`seba-card-hover group relative w-full overflow-hidden rounded-[22px] border border-white/70 p-5 text-left shadow-[0_6px_20px_rgba(255,90,95,0.08)] ${
        linkToAnalytics ? "cursor-pointer" : ""
      }`}
      style={{
        background: "linear-gradient(160deg, #FFFDFB 0%, #FFF2E6 100%)",
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: topBorder }}
      />

      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentSoftBg} ${accentText}`}
      >
        {icon}
      </span>

      <p className="mt-4 text-sm font-medium text-[#6B5A56]">{label}</p>

      <p className="seba-tabular mt-1 text-3xl font-bold text-[#241413]">
        {prefix}
        {Math.round(animated).toLocaleString()}
        {suffix}
      </p>

      {linkToAnalytics && (
        <p className="mt-2 text-xs font-medium text-[#B4841F] opacity-0 transition-opacity group-hover:opacity-100">
          View in Analytics →
        </p>
      )}
    </Tag>
  );
}
