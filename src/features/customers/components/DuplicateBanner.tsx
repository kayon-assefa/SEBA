import { AlertTriangle } from "lucide-react";
import type { DuplicateCandidate } from "../types/customer";

type Props = {
  candidates: DuplicateCandidate[];
  onReview: (candidate: DuplicateCandidate) => void;
  onDismiss: () => void;
};

const REASON_LABEL: Record<DuplicateCandidate["reason"], string> = {
  same_phone: "same phone number",
  same_email: "same email",
  similar_name_no_contact_overlap: "same name, different contact info",
};

export default function DuplicateBanner({ candidates, onReview, onDismiss }: Props) {
  if (candidates.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
          <AlertTriangle size={16} />
          {candidates.length} possible duplicate{candidates.length > 1 ? "s" : ""} found
        </div>
        <button onClick={onDismiss} className="text-xs text-amber-700 underline">
          Dismiss
        </button>
      </div>
      <div className="space-y-1.5">
        {candidates.slice(0, 4).map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <span className="text-amber-900">
              <strong>{c.customerA.name}</strong> and <strong>{c.customerB.name}</strong> —{" "}
              {REASON_LABEL[c.reason]}
            </span>
            <button
              onClick={() => onReview(c)}
              className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700"
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
