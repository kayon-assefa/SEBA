// File: src/features/onboarding/pages/ShopBuilder.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import ProductList from "../components/ShopBuilder/ProductList";
import { onboardingService } from "../services/onboarding.service";
import { supabase } from "../../../lib/supabase";

const STEPS = ["Business Info", "Choose Style", "Customize", "Appointments", "Shop"];
const CURRENT_STEP = 4;

function IconShield({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconClock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function ShopBuilder() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("yourbusiness");

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("businesses")
      .select("username")
      .eq("owner_id", user.id)
      .single();

    if (data?.username) setUsername(data.username);
  }

// File: src/features/onboarding/pages/ShopBuilder.tsx
// REPLACE finish() WITH THIS

async function finish() {
  try {
    /*
     * Mark the onboarding as completed directly.
     * current_step = 6
     * completed = true
     */
    await onboardingService.updateProgress(6);
    await onboardingService.completeOnboarding();

    toast.success("Business Published");

    /*
     * Give Supabase a moment to finish the update before
     * changing routes, then use React Router navigation.
     */
    navigate("/dashboard", {
      replace: true,
    });
  } catch (error) {
    console.error("Finish onboarding error:", error);
    toast.error("Failed to complete onboarding");
  }
}

  return (
    <div className="min-h-screen bg-[#FFF9F7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
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
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#7A263A]/10 px-3 py-1.5 text-xs font-semibold text-[#7A263A]">
            <IconShield />
            Premium Feature
          </div>

          <h1 className="text-3xl font-bold text-[#2B2B2B] sm:text-4xl">
            Sell products alongside your bookings
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#707070]">
            The shop is an add-on to your booking page — not required to get started, but a
            good way to earn more from every customer.
          </p>

          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-[16px] border border-[#D9A441]/30 bg-[#D9A441]/5 px-4 py-2.5 text-sm text-[#7A263A]">
            <IconClock />
            Included free for your first 14 days
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
          className="rounded-[16px] border border-[#F0E3DE] bg-white px-5 py-4 text-center text-sm text-[#707070]"
        >
          Your shop will appear at{" "}
          <span className="font-medium text-[#2B2B2B]">seba.com/{username}/shop</span>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
        >
          <ProductList />
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex flex-col-reverse justify-end gap-3 border-t border-[#F0E3DE] pt-8 sm:flex-row sm:gap-4"
        >
          <button
            onClick={finish}
            className="rounded-[16px] border border-[#F0E3DE] bg-white px-6 py-3 font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#D9A441] hover:shadow-sm active:scale-[0.98]"
          >
            Skip for now
          </button>

          <button
            onClick={finish}
            className="rounded-[16px] bg-[#F25F5C] px-6 py-3 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98]"
          >
            Finish Setup
          </button>
        </motion.div>
      </div>
    </div>
  );
}