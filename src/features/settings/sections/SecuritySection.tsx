import { useEffect, useState } from "react";
import { Fingerprint, KeyRound, LogOut, Mail, ShieldAlert } from "lucide-react";
import { SettingsCard, SettingsInput, SettingsButton } from "../components";
import { securitySettingsService } from "../services/security-settings.service";
import { isPlatformAuthenticatorAvailable } from "../services/webauthn";

export default function SecuritySection() {
  const [email, setEmail] = useState("");
  const [hasPasskey, setHasPasskey] = useState(false);
  const [platformAvailable, setPlatformAvailable] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      securitySettingsService.getUser(),
      securitySettingsService.hasPasskey(),
      isPlatformAuthenticatorAvailable(),
    ])
      .then(([user, enabled, platform]) => {
        setEmail(user.email ?? "");
        setHasPasskey(enabled);
        setPlatformAvailable(platform);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  const changeEmail = async () => {
    setBusy("email");
    setMsg("");
    try {
      await securitySettingsService.changeEmail(email);
      setMsg("Confirmation email sent to your new address.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to change email");
    } finally {
      setBusy(null);
    }
  };

  const sendPasswordReset = async () => {
    setBusy("password");
    setMsg("");
    try {
      await securitySettingsService.sendPasswordResetEmail();
      setMsg("Password reset link sent to your email.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to send reset email");
    } finally {
      setBusy(null);
    }
  };

  const enablePasskey = async () => {
    setBusy("passkey");
    setMsg("");
    try {
      await securitySettingsService.setPasskey();
      setHasPasskey(true);
      setMsg("Passkey enabled with Face ID / Touch ID.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Passkey setup was cancelled or failed");
    } finally {
      setBusy(null);
    }
  };

  const removePasskey = async () => {
    setBusy("passkey");
    setMsg("");
    try {
      await securitySettingsService.clearPasskey();
      setHasPasskey(false);
      setMsg("Passkey removed.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to remove passkey");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bug fix: security used to be spread across several cards and showed a raw
          password field. It's now a single card, nothing sensitive is ever shown,
          and email/password changes both go out via email links. */}
      <SettingsCard title="Security" description="Manage how you sign in and keep your account safe.">
        <div className="divide-y divide-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Account email</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsInput
                aria-label="New email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-[220px]"
              />
              <SettingsButton variant="secondary" loading={busy === "email"} onClick={changeEmail}>
                Change email
              </SettingsButton>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-3">
              <KeyRound size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Password</p>
                <p className="text-sm text-gray-500">We'll email you a secure link — no typing a new one here.</p>
              </div>
            </div>
            <SettingsButton variant="secondary" loading={busy === "password"} onClick={sendPasswordReset}>
              Change password
            </SettingsButton>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-3">
              <Fingerprint size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Passkey</p>
                <p className="text-sm text-gray-500">
                  {hasPasskey
                    ? "Face ID / Touch ID is set up for danger-zone actions."
                    : platformAvailable
                    ? "Set up Face ID / Touch ID / Windows Hello."
                    : "This device doesn't support a platform passkey."}
                </p>
              </div>
            </div>
            {hasPasskey ? (
              <SettingsButton variant="secondary" loading={busy === "passkey"} onClick={removePasskey}>
                Remove
              </SettingsButton>
            ) : (
              <SettingsButton loading={busy === "passkey"} disabled={!platformAvailable} onClick={enablePasskey}>
                Set up
              </SettingsButton>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Danger zone</p>
                <p className="text-sm text-gray-500">Pause, resume, or delete your business.</p>
              </div>
            </div>
            <SettingsButton variant="secondary" onClick={() => (window.location.href = "/settings/danger")}>
              Open
            </SettingsButton>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-4 last:pb-0">
            <div className="flex items-start gap-3">
              <LogOut size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Sessions</p>
                <p className="text-sm text-gray-500">Sign out of this device or everywhere.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <SettingsButton variant="secondary" onClick={() => securitySettingsService.logoutCurrentDevice()}>
                This device
              </SettingsButton>
              <SettingsButton variant="danger" onClick={() => securitySettingsService.logoutEverywhere()}>
                Everywhere
              </SettingsButton>
            </div>
          </div>
        </div>
      </SettingsCard>

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
