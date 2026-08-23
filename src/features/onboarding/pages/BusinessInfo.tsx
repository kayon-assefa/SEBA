// File: src/features/onboarding/pages/BusinessInfo.tsx
import { motion } from "framer-motion";
import BusinessForm from "../components/BusinessForm";

const STEPS = ["Business Info", "Choose Style", "Customize", "Appointments", "Shop"];
const CURRENT_STEP = 0;

export default function BusinessInfo() {
  return (
    <div className="min-h-screen bg-[#FFF9F7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
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
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#2B2B2B] sm:text-4xl">
            Tell us about your business
          </h1>
          <p className="mt-3 text-[#707070]">
            This shows up on your booking page and helps customers find you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          className="rounded-[24px] border border-[#F0E3DE] bg-white p-6 shadow-[0_4px_24px_rgba(122,38,58,0.06)] sm:p-10"
        >
          <BusinessForm />
        </motion.div>
      </div>
    </div>
  );
}