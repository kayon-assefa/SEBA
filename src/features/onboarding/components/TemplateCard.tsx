// File: src/features/onboarding/components/TemplateCard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { onboardingService } from "../services/onboarding.service";

export default function TemplateCard({ template }: any) {
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(false);

  async function selectTemplate() {
    setSelecting(true);
    try {
      await onboardingService.saveTemplate(template.id);

      await onboardingService.updateProgress(3);

      toast.success("Template Selected");

      navigate("/onboarding/customize");
    } catch {
      toast.error("Failed");
    } finally {
      setSelecting(false);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group overflow-hidden rounded-[24px] border border-[#F0E3DE] bg-white shadow-[0_2px_10px_rgba(122,38,58,0.04)] transition-shadow duration-200 hover:shadow-[0_10px_28px_rgba(122,38,58,0.10)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FFF9F7]">
        <img
          src={template.image}
          alt={template.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-semibold text-[#2B2B2B]">{template.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-[#707070]">{template.description}</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => window.open(`/demo/template-${template.id}`, "_blank")}
            className="flex-1 rounded-[16px] border border-[#F0E3DE] bg-white px-4 py-2.5 text-sm font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7] active:scale-[0.98]"
          >
            Preview
          </button>

          <button
            onClick={selectTemplate}
            disabled={selecting}
            className="flex-1 rounded-[16px] bg-[#F25F5C] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {selecting ? "Selecting..." : "Select"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}