import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleFill } from "react-bootstrap-icons";
import AuthShell from "../components/AuthShell";
import PasswordStrengthMeter, { usePasswordCheck } from "../components/PasswordStrengthMeter";
import { useLanguage } from "../context/Languagecontext";
import { registerPasskey } from "../services/auth.service";
import { supabase, callEdgeFunction } from "../../../lib/supabase";
import { seba } from "../design/tokens";

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [showMfaPrompt, setShowMfaPrompt] = useState(false);

  const passwordCheck = usePasswordCheck(password);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setValidSession(!!data?.session);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!passwordCheck.meetsMinimum) {
      setFormError(t("passwordTooWeak"));
      return;
    }
    if (password !== confirmPassword) {
      setFormError(t("passwordsDontMatch"));
      return;
    }
    if (passwordCheck.breached) {
      setFormError(t("passwordBreached"));
      return;
    }

    setFormError("");
    setLoading(true);

    try {
      // Item #13: reuse-check now happens server-side against properly
      // salted+hashed history in a private table (see
      // supabase/functions/password-history and the password_history
      // migration) — never a reversible client-side encoding stored in
      // user_metadata, which is what the previous version did (btoa() is
      // NOT a hash; it's plaintext with extra steps, and user_metadata is
      // readable by the client).
      const { allowed } = await callEdgeFunction<{ allowed: boolean }>(
        "password-history",
        { action: "check", password }
      );

      if (!allowed) {
        setFormError(t("passwordBreached")); // reused message slot: "choose a different one"
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Record the new password's hash server-side and, per item #16,
      // revoke every OTHER active session now that the password changed.
      await callEdgeFunction("password-history", { action: "record", password });
      await callEdgeFunction("login-guard", { action: "revoke-other-sessions" });

      setShowSuccess(true);
      window.setTimeout(() => {
        setShowSuccess(false);
        setShowPasskeyPrompt(true);
      }, 2200);
    } catch {
      setFormError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleEnrollPasskey() {
    try {
      await registerPasskey();
    } catch {
      // Cancelled or unsupported — fall through to the 2FA prompt either way.
    }
    setShowPasskeyPrompt(false);
    setShowMfaPrompt(true);
  }

  async function finishFlow() {
    setShowMfaPrompt(false);
    await supabase.auth.signOut();
    navigate("/login");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: seba.cream }}>
        <p className="font-medium" style={{ color: seba.red }}>
          {t("loadingApp")}
        </p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: seba.cream }}>
        <div className="max-w-sm space-y-5 text-center">
          <p className="text-lg font-semibold" style={{ color: seba.red }}>
            {t("invalidResetLink")}
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full rounded-xl px-6 py-3 font-medium text-white transition"
            style={{ background: seba.red }}
          >
            {t("forgotAgain")}
          </button>
          <button onClick={() => navigate("/login")} className="text-sm underline" style={{ color: seba.inkMuted }}>
            {t("backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthShell title={t("resetTitle")} subtitle={t("resetTagline")}>
        {showSuccess ? (
          <div className="seba-pop flex flex-col items-center py-10 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "#EAF7EF" }}>
              <CheckCircleFill className="h-10 w-10" style={{ color: seba.success }} />
            </div>
            <h2 className="mb-2 text-2xl font-black" style={{ color: seba.ink }}>
              {t("resetSuccessTitle")}
            </h2>
            <p className="text-sm" style={{ color: seba.inkMuted }}>
              {t("resetSuccessSub")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#FFF2F2", color: seba.red }}>
                {formError}
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
                {t("passwordLabel")}
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  maxLength={128}
                  className="w-full rounded-xl border bg-white p-4 pr-16 outline-none"
                  style={{ color: seba.ink, borderColor: seba.hairline }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold"
                  style={{ color: seba.inkMuted }}
                >
                  {showPassword ? t("hide") : t("show")}
                </button>
              </div>
              <PasswordStrengthMeter password={password} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
                {t("confirmPasswordLabel")}
              </span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                maxLength={128}
                className="w-full rounded-xl border bg-white p-4 outline-none"
                style={{
                  color: seba.ink,
                  borderColor: confirmPassword && confirmPassword !== password ? seba.danger : seba.hairline,
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={loading || !passwordCheck.meetsMinimum}
              className="w-full rounded-full py-4 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: seba.red }}
            >
              {loading ? t("updatingPassword") : t("updatePassword")}
            </button>

            <p className="text-center text-xs" style={{ color: seba.inkMuted }}>
              {t("afterUpdate")}
            </p>
          </form>
        )}
      </AuthShell>

      {showPasskeyPrompt && (
        <Modal>
          <h2 className="text-center text-xl font-bold" style={{ color: seba.ink }}>
            {t("passkeyPromptTitle")}
          </h2>
          <p className="text-center text-sm" style={{ color: seba.inkMuted }}>
            {t("passkeyPromptDesc")}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleEnrollPasskey} className="w-full rounded-xl py-3.5 font-semibold text-white" style={{ background: seba.red }}>
              {t("savePasskey")}
            </button>
            <button
              onClick={() => {
                setShowPasskeyPrompt(false);
                setShowMfaPrompt(true);
              }}
              className="w-full rounded-xl border py-3.5 font-medium"
              style={{ borderColor: seba.hairline, color: seba.ink }}
            >
              {t("skipForNow")}
            </button>
          </div>
        </Modal>
      )}

      {showMfaPrompt && (
        <Modal>
          <h2 className="text-center text-xl font-bold" style={{ color: seba.ink }}>
            {t("mfaPromptTitle")}
          </h2>
          <p className="text-center text-sm" style={{ color: seba.inkMuted }}>
            {t("mfaPromptDesc")}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/settings/security", { state: { promptMfa: true } })}
              className="w-full rounded-xl py-3.5 font-semibold text-white"
              style={{ background: seba.red }}
            >
              {t("enable2fa")}
            </button>
            <button onClick={finishFlow} className="w-full rounded-xl border py-3.5 font-medium" style={{ borderColor: seba.hairline, color: seba.ink }}>
              {t("notNow")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 shadow-2xl">{children}</div>
    </div>
  );
}
