import SettingsButton from "./SettingsButton";

type Props = {
  dirty?: boolean;
  saving?: boolean;
  onSave: () => void;
  onCancel?: () => void;
};

export default function SettingsSaveBar({
  dirty = true,
  saving = false,
  onSave,
  onCancel,
}: Props) {
  if (!dirty) return null;

  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#FFFDF8] p-4 shadow-lg">
      <p className="text-sm text-gray-500">
        You have unsaved changes.
      </p>

      <div className="flex gap-2">
        {onCancel && (
          <SettingsButton
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onCancel}
          >
            Cancel
          </SettingsButton>
        )}

        <SettingsButton
          type="button"
          loading={saving}
          onClick={onSave}
        >
          Save changes
        </SettingsButton>
      </div>
    </div>
  );
}