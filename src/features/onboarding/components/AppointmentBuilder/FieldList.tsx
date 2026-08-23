// File: src/features/onboarding/components/AppointmentBuilder/FieldList.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../../lib/supabase";
import FieldForm from "./FieldForm";

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
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
function IconCalendar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
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
function IconChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const DEFAULT_FIELDS = [
  { label: "Full Name", field_type: "Text", placeholder: "Enter your name" },
  { label: "Phone Number", field_type: "Phone", placeholder: "+251 9XX XXX XXX" },
  { label: "Date", field_type: "Date", placeholder: "" },
  { label: "Time", field_type: "Time", placeholder: "" },
];

function FieldPreview({ field }: { field: any }) {
  const options: string[] = Array.isArray(field.options) ? field.options : [];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#2B2B2B]">{field.label}</label>
        {field.required && (
          <span className="rounded-full bg-[#F25F5C]/10 px-2 py-0.5 text-xs font-medium text-[#F25F5C]">
            Required
          </span>
        )}
      </div>

      {(field.field_type === "Text" ||
        field.field_type === "Number" ||
        field.field_type === "Email" ||
        field.field_type === "Phone") && (
        <div className="rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3 text-sm text-[#B8ADA8]">
          {field.placeholder || "..."}
        </div>
      )}

      {field.field_type === "Textarea" && (
        <div className="h-20 rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3 text-sm text-[#B8ADA8]">
          {field.placeholder || "..."}
        </div>
      )}

      {field.field_type === "Date" && (
        <div className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3 text-sm text-[#B8ADA8]">
          <span>Select a date</span>
          <IconCalendar className="h-4 w-4 text-[#707070]" />
        </div>
      )}

      {field.field_type === "Time" && (
        <div className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3 text-sm text-[#B8ADA8]">
          <span>Select a time</span>
          <IconClock className="h-4 w-4 text-[#707070]" />
        </div>
      )}

      {field.field_type === "Select" && (
        <div className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3 text-sm text-[#B8ADA8]">
          <span>{options[0] || "Choose an option"}</span>
          <IconChevronDown className="h-4 w-4 text-[#707070]" />
        </div>
      )}

      {(field.field_type === "Radio" || field.field_type === "Checkbox") && (
        <div className="flex flex-wrap gap-2">
          {options.length > 0 ? (
            options.map((opt) => (
              <span
                key={opt}
                className="rounded-full border border-[#F0E3DE] bg-[#FFF9F7] px-3 py-1.5 text-sm text-[#707070]"
              >
                {opt}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#B8ADA8]">No options set</span>
          )}
        </div>
      )}
    </div>
  );
}

interface FieldListProps {
  services?: any[];
}

export default function FieldList({ services = [] }: FieldListProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  async function loadFields() {
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
        .from("appointment_fields")
        .select("*")
        .eq("business_id", (business as any).id);

      setFields(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
    if (services.length === 0) {
      setSelectedServiceId(null);
    }
  }, [services, selectedServiceId]);

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
    loadFields();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2B2B2B]">Booking Form</h2>
          <p className="mt-1 text-sm text-[#707070]">
            What customers fill in when they book with you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-[16px] bg-[#F25F5C] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98]"
        >
          <IconPlus />
          Add Field
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#F0E3DE] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F25F5C]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9A441]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7A263A]" />
          </div>
          <div className="ml-2 flex-1 truncate rounded-full border border-[#F0E3DE] bg-white px-3 py-1 text-xs text-[#707070]">
            seba.com/legendbarber/book
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[#707070]">
              Service
            </p>

            {services.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#F0E3DE] px-4 py-3 text-sm text-[#707070]">
                Add a service above so customers can pick one here.
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {services.map((service) => {
                  const active = selectedServiceId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`shrink-0 rounded-[16px] border px-4 py-2.5 text-left transition-all duration-200 ${
                        active
                          ? "border-[#F25F5C] bg-[#F25F5C]/10"
                          : "border-[#F0E3DE] bg-[#FFF9F7] hover:border-[#D9A441]"
                      }`}
                    >
                      <p className={`text-sm font-medium ${active ? "text-[#F25F5C]" : "text-[#2B2B2B]"}`}>
                        {service.name}
                      </p>
                      <p className="text-xs text-[#707070]">
                        {service.duration} min · {service.price} ETB
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {DEFAULT_FIELDS.map((field) => (
              <FieldPreview key={field.label} field={{ ...field, required: true }} />
            ))}

            {loading && (
              <div className="space-y-4 pt-1">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-[16px] bg-[#FFF9F7]" />
                ))}
              </div>
            )}

            {!loading &&
              fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <FieldPreview field={field} />
                </motion.div>
              ))}
          </div>

          {!loading && fields.length === 0 && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#F0E3DE] py-4 text-sm font-medium text-[#707070] transition-colors duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7] hover:text-[#2B2B2B]"
            >
              <IconPlus className="h-4 w-4" />
              Add a custom field
            </button>
          )}

          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[16px] bg-[#7A263A] px-6 py-3.5 text-sm font-semibold text-white opacity-90"
          >
            Continue
            <IconArrowRight />
          </button>
        </div>
      </div>

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
                <h3 className="text-lg font-semibold text-[#2B2B2B]">Add Field</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#707070] transition-colors duration-200 hover:bg-[#FFF9F7] hover:text-[#2B2B2B]"
                  aria-label="Close"
                >
                  <IconX />
                </button>
              </div>

              <FieldForm onSaved={handleSaved} onCancel={() => setShowModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}