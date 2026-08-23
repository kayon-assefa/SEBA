import { useEffect, useState } from "react";
import {
  Copy,
  MessageCircle,
  Phone,
  Pin,
  PinOff,
  Plus,
  ShieldAlert,
  ShieldOff,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Customer, TimelineEntry } from "../types/customer";
import {
  customerService,
  computeLifetimeValue,
  computeVisitFrequency,
  suggestTags,
} from "../services/customer.service";
import CustomerAvatar from "./CustomerAvatar";

type Props = {
  customer: Customer;
  onUpdated: (customer: Customer) => void;
};

function copy(value: string, label: string) {
  navigator.clipboard.writeText(value);
  toast.success(`${label} copied`);
}

export default function CustomerProfile({ customer, onUpdated }: Props) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [blacklistReason, setBlacklistReason] = useState("");
  const [showBlacklistInput, setShowBlacklistInput] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingTimeline(true);
    customerService
      .getCustomerTimeline(customer)
      .then((entries) => !cancelled && setTimeline(entries))
      .catch((err) => console.error("Timeline load error:", err))
      .finally(() => !cancelled && setLoadingTimeline(false));
    return () => {
      cancelled = true;
    };
  }, [customer.id]);

  const ltv = computeLifetimeValue(customer);
  const frequency = computeVisitFrequency(customer);
  const suggestedTags = suggestTags(customer);

  async function handleTogglePin() {
    try {
      await customerService.togglePinned(customer.id, !customer.pinned);
      onUpdated({ ...customer, pinned: !customer.pinned });
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    try {
      const updated = await customerService.addNote(customer.id, noteText.trim());
      onUpdated(updated);
      setNoteText("");
    } catch {
      toast.error("Failed to add note");
    }
  }

  async function handleLogContact() {
    try {
      await customerService.logContact(customer.id);
      onUpdated({ ...customer, last_contacted: new Date().toISOString() });
      toast.success("Contact logged");
    } catch {
      toast.error("Failed to log contact");
    }
  }

  async function handleBlacklistToggle() {
    if (customer.blacklisted) {
      try {
        await customerService.setBlacklist(customer.id, false, null);
        onUpdated({ ...customer, blacklisted: false, blacklist_reason: null });
        toast.success("Removed from blacklist");
      } catch {
        toast.error("Failed to update");
      }
      return;
    }
    setShowBlacklistInput(true);
  }

  async function confirmBlacklist() {
    try {
      await customerService.setBlacklist(customer.id, true, blacklistReason || null);
      onUpdated({ ...customer, blacklisted: true, blacklist_reason: blacklistReason || null });
      setShowBlacklistInput(false);
      setBlacklistReason("");
      toast.success("Customer flagged");
    } catch {
      toast.error("Failed to update");
    }
  }

  async function acceptSuggestedTag(tag: string) {
    try {
      const updated = await customerService.updateCustomer(customer.id, {
        tags: [...customer.tags, tag],
      });
      onUpdated(updated);
    } catch {
      toast.error("Failed to add tag");
    }
  }

  return (
    <div className="space-y-5 p-5">
      {customer.blacklisted && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <ShieldAlert size={16} />
          Flagged{customer.blacklist_reason ? `: ${customer.blacklist_reason}` : ""}
        </div>
      )}

      <div className="flex items-center gap-3">
        <CustomerAvatar name={customer.name} size="lg" />
        <div className="flex-1">
          <h2 className="text-lg font-bold">{customer.name}</h2>
          <p className="text-xs text-gray-400">
            Customer since {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
        <button onClick={handleTogglePin} title={customer.pinned ? "Unpin" : "Pin"}>
          {customer.pinned ? (
            <Pin size={18} className="fill-amber-500 text-amber-500" />
          ) : (
            <PinOff size={18} className="text-gray-300" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {customer.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {tag}
          </span>
        ))}
        {suggestedTags.map((tag) => (
          <button
            key={tag}
            onClick={() => acceptSuggestedTag(tag)}
            className="flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50"
          >
            <Plus size={10} /> {tag}?
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-center">
        <div>
          <p className="text-lg font-bold">{ltv.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500">Lifetime spend (birr)</p>
        </div>
        <div>
          <p className="text-lg font-bold">{customer.total_visits + customer.total_orders}</p>
          <p className="text-[11px] text-gray-500">Total touches</p>
        </div>
        <div>
          <p className="text-lg font-bold">{frequency}</p>
          <p className="text-[11px] text-gray-500">Visit pattern</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Phone</span>
          <div className="flex items-center gap-2">
            <span>{customer.phone || "—"}</span>
            {customer.phone && (
              <>
                <button onClick={() => copy(customer.phone!, "Phone")} title="Copy">
                  <Copy size={13} className="text-gray-400" />
                </button>
                <a href={`tel:${customer.phone}`} title="Call">
                  <Phone size={13} className="text-gray-400" />
                </a>
                <a
                  href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp"
                >
                  <MessageCircle size={13} className="text-gray-400" />
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Email</span>
          <div className="flex items-center gap-2">
            <span>{customer.email || "—"}</span>
            {customer.email && (
              <button onClick={() => copy(customer.email!, "Email")} title="Copy">
                <Copy size={13} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Referral</span>
          <span>{customer.referral_source || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Last contacted</span>
          <div className="flex items-center gap-2">
            <span>
              {customer.last_contacted
                ? new Date(customer.last_contacted).toLocaleDateString()
                : "Never"}
            </span>
            <button onClick={handleLogContact} className="text-xs text-gray-500 underline">
              Log contact
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Timeline</p>
        {loadingTimeline ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-gray-400">No orders or appointments yet.</p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {timeline.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-xs text-gray-400">
                    {entry.type === "order" ? "Order" : "Appointment"} ·{" "}
                    {new Date(entry.date).toLocaleDateString()} · {entry.status}
                  </p>
                </div>
                {entry.amount != null && (
                  <span className="text-xs font-medium">{entry.amount.toLocaleString()} birr</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Notes</p>
        <div className="mb-2 flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button onClick={handleAddNote} className="rounded-lg border px-3 py-2 text-sm">
            Add
          </button>
        </div>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {customer.notes.length === 0 && <p className="text-sm text-gray-400">No notes yet.</p>}
          {customer.notes.map((note) => (
            <div key={note.id} className="rounded-lg bg-gray-50 p-2.5 text-sm">
              <p>{note.text}</p>
              <p className="mt-1 text-[11px] text-gray-400">
                {note.author} · {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        {showBlacklistInput ? (
          <div className="space-y-2">
            <input
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={confirmBlacklist}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
              >
                Confirm flag
              </button>
              <button
                onClick={() => setShowBlacklistInput(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleBlacklistToggle}
            className={`flex items-center gap-1.5 text-sm ${
              customer.blacklisted ? "text-gray-600" : "text-red-600"
            }`}
          >
            {customer.blacklisted ? (
              <>
                <ShieldOff size={14} /> Remove flag
              </>
            ) : (
              <>
                <ShieldAlert size={14} /> Flag this customer
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
