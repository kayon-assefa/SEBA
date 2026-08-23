// File: src/features/onboarding/pages/TemplateSelection.tsx
import { motion } from "framer-motion";
import TemplateCard from "../components/TemplateCard";
import { templates } from "../data/templates";

const STEPS = ["Business Info", "Choose Style", "Customize", "Appointments", "Shop"];
const CURRENT_STEP = 1;

export default function TemplateSelection() {
  return (
    <div className="min-h-screen bg-[#FFF9F7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                  index === CURRENT_STEP
                    ? "bg-[#F25F5C] text-white"
                    : index < CURRENT_STEP
                    ? "bg-[#D9A441] text-white"
                    : "border border-[#F0E3DE] bg-white text-[#707070]"
                }`}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && <div className="h-px w-6 bg-[#F0E3DE] sm:w-10" />}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold text-[#2B2B2B] sm:text-4xl">
            Choose your business style
          </h1>
          <p className="mt-3 text-[#707070]">
            Pick a look for your booking page. You can change it anytime later.
          </p>
        </motion.div>

        {templates.length === 0 ? (
          <div className="rounded-[24px] border border-[#F0E3DE] bg-white p-12 text-center text-[#707070]">
            No templates available yet. Check back soon.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {templates.map((template) => (
              <motion.div
                key={template.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
                }}
              >
                <TemplateCard template={template} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}