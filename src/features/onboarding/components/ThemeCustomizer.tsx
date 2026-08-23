// File: src/features/onboarding/components/ThemeCustomizer.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ThemePreview from "./ThemePreview";
import { onboardingService } from "../services/onboarding.service";

const RADIUS_OPTIONS = [
  { value: "rounded-lg", label: "Rounded" },
  { value: "rounded-xl", label: "Soft" },
  { value: "rounded-full", label: "Pill" },
];

const inputClass =
  "w-full rounded-[16px] border border-[#F0E3DE] bg-white px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none transition-all duration-200 focus:border-[#F25F5C] focus:ring-4 focus:ring-[#F25F5C]/10";

export default function ThemeCustomizer() {
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);

  const [theme, setTheme] = useState({
    primary_color: "#FF5A5F",
    font_family: "Inter",
    border_radius: "rounded-xl",
    cover_image: "",
    facebook: "",
    instagram: "",
    telegram: "",
    tiktok: "",
    website: "",
  });

  async function publish() {
    setPublishing(true);
    try {
      await onboardingService.saveTheme(theme);

      await onboardingService.updateProgress(4);

      toast.success("Design Published");

      navigate("/onboarding/appointments");
    } catch {
      toast.error("Failed");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2B2B2B]">Theme Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.primary_color}
              onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
              className="h-12 w-12 cursor-pointer rounded-[16px] border border-[#F0E3DE] p-1"
            />
            <span className="text-sm text-[#707070]">{theme.primary_color}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2B2B2B]">Border Radius</label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme({ ...theme, border_radius: option.value })}
                className={`flex-1 rounded-[16px] border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme.border_radius === option.value
                    ? "border-[#F25F5C] bg-[#F25F5C]/10 text-[#F25F5C]"
                    : "border-[#F0E3DE] bg-white text-[#707070] hover:border-[#D9A441]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2B2B2B]">Facebook</label>
          <input
            className={inputClass}
            value={theme.facebook}
            onChange={(e) => setTheme({ ...theme, facebook: e.target.value })}
            placeholder="facebook.com/yourbusiness"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2B2B2B]">Instagram</label>
          <input
            className={inputClass}
            value={theme.instagram}
            onChange={(e) => setTheme({ ...theme, instagram: e.target.value })}
            placeholder="instagram.com/yourbusiness"
          />
        </div>

        <button
          onClick={publish}
          disabled={publishing}
          className="w-full rounded-[16px] bg-[#F25F5C] px-6 py-3.5 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {publishing ? "Publishing..." : "Publish Design"}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="sticky top-10 h-fit rounded-[24px] border border-[#F0E3DE] bg-white p-6"
      >
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#707070]">
          Live Preview
        </p>
        <ThemePreview theme={theme} />
      </motion.div>
    </div>
  );
}