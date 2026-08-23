// File: src/features/onboarding/components/AppointmentBuilder/ServiceList.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../../lib/supabase";
import ServiceForm from "./ServiceForm";

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconClock({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function BrowserFrame({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#F0E3DE] bg-white">
      <div className="flex items-center gap-2 border-b border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F25F5C]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9A441]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#7A263A]" />
        </div>
        <div className="ml-2 flex-1 truncate rounded-full border border-[#F0E3DE] bg-white px-3 py-1 text-xs text-[#707070]">
          {path}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface ServiceListProps {
  onServicesChange?: (services: any[]) => void;
}

export default function ServiceList({ onServicesChange }: ServiceListProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function loadServices() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", (business as any).id)
        .order("created_at");

      const list = data || [];
      setServices(list);
      onServicesChange?.(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showModal) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowModal(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showModal]);

  function handleSaved() {
    setShowModal(false);
    loadServices();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2B2B2B]">Services</h2>
          <p className="mt-1 text-sm text-[#707070]">
            What customers can choose from when they book.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-[16px] bg-[#F25F5C] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98]"
        >
          <IconPlus />
          Add Service
        </button>
      </div>

      <BrowserFrame path="seba.com/legendbarber/book">
        {loading && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[16px] bg-[#FFF9F7]" />
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#F0E3DE] py-10 text-center transition-colors duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F25F5C]/10 text-[#F25F5C]">
              <IconPlus className="h-5 w-5" />
            </span>
            <span className="font-medium text-[#2B2B2B]">Add your first service</span>
            <span className="text-sm text-[#707070]">
              Customers need at least one to start booking
            </span>
          </button>
        )}

        {!loading && services.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#707070]">
              Choose a service
            </p>

            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3.5 transition-colors duration-200 hover:border-[#D9A441]"
              >
                <div>
                  <p className="font-medium text-[#2B2B2B]">{service.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-[#707070]">
                    <IconClock />
                    {service.duration} min
                  </p>
                </div>

                <span className="rounded-full bg-[#D9A441]/10 px-3 py-1 text-sm font-semibold text-[#D9A441]">
                  {service.price} ETB
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </BrowserFrame>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#2B2B2B]/40 backdrop-blur-sm sm:items-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-6 shadow-xl sm:max-w-md sm:rounded-[24px]"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#F0E3DE] sm:hidden" />

              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2B2B2B]">Add Service</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#707070] transition-colors duration-200 hover:bg-[#FFF9F7] hover:text-[#2B2B2B]"
                  aria-label="Close"
                >
                  <IconX />
                </button>
              </div>

              <ServiceForm onSaved={handleSaved} onCancel={() => setShowModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}