import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import type { Customer, CustomerFormInput } from "../types/customer";
import { customerService } from "../services/customer.service";

type Props = {
  open: boolean;
  editingCustomer: Customer | null;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
};

const EMPTY: CustomerFormInput = {
  name: "",
  phone: "",
  email: "",
  tags: [],
  referral_source: "",
  notes: "",
};

export default function CustomerFormModal({ open, editingCustomer, onClose, onSaved }: Props) {
  const [form, setForm] = useState<CustomerFormInput>(
    editingCustomer
      ? {
          name: editingCustomer.name,
          phone: editingCustomer.phone ?? "",
          email: editingCustomer.email ?? "",
          tags: editingCustomer.tags,
          referral_source: editingCustomer.referral_source ?? "",
          notes: "",
        }
      : EMPTY
  );
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput("");
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error("Add a phone or an email so we can match this customer correctly");
      return;
    }

    setSaving(true);
    try {
      const saved = editingCustomer
        ? await customerService.updateCustomer(editingCustomer.id, form)
        : await customerService.createCustomer(form);
      toast.success(editingCustomer ? "Customer updated" : "Customer added");
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error("Save customer error:", err);
      toast.error("Failed to save customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{editingCustomer ? "Edit customer" : "Add customer"}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="+2519..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Phone or email is how we recognize this person if they order or book again - add at
            least one.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Referral source</label>
            <input
              value={form.referral_source}
              onChange={(e) => setForm({ ...form, referral_source: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. Instagram, friend referral, walk-in"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Tags</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs"
                >
                  {tag}
                  <button
                    onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                placeholder="Add a tag and press Enter"
              />
              <button onClick={addTag} className="rounded-lg border px-3 py-2 text-sm">
                Add
              </button>
            </div>
          </div>

          {!editingCustomer && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Note (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
