import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";
import AuthShell from "../components/AuthShell";
import SebaCaptcha from "../components/SebaCaptcha";
import { useLanguage } from "../context/Languagecontext";
import { supabase, callEdgeFunction } from "../../../lib/supabase";
import { EMAIL_RE, normalizeEmail } from "../../../lib/security";
import { seba } from "../design/tokens";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const location = useLocation() as { state?: { forced?: boolean; email?: string } };

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = normalizeEmail(email);

    if (!EMAIL_RE.test(normalizedEmail)) {
      setEmailError(t("invalidEmail"));
      return;
    }
    if (!captchaToken) {
      setFormError(t("captchaFailed"));
      return;
    }

    setEmailError("");
    setFormError("");
    setLoading(true);

    try {
      // Rate-limited the same way as login/register — item #6/#3 style
      // protection so this can't be used to spam a mailbox with reset links.
      const guard = await callEdgeFunction<{ allowed: boolean }>("login-guard", {
        action: "check",
        email: normalizedEmail,
        captchaToken,
      });
      if (!guard.allowed) throw new Error("CAPTCHA validation failed");

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      // Always show the same success state whether or not the account
      // exists — resetSentBody is intentionally worded as "if an account
      // exists" so this can never be used to enumerate accounts either.
      setSent(true);
    } catch {
      setFormError(t("genericError"));
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t("forgotTitle")} subtitle={t("forgotSubtitle")}>
      {location.state?.forced && !sent && (
        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "#FFF6E8", color: "#8A5A00" }}
        >
          <ExclamationCircleFill className="mt-0.5 h-4 w-4 shrink-0" />
          {t("forcedPasswordResetNotice")}
        </div>
      )}

      {sent ? (
        <div className="seba-pop flex flex-col items-center py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#EAF7EF" }}>
            <CheckCircleFill className="h-7 w-7" style={{ color: seba.success }} />
          </div>
          <p className="mt-5 text-lg font-black" style={{ color: seba.ink }}>
            {t("resetSentTitle")}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: seba.inkMuted }}>
            {t("resetSentBody")}
          </p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:underline" style={{ color: seba.red }}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {formError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: "#FFF2F2", color: seba.red }}
            >
              <ExclamationCircleFill className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
              {t("emailLabel")}
            </span>
            <input
              type="email"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder={t("emailPlaceholder")}
              className="rounded-xl border bg-white p-4 outline-none transition-colors"
              style={{ color: seba.ink, borderColor: emailError ? seba.red : seba.hairline }}
            />
            {emailError && (
              <span className="text-xs font-semibold" style={{ color: seba.red }}>
                {emailError}
              </span>
            )}
          </label>

          <div className="mt-4">
            <SebaCaptcha onVerified={setCaptchaToken} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: seba.red }}
          >
            {loading && <span className="seba-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />}
            {loading ? t("sending") : t("sendReset")}
          </button>

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: seba.inkMuted }}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToLogin")}
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
