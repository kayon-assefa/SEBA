// File: src/features/onboarding/components/AppointmentBuilder/ServiceForm.tsx
import { useState } from "react";
import toast from "react-hot-toast";
import { onboardingService } from "../../services/onboarding.service";

const inputClass =
  "w-full rounded-[16px] border border-[#F0E3DE] bg-white px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none transition-all duration-200 focus:border-[#F25F5C] focus:ring-4 focus:ring-[#F25F5C]/10";

interface ServiceFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ onSaved, onCancel }: ServiceFormProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  async function saveService() {
    if (!name.trim()) {
      toast.error("Give the service a name first");
      return;
    }

    setSaving(true);
    try {
      await onboardingService.createService({ name, duration, price });

      toast.success("Service Added");

      setName("");
      setDuration(30);
      setPrice(0);

      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Service Name</label>
        <input
          className={inputClass}
          placeholder="Haircut"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2B2B2B]">Duration (min)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="30"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2B2B2B]">Price (ETB)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="150"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
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
          onClick={saveService}
          disabled={saving}
          className="flex-1 rounded-[16px] bg-[#F25F5C] px-6 py-3 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {saving ? "Adding..." : "Add Service"}
        </button>
      </div>
    </div>
  );
}