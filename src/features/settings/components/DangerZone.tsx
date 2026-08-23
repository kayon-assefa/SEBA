import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import ConfirmDialog from "./ConfirmDialog";

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  onAction: () => Promise<void> | void;
};

export default function DangerZone({
  title = "Danger Zone",
  description = "These actions can affect your business and public page.",
  actionLabel = "Continue",
  confirmTitle = "Are you sure?",
  confirmDescription = "This action cannot be easily undone.",
  onAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onAction();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle
            size={22}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="flex-1">
            <h2 className="font-semibold text-red-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {description}
            </p>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={actionLabel}
        danger
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!loading) setOpen(false);
        }}
      />
    </>
  );
}