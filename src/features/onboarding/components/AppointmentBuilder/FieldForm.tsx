// File: src/features/onboarding/components/AppointmentBuilder/FieldForm.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { onboardingService } from "../../services/onboarding.service";

function IconType({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 6h14M12 6v12" />
    </svg>
  );
}
function IconHash({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" />
    </svg>
  );
}
function IconMail({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
function IconPhone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 9 9 0 0 0 2.8.45 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1 9 9 0 0 0 .45 2.8 1 1 0 0 1-.25 1z" />
    </svg>
  );
}
function IconAlignLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 6h16M4 12h10M4 18h13" />
    </svg>
  );
}
function IconList({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconCircleDot({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconCheckSquare({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8 12 3 3 5-6" />
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
function IconClockField({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const FIELD_TYPES = [
  { type: "Text", Icon: IconType },
  { type: "Number", Icon: IconHash },
  { type: "Email", Icon: IconMail },
  { type: "Phone", Icon: IconPhone },
  { type: "Textarea", Icon: IconAlignLeft },
  { type: "Select", Icon: IconList },
  { type: "Radio", Icon: IconCircleDot },
  { type: "Checkbox", Icon: IconCheckSquare },
  { type: "Date", Icon: IconCalendar },
  { type: "Time", Icon: IconClockField },
];

const inputClass =
  "w-full rounded-[16px] border border-[#F0E3DE] bg-white px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none transition-all duration-200 focus:border-[#F25F5C] focus:ring-4 focus:ring-[#F25F5C]/10";

interface FieldFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function FieldForm({ onSaved, onCancel }: FieldFormProps) {
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("Text");
  const [placeholder, setPlaceholder] = useState("");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [saving, setSaving] = useState(false);

  const needsOptions =
    fieldType === "Select" || fieldType === "Radio" || fieldType === "Checkbox";

  async function saveField() {
    if (!label.trim()) {
      toast.error("Give the field a label first");
      return;
    }

    setSaving(true);
    try {
      await onboardingService.createAppointmentField({
        label,
        field_type: fieldType,
        placeholder,
        required,
        options: needsOptions
          ? options
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : [],
      });

      toast.success("Field Added");

      setLabel("");
      setPlaceholder("");
      setOptions("");
      setRequired(false);
      setFieldType("Text");

      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Field Label</label>
        <input
          className={inputClass}
          placeholder="e.g. Preferred Barber"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Field Type</label>
        <div className="grid grid-cols-5 gap-2">
          {FIELD_TYPES.map(({ type, Icon }) => {
            const active = fieldType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFieldType(type)}
                title={type}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-[16px] border px-2 py-3 transition-all duration-200 ${
                  active
                    ? "border-[#F25F5C] bg-[#F25F5C]/10 text-[#F25F5C]"
                    : "border-[#F0E3DE] bg-white text-[#707070] hover:border-[#D9A441] hover:text-[#2B2B2B]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-none">{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Placeholder</label>
        <input
          className={inputClass}
          placeholder="Shown inside the empty field"
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {needsOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="text-sm font-medium text-[#2B2B2B]">Options</label>
            <textarea
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Option1, Option2, Option3"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
            />
            <p className="text-xs text-[#707070]">Separate each option with a comma.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#2B2B2B]">Required</p>
          <p className="text-xs text-[#707070]">Customers must fill this in to book</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={required}
          onClick={() => setRequired(!required)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
            required ? "bg-[#F25F5C]" : "bg-[#F0E3DE]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              required ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[16px] border border-[#F0E3DE] bg-white px-6 py-3 font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7] active:scale-[0.98]"
        >
          Cancel
        </button>

        <button
          onClick={saveField}
          disabled={saving}
          className="flex-1 rounded-[16px] bg-[#F25F5C] px-6 py-3 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {saving ? "Adding..." : "Add Field"}
        </button>
      </div>
    </div>
  );
}