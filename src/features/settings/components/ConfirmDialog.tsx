import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="flex gap-3">
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                danger ? "bg-red-100" : "bg-gray-100",
              ].join(" ")}
            >
              <AlertTriangle
                size={20}
                className={danger ? "text-red-600" : "text-gray-600"}
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                {title}
              </h2>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-gray-800",
            ].join(" ")}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}