import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { SettingsCard, SettingsButton, SettingsInput } from "../components";
import { dangerZoneService } from "../services/danger-zone.service";
import { securitySettingsService } from "../services/security-settings.service";

export default function DangerZoneSection() {
  const [state, setState] = useState<any>(null);
  const [confirmation, setConfirmation] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [pending, setPending] = useState<(() => Promise<any>) | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    dangerZoneService.getState().then(setState).catch((e) => setMsg(e.message));
  }, []);

  const protectedAction = (action: () => Promise<any>) => {
    setPending(() => action);
    setShowPrompt(true);
    setMsg("");
  };

  const confirmAction = async () => {
    if (!pending) return;
    setVerifying(true);
    setMsg("");
    try {
      const valid = await securitySettingsService.verifyDangerZonePasskey();
      if (!valid) throw new Error("Passkey verification failed.");
      const result = await pending();
      if (result) setState(result);
      setShowPrompt(false);
      setPending(null);
      setMsg("Action completed.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {showPrompt && (
        <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">Confirm with your passkey</h3>
          <p className="mt-1 text-sm text-gray-500">
            Use Face ID, Touch ID, or your device's screen lock to confirm this action.
          </p>
          <div className="mt-4 flex gap-3">
            <SettingsButton onClick={confirmAction} loading={verifying}>
              <Fingerprint size={16} />
              Verify &amp; confirm
            </SettingsButton>
            <SettingsButton
              variant="secondary"
              onClick={() => {
                setShowPrompt(false);
                setPending(null);
              }}
            >
              Cancel
            </SettingsButton>
          </div>
        </div>
      )}

      <SettingsCard title="Pause business" description="Temporarily stop appointments and orders.">
        <SettingsButton variant="secondary" onClick={() => protectedAction(dangerZoneService.pauseBusiness)}>
          Pause business
        </SettingsButton>
        {state && (
          <p className="mt-3 text-sm text-gray-500">
            Appointments: {state.appointments_paused ? "paused" : "active"} · Orders:{" "}
            {state.orders_paused ? "paused" : "active"}
          </p>
        )}
      </SettingsCard>

      <SettingsCard title="Resume business">
        <SettingsButton variant="secondary" onClick={() => protectedAction(dangerZoneService.resumeBusiness)}>
          Resume business
        </SettingsButton>
      </SettingsCard>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-900">Delete business</h2>
        <p className="mt-2 text-sm text-red-700">Enter DELETE BUSINESS, then confirm with your passkey.</p>
        <div className="mt-4 max-w-md">
          <SettingsInput value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="DELETE BUSINESS" />
        </div>
        <div className="mt-4">
          <SettingsButton
            variant="danger"
            disabled={confirmation !== "DELETE BUSINESS"}
            onClick={() => protectedAction(dangerZoneService.deleteBusiness)}
          >
            Delete business
          </SettingsButton>
        </div>
      </div>

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
