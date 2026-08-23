// File: src/features/onboarding/pages/AppointmentBuilder.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import FieldList from "../components/AppointmentBuilder/FieldList";
import ServiceList from "../components/AppointmentBuilder/ServiceList";
import { onboardingService } from "../services/onboarding.service";

const STEPS = ["Business Info", "Choose Style", "Customize", "Appointments", "Shop"];
const CURRENT_STEP = 3;

export default function AppointmentBuilder() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);

  async function continueSetup() {
    try {
      await onboardingService.updateProgress(5);
      toast.success("Appointment Builder Saved");
      navigate("/onboarding/shop");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save progress");
    }
  }

  async function skipStep() {
    try {
      await onboardingService.updateProgress(5);
      navigate("/onboarding/shop");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF9F7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex items-center justify-center gap-2">
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
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-[#2B2B2B] sm:text-4xl">Set up bookings</h1>
          <p className="mx-auto mt-3 max-w-xl text-[#707070]">
            Add what you offer, then choose what to ask customers when they book.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <ServiceList onServicesChange={setServices} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
        >
          <FieldList services={services} />
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col-reverse justify-end gap-3 border-t border-[#F0E3DE] pt-8 sm:flex-row sm:gap-4"
        >
          <button
            onClick={skipStep}
            className="rounded-[16px] border border-[#F0E3DE] bg-white px-6 py-3 font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#D9A441] hover:shadow-sm active:scale-[0.98]"
          >
            Skip for now
          </button>

          <button
            onClick={continueSetup}
            className="rounded-[16px] bg-[#F25F5C] px-6 py-3 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98]"
          >
            Save & Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}