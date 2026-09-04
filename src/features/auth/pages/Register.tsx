import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

import AuthShell from "../components/AuthShell";
import SebaCaptcha from "../components/SebaCaptcha";
import HoneypotField from "../components/HoneypotField";
import PasswordStrengthMeter, { usePasswordCheck } from "../components/PasswordStrengthMeter";
import { useLanguage } from "../context/Languagecontext";
import { registerUser } from "../services/auth.service";
import { EMAIL_RE, normalizeEmail, sanitizePlainText } from "../../../lib/security";
import { seba } from "../design/tokens";

/** Splits the localized "I agree to the {terms} and {privacy}." sentence
 * on its two placeholders so /terms and /privacy can be real links,
 * regardless of word order in either language. */
function renderTermsSentence(t: (key: string, vars?: Record<string, string | number>) => string) {
  const TERMS_TOKEN = "\u0001TERMS\u0001";
  const PRIVACY_TOKEN = "\u0001PRIVACY\u0001";
  const template = t("agreeToTerms", { terms: TERMS_TOKEN, privacy: PRIVACY_TOKEN });

  const parts = template.split(new RegExp(`(${TERMS_TOKEN}|${PRIVACY_TOKEN})`));

  return parts.map((part, i) => {
    if (part === TERMS_TOKEN) {
      return (
        <Link key={i} to="/terms" className="font-bold hover:underline" style={{ color: seba.red }}>
          {t("termsOfService")}
        </Link>
      );
    }
    if (part === PRIVACY_TOKEN) {
      return (
        <Link key={i} to="/privacy" className="font-bold hover:underline" style={{ color: seba.red }}>
          {t("privacyPolicy")}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordCheck = usePasswordCheck(password);

  async function handleRegister() {
    if (honeypot) return; // bot filled the hidden field — drop silently

    if (!businessName.trim() || !email.trim() || !password) {
      toast.error(t("fillAllFields"));
      return;
    }
    if (!EMAIL_RE.test(normalizeEmail(email))) {
      toast.error(t("invalidEmail"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("passwordsDontMatch"));
      return;
    }
    if (!passwordCheck.meetsMinimum) {
      toast.error(t("passwordTooWeak"));
      return;
    }
    if (passwordCheck.breached) {
      toast.error(t("passwordBreached"));
      return;
    }
    if (!agreedToTerms) {
      toast.error(t("mustAgreeToTerms"));
      return;
    }
    if (!captchaToken) {
      toast.error(t("captchaFailed"));
      return;
    }

    try {
      setLoading(true);
      const cleanName = sanitizePlainText(businessName, 120);
      await registerUser(email, password, cleanName, captchaToken);
      toast.success(t("registerSuccessToast"));
      navigate(`/verify-email?email=${encodeURIComponent(normalizeEmail(email))}`);
    } catch {
      toast.error(t("genericError"));
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t("Register ")} subtitle={t("")}>
      <div className="space-y-5">
        <HoneypotField value={honeypot} onChange={setHoneypot} />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
            {t("Business Name")}
          </span>
          <input
            className="w-full rounded-xl border bg-white p-4 outline-none"
            style={{ color: seba.ink, borderColor: seba.hairline }}
            placeholder={t("businessNamePlaceholder")}
            value={businessName}
            maxLength={120}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
            {t("emailLabel")}
          </span>
          <input
            className="w-full rounded-xl border bg-white p-4 outline-none"
            style={{ color: seba.ink, borderColor: seba.hairline }}
            placeholder={t("emailPlaceholder")}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
            {t("passwordLabel")}
          </span>
          <div className="relative">
            <input
              className="w-full rounded-xl border bg-white p-4 pr-12 outline-none"
              style={{ color: seba.ink, borderColor: seba.hairline }}
              placeholder={t("passwordPlaceholder")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("hide") : t("show")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: seba.inkMuted }}
            >
              {showPassword ? <EyeSlashFill className="h-4 w-4" /> : <EyeFill className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
            {t("Confirm Password")}
          </span>
          <input
            className="w-full rounded-xl border bg-white p-4 outline-none"
            style={{
              color: seba.ink,
              borderColor: confirmPassword && confirmPassword !== password ? seba.danger : seba.hairline,
            }}
            placeholder={t("confirmPasswordPlaceholder")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            maxLength={128}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && confirmPassword !== password && (
            <span className="text-xs font-semibold" style={{ color: seba.danger }}>
              {t("passwordsDontMatch")}
            </span>
          )}
        </label>

        <SebaCaptcha onVerified={setCaptchaToken} />

        <label className="flex items-start gap-2.5 text-sm" style={{ color: seba.inkMuted }}>
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <span>{renderTermsSentence(t)}</span>
        </label>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full rounded-full py-4 font-bold text-white disabled:opacity-60"
          style={{ background: seba.red }}
        >
          {loading ? t("creatingAccount") : t("createAccount")}
        </button>

        <p className="text-center text-sm" style={{ color: seba.inkMuted }}>
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" className="font-bold hover:underline" style={{ color: seba.red }}>
            {t("login")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
