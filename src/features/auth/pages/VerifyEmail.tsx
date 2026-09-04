import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleFill, EnvelopeFill } from "react-bootstrap-icons";
import AuthShell from "../components/AuthShell";
import SebaCaptcha from "../components/SebaCaptcha";
import { useLanguage } from "../context/Languagecontext";
import { resendVerificationEmail } from "../services/auth.service";
import { seba } from "../design/tokens";

export default function VerifyEmail() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email] = useState(emailFromUrl);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  useEffect(() => {
    if (!email) setError(t("noEmailProvided"));
  }, [email, t]);

  async function handleResendClick() {
    if (!showCaptcha) {
      setShowCaptcha(true);
      return;
    }
    if (resendLoading || !email || !captchaToken) return;

    setResendLoading(true);
    setMessage("");
    setError("");

    try {
      await resendVerificationEmail(email, captchaToken);
      setMessage(t("resendSent"));
      setShowCaptcha(false);
      setCaptchaToken(null);
    } catch {
      setError(t("resendFailed"));
      setCaptchaToken(null);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthShell title={t("verify")} subtitle={t("verify")}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#E8F8F0" }}>
          <CheckCircleFill className="h-8 w-8" style={{ color: seba.success }} />
        </div>

        <p className="mb-2 text-sm font-medium" style={{ color: seba.inkMuted }}>
          {t("verifySentTo")}
        </p>

        <div className="mb-6 flex items-center gap-2 rounded-xl border px-4 py-3" style={{ borderColor: seba.hairline, background: "#FFF8F7" }}>
          <EnvelopeFill className="h-4 w-4" style={{ color: seba.red }} />
          <span className="text-sm font-bold" style={{ color: seba.ink }}>
            {email || t("emailLabel")}
          </span>
        </div>

        <p className="mb-6 text-sm" style={{ color: seba.inkMuted }}>
          {t("verifyBody")}
        </p>

        {message && (
          <div className="mb-5 w-full rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#E8F8F0", color: seba.success }}>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 w-full rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#FFF2F2", color: seba.red }}>
            {error}
          </div>
        )}

        {showCaptcha && !message && (
          <div className="mb-4 w-full">
            <SebaCaptcha onVerified={setCaptchaToken} />
          </div>
        )}

        <button
          type="button"
          onClick={handleResendClick}
          disabled={resendLoading || !email || (showCaptcha && !captchaToken)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
          style={{ background: seba.red }}
        >
          {resendLoading && <span className="seba-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />}
          {resendLoading ? t("resendSending") : t("resendEmail")}
        </button>

        <Link
          to="/login"
          className="w-full rounded-full border py-4 text-center font-bold transition-all"
          style={{ borderColor: "rgba(204,30,0,0.2)", color: seba.red }}
        >
          {t("goToLogin")}
        </Link>
      </div>
    </AuthShell>
  );
}
