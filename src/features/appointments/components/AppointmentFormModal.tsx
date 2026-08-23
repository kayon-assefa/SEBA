// src/features/Appointments/components/AppointmentFormModal.tsx
//
// Multi-step booking wizard: Customer -> Services & Staff -> Date & Time
// (live availability) -> Payment & Notes -> Review.

import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, AlertTriangle, Lock } from "lucide-react";

import type {
  Appointment,
  CreateAppointment,
  PaymentStatus,
  RecurrenceFrequency,
} from "../types/appointment";
import { BookingConflictError } from "../types/appointment";
import { customerService } from "../services/customer.service";
import { computeEndTime, findConflicts, suggestAvailableSlots } from "../lib/availability";
import type { Customer } from "../types/customer";

type Props = {
  open: boolean;
  saving: boolean;
  dark: boolean;
  appointments: Appointment[]; // currently loaded list, used for instant local availability
  editing: Appointment | null;
  onClose: () => void;
  onSubmit: (data: CreateAppointment, editingId: string | null) => Promise<void>;
};

type WizardForm = {
  customer: string;
  phone: string;
  customerId: string | null;
  services: string[];
  staffMembers: string[];
  duration: number;
  date: string;
  time: string;
  price: number;
  paymentStatus: PaymentStatus;
  depositAmount: number;
  notes: string;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceOccurrences: number;
};

const STEPS = ["Customer", "Service & Staff", "Date & Time", "Payment & Notes", "Review"];

const DURATIONS = [15, 30, 45, 60, 90, 120];

function emptyForm(): WizardForm {
  return {
    customer: "",
    phone: "",
    customerId: null,
    services: [],
    staffMembers: [],
    duration: 30,
    date: "",
    time: "",
    price: 0,
    paymentStatus: "Unpaid",
    depositAmount: 0,
    notes: "",
    recurrenceFrequency: "none",
    recurrenceOccurrences: 2,
  };
}

function fromAppointment(a: Appointment): WizardForm {
  return {
    customer: a.customer,
    phone: a.phone || "",
    customerId: a.customer_id,
    services: a.services?.length ? a.services : a.service ? [a.service] : [],
    staffMembers: a.staff_members?.length ? a.staff_members : a.staff ? [a.staff] : [],
    duration: a.duration || 30,
    date: a.date,
    time: a.time,
    price: a.price,
    paymentStatus: a.payment_status || "Unpaid",
    depositAmount: a.deposit_amount || 0,
    notes: a.notes || "",
    recurrenceFrequency: "none",
    recurrenceOccurrences: 2,
  };
}

export default function AppointmentFormModal({ open, saving, dark, appointments, editing, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(emptyForm());
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [conflict, setConflict] = useState<{ conflicts: Appointment[]; suggestions: string[] } | null>(null);

  useEffect(() => {
    if (open) {
      setForm(editing ? fromAppointment(editing) : emptyForm());
      setStep(0);
      setConflict(null);
    }
  }, [open, editing]);

  useEffect(() => {
    if (!form.customer.trim() || form.customer.length < 2) {
      setCustomerResults([]);
      return;
    }
    const handle = setTimeout(() => {
      customerService.searchCustomers(form.customer).then(setCustomerResults).catch(() => setCustomerResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [form.customer]);

  const localConflicts = useMemo(() => {
    if (!form.date || !form.time || !form.staffMembers.length) return [];
    return findConflicts({
      date: form.date,
      time: form.time,
      duration: form.duration,
      staffMembers: form.staffMembers,
      appointments,
      excludeId: editing?.id ?? null,
    });
  }, [form.date, form.time, form.duration, form.staffMembers, appointments, editing]);

  const localSuggestions = useMemo(() => {
    if (!form.date || !form.staffMembers.length) return [];
    return suggestAvailableSlots({
      date: form.date,
      duration: form.duration,
      staffMembers: form.staffMembers,
      appointments,
      excludeId: editing?.id ?? null,
    });
  }, [form.date, form.duration, form.staffMembers, appointments, editing]);

  if (!open) return null;

  function update<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return form.customer.trim().length > 0;
    if (step === 1) return form.services.length > 0 && form.staffMembers.length > 0;
    if (step === 2) return !!form.date && !!form.time;
    return true;
  }

  async function handleSubmit(forceBook = false) {
    setConflict(null);

    const payload: CreateAppointment = {
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      services: form.services,
      staffMembers: form.staffMembers,
      date: form.date,
      time: form.time,
      duration: form.duration,
      price: Number(form.price) || 0,
      paymentStatus: form.paymentStatus,
      depositAmount: Number(form.depositAmount) || 0,
      notes: form.notes.trim(),
      recurrence:
        form.recurrenceFrequency !== "none"
          ? { frequency: form.recurrenceFrequency, occurrences: form.recurrenceOccurrences }
          : null,
      forceBook,
      status: forceBook && !editing ? "Waitlisted" : undefined,
    };

    try {
      await onSubmit(payload, editing?.id ?? null);
    } catch (err) {
      if (err instanceof BookingConflictError) {
        setConflict({ conflicts: err.conflicts, suggestions: err.suggestions });
      } else {
        throw err;
      }
    }
  }

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10 ${
    dark ? "border-white/10 bg-[#242424] text-gray-100 placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
  }`;
  const labelClass = `mb-1.5 block text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`;
  const panelClass = dark ? "bg-[#1c1c1c]" : "bg-white";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className={`flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl ${panelClass}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-5 ${dark ? "border-white/10" : "border-gray-100"}`}>
          <div>
            <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>
              {editing ? "Edit Appointment" : "New Appointment"}
            </h2>
            <p className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className={`rounded-lg p-2 ${dark ? "text-gray-400 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-4">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#F25F5C]" : dark ? "bg-white/10" : "bg-gray-100"}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Customer name *</label>
                <input value={form.customer} onChange={(e) => update("customer", e.target.value)} placeholder="e.g. Sara Ahmed" className={inputClass} />
                {customerResults.length > 0 && (
                  <div className={`mt-2 overflow-hidden rounded-xl border ${dark ? "border-white/10" : "border-gray-200"}`}>
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          update("customer", c.name);
                          update("phone", c.phone || "");
                          update("customerId", c.id);
                          setCustomerResults([]);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${dark ? "text-gray-200 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className={dark ? "text-gray-500" : "text-gray-400"}>{c.phone} · {c.total_visits} visits</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+251 91 123 4567" className={inputClass} />
                <p className={`mt-1.5 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  Used to match returning customers and add them to your Customers list automatically.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <ChipInput label="Services *" placeholder="Type a service and press Enter (e.g. Haircut)" values={form.services} onChange={(v) => update("services", v)} dark={dark} />
              <ChipInput label="Staff *" placeholder="Type a staff name and press Enter" values={form.staffMembers} onChange={(v) => update("staffMembers", v)} dark={dark} />
              <div>
                <label className={labelClass}>Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => update("duration", d)}
                      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                        form.duration === d
                          ? "bg-[#F25F5C] text-white"
                          : dark
                          ? "bg-white/5 text-gray-300 hover:bg-white/10"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Time *</label>
                  <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className={inputClass} />
                </div>
              </div>

              {form.date && form.time && (
                <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  Ends around <strong>{computeEndTime(form.time, form.duration)}</strong>
                </p>
              )}

              {form.date && form.time && localConflicts.length > 0 && (
                <div className={`flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-800`}>
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">That time is already taken</p>
                    <p className="mt-0.5">
                      {localConflicts[0].staff_members?.join(", ") || localConflicts[0].staff} is booked with {localConflicts[0].customer} then.
                      {localSuggestions.length > 0 ? " Here are the next open slots:" : " No open slots left that day for this staff."}
                    </p>
                    {localSuggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {localSuggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => update("time", s)}
                            className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Repeats</label>
                <select value={form.recurrenceFrequency} onChange={(e) => update("recurrenceFrequency", e.target.value as RecurrenceFrequency)} className={inputClass}>
                  <option value="none">Does not repeat</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {form.recurrenceFrequency !== "none" && (
                <div>
                  <label className={labelClass}>Number of appointments</label>
                  <input
                    type="number"
                    min={2}
                    max={26}
                    value={form.recurrenceOccurrences}
                    onChange={(e) => update("recurrenceOccurrences", Math.max(2, Number(e.target.value) || 2))}
                    className={inputClass}
                  />
                  <p className={`mt-1.5 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                    Each one is checked for conflicts individually when you save.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price (ETB)</label>
                  <input type="number" value={String(form.price)} onChange={(e) => update("price", Number(e.target.value) || 0)} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Payment status</label>
                  <select value={form.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value as PaymentStatus)} className={inputClass}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Paid">Paid in full</option>
                  </select>
                </div>
              </div>

              {form.paymentStatus === "Deposit" && (
                <div>
                  <label className={labelClass}>Deposit amount (ETB)</label>
                  <input type="number" value={String(form.depositAmount)} onChange={(e) => update("depositAmount", Number(e.target.value) || 0)} className={inputClass} />
                </div>
              )}

              <div>
                <label className={`${labelClass} flex items-center gap-2`}>
                  Discount code
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    <Lock size={10} /> Coming soon
                  </span>
                </label>
                <input disabled placeholder="Coupons are coming in a future update" className={`${inputClass} cursor-not-allowed opacity-60`} />
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} placeholder="Optional notes about this appointment..." className={`${inputClass} resize-none`} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <SummaryRow dark={dark} label="Customer" value={`${form.customer}${form.phone ? " · " + form.phone : ""}`} />
              <SummaryRow dark={dark} label="Services" value={form.services.join(", ") || "-"} />
              <SummaryRow dark={dark} label="Staff" value={form.staffMembers.join(", ") || "-"} />
              <SummaryRow dark={dark} label="When" value={`${form.date} at ${form.time} (${form.duration} min)`} />
              {form.recurrenceFrequency !== "none" && (
                <SummaryRow dark={dark} label="Repeats" value={`${form.recurrenceFrequency}, ${form.recurrenceOccurrences} bookings`} />
              )}
              <SummaryRow dark={dark} label="Price" value={`${form.price} ETB · ${form.paymentStatus}`} />
              {form.notes && <SummaryRow dark={dark} label="Notes" value={form.notes} />}

              {conflict && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">This slot just got taken</p>
                  <p className="mt-1">
                    {conflict.conflicts[0]?.customer} is already booked with this staff member at this time.
                  </p>
                  {conflict.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {conflict.suggestions.map((s) => (
                        <button key={s} type="button" onClick={() => { update("time", s); setConflict(null); }} className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-red-100">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    className="mt-3 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                  >
                    Add to waitlist instead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between border-t px-6 py-4 ${dark ? "border-white/10" : "border-gray-100"}`}>
          <button
            type="button"
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            disabled={saving}
            className={`flex items-center gap-1 rounded-xl border px-4 py-2.5 text-sm font-medium ${dark ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 rounded-xl bg-[#F25F5C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e14e4b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 rounded-xl bg-[#F25F5C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e14e4b] disabled:opacity-50"
            >
              <Check size={16} /> {saving ? "Saving..." : editing ? "Save Changes" : "Book Appointment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, dark }: { label: string; value: string; dark: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b pb-3 last:border-0 ${dark ? "border-white/10" : "border-gray-100"}`}>
      <span className={`text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}>{label}</span>
      <span className={`text-right text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function ChipInput({
  label,
  placeholder,
  values,
  onChange,
  dark,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  dark: boolean;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <label className={`mb-1.5 block text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>{label}</label>
      <div className={`flex flex-wrap gap-2 rounded-xl border p-2.5 ${dark ? "border-white/10 bg-[#242424]" : "border-gray-200 bg-white"}`}>
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1.5 rounded-lg bg-[#F25F5C]/10 px-2.5 py-1 text-xs font-semibold text-[#F25F5C]">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : "Add another..."}
          className={`min-w-[140px] flex-1 bg-transparent text-sm outline-none ${dark ? "text-gray-100 placeholder:text-gray-500" : "text-gray-900"}`}
        />
      </div>
    </div>
  );
}
