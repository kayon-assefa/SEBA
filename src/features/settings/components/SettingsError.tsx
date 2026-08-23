import { AlertCircle, RefreshCw } from "lucide-react";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function SettingsError({
  message = "Something went wrong while loading settings.",
  onRetry,
}: Props) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="flex gap-4">
        <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

        <div className="flex-1">
          <h3 className="font-semibold text-red-900">
            Unable to load settings
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}