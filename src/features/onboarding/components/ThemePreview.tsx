// File: src/features/onboarding/components/ThemePreview.tsx
import type { ThemeData } from "../types/theme";

interface Props {
  theme: ThemeData;
}

export default function ThemePreview({ theme }: Props) {
  const radius =
    theme.border_radius === "rounded-full"
      ? "9999px"
      : theme.border_radius === "rounded-lg"
      ? "12px"
      : "20px";

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#F0E3DE]">
      <div
        className="flex flex-col items-start gap-3 p-8 text-white transition-colors duration-300"
        style={{
          borderRadius: radius,
          background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.primary_color}CC)`,
        }}
      >
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          Preview
        </span>

        <h2 className="text-2xl font-bold">Legend Barber</h2>
        <p className="text-sm text-white/85">Bole, Addis Ababa</p>

        <button
          className="mt-2 rounded-[16px] bg-white px-5 py-2.5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
          style={{ color: theme.primary_color }}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}