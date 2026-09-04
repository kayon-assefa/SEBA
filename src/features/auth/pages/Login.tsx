import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  EyeFill,
  EyeSlashFill,
  ArrowLeft,
  ExclamationCircleFill,
} from "react-bootstrap-icons";
import AuthShell from "../components/AuthShell";
import SebaCaptcha from "../components/SebaCaptcha";
import HoneypotField from "../components/HoneypotField";
import { useLanguage } from "../context/Languagecontext";
import {
  loginUser,
  loginWithOAuth,
  loginWithPasskey,
  sendMagicLink,
  resendVerificationEmail,
  AuthFlowError,
  AUTH_NEEDS_VERIFICATION,
  AUTH_LOCKED,
  AUTH_INACTIVE,
  AUTH_MUST_RESET,
  type LoginMode,
} from "../services/auth.service";
import { EMAIL_RE, normalizeEmail } from "../../../lib/security";
import { seba } from "../design/tokens";

type Step = "email" | "password";

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedMode: LoginMode =
    searchParams.get("account") === "staff" ? "staff" : "owner";

  const [mode, setMode] = useState<LoginMode>(requestedMode);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [lockedMinutes, setLockedMinutes] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // CAPTCHA tokens are deliberately single-use. Re-mounting the widget after
  // a failed protected request makes the UI obtain a fresh challenge instead
  // of leaving a green "verified" state backed by an unusable token.
  const [captchaInstance, setCaptchaInstance] = useState(0);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    const nextMode: LoginMode =
      searchParams.get("account") === "staff" ? "staff" : "owner";

    setMode(nextMode);
    setStep("email");
    setPassword("");
    setFormError("");
    setNeedsVerification(false);
    setEmailError("");
  }, [searchParams]);

  function triggerShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  }

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setStep("email");
    setPassword("");
    setFormError("");
    setNeedsVerification(false);
    setEmailError("");
    setSearchParams(nextMode === "staff" ? { account: "staff" } : {}, { replace: true });
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!EMAIL_RE.test(normalizedEmail)) {
      setEmailError(t("invalidEmail"));
      triggerShake();
      return;
    }

    setEmail(normalizedEmail);
    setEmailError("");
    setFormError("");
    setStep("password");
  }

  function handleBack() {
    setFormError("");
    setNeedsVerification(false);
    setStep("email");
  }

  function describeError(error: unknown): string {
    if (error instanceof AuthFlowError) {
      switch (error.code) {
        case AUTH_NEEDS_VERIFICATION:
          setNeedsVerification(true);
          return t("loginErrorGeneric");
        case AUTH_LOCKED: {
          const minutes = Math.max(1, Math.ceil((error.retryAfterSeconds ?? 60) / 60));
          setLockedMinutes(minutes);
          return t("accountLocked", { minutes });
        }
        case AUTH_INACTIVE:
          return t("staffInactive");
        case AUTH_MUST_RESET:
          navigate("/forgot-password", { replace: true, state: { forced: true, email } });
          return t("forcedPasswordResetNotice");
        default:
          return t("loginErrorGeneric");
      }
    }
    return t("genericError");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || honeypot) return; // honeypot filled -> silently drop
    if (!captchaToken) {
      setFormError(t("captchaFailed"));
      return;
    }

    setFormError("");
    setNeedsVerification(false);
    setLockedMinutes(null);
    setLoading(true);

    try {
      const result = await loginUser(email, password, mode, captchaToken);
      navigate(result.accountType === "staff" ? "/staff/dashboard" : "/dashboard", {
        replace: true,
      });
    } catch (error: unknown) {
      setFormError(describeError(error));
      triggerShake();
      setPassword("");
      setCaptchaToken(null);
      setCaptchaInstance((value) => value + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    if (loading || !captchaToken) {
      if (!captchaToken) setFormError(t("captchaFailed"));
      return;
    }
    setLoading(true);
    setFormError("");
    try {
      await sendMagicLink(email, captchaToken);
      setMagicLinkSent(true);
    } catch {
      setFormError(t("genericError"));
      setCaptchaToken(null);
      setCaptchaInstance((value) => value + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendLoading || !email.trim()) return;
    setResendLoading(true);
    try {
      await resendVerificationEmail(email.trim(), captchaToken ?? undefined);
      setFormError(t("resendSent"));
      setNeedsVerification(false);
    } catch {
      setFormError(t("resendFailed"));
    } finally {
      setResendLoading(false);
    }
  }

  async function handlePasskey() {
    try {
      await loginWithPasskey();
      navigate("/dashboard", { replace: true });
    } catch {
      setFormError(t("passkeyUnavailable"));
    }
  }

  async function handleOAuth(provider: "google") {
    if (loading) return;
    setLoading(true);
    setFormError("");

    try {
      await loginWithOAuth(provider);
    } catch {
      setFormError(t("loginErrorGeneric"));
      setLoading(false);
    }
  }

  const titleKey = mode === "owner" ? "ownerLoginTitle" : "staffLoginTitle";
  const subtitleKey = mode === "owner" ? "ownerLoginSubtitle" : "staffLoginSubtitle";

  return (
    <AuthShell title={t(titleKey)} subtitle={t(subtitleKey)}>
      {/* Account type switch */}
      <div className="mb-6 grid grid-cols-2 rounded-2xl p-1" style={{ background: "#FFF2E6" }}>
        <button
          type="button"
          onClick={() => switchMode("owner")}
          className="rounded-xl px-3 py-3 text-sm font-bold transition-all"
          style={
            mode === "owner"
              ? { background: "#fff", color: seba.red, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
              : { color: seba.inkMuted }
          }
        >
          {t("ownerLoginTab")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("staff")}
          className="rounded-xl px-3 py-3 text-sm font-bold transition-all"
          style={
            mode === "staff"
              ? { background: "#fff", color: seba.red, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
              : { color: seba.inkMuted }
          }
        >
          {t("staffLoginTab")}
        </button>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "#FFF2F2", color: seba.red }}
        >
          <div className="flex items-start gap-2.5">
            <ExclamationCircleFill className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
          {needsVerification && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="self-start rounded-lg px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-70"
              style={{ background: seba.red }}
            >
              {resendLoading ? t("resendSending") : t("resendEmail")}
            </button>
          )}
        </div>
      )}

      {!useMagicLink && (
        <div className={`overflow-hidden ${shake ? "seba-shake" : ""}`}>
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ width: "200%", transform: step === "email" ? "translateX(0%)" : "translateX(-50%)" }}
          >
            {/* Step 1 – Email */}
            <form onSubmit={handleNext} className="w-1/2 pr-1">
              <HoneypotField value={honeypot} onChange={setHoneypot} />

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
                  {t("emailLabel")}
                </span>
                <input
                  type="email"
                  name="email"
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
                  style={{
                    color: seba.ink,
                    borderColor: emailError ? seba.red : seba.hairline,
                  }}
                />
                {emailError && (
                  <span className="text-xs font-semibold" style={{ color: seba.red }}>
                    {emailError}
                  </span>
                )}
              </label>

              <button
                type="submit"
                className="mt-6 w-full rounded-full py-4 font-bold text-white transition-all"
                style={{ background: seba.red }}
              >
                {t("next")}
              </button>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: seba.hairline }} />
                <span className="text-xs font-semibold" style={{ color: seba.inkMuted }}>
                  {t("or")}
                </span>
                <div className="h-px flex-1" style={{ background: seba.hairline }} />
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleOAuth("google")}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ borderColor: seba.hairline, color: seba.ink }}
                >
                  {t("continueWithGoogle")}
                </button>
                <button
                  type="button"
                  onClick={handlePasskey}
                  className="flex w-full items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-bold transition-all"
                  style={{ borderColor: seba.hairline, color: seba.ink }}
                >
                  {t("signInWithPasskey")}
                </button>
                <button
                  type="button"
                  onClick={() => setUseMagicLink(true)}
                  className="text-center text-sm font-semibold hover:underline"
                  style={{ color: seba.red }}
                >
                  {t("useMagicLink")}
                </button>
              </div>

              {mode === "owner" && (
                <p className="mt-6 text-center text-sm" style={{ color: seba.inkMuted }}>
                  {t("noAccount")}{" "}
                  <Link to="/register" className="font-bold hover:underline" style={{ color: seba.red }}>
                    {t("signUp")}
                  </Link>
                </p>
              )}
              {mode === "staff" && (
                <p className="mt-6 text-center text-xs" style={{ color: seba.inkMuted }}>
                  {t("staffNoAccount")}
                </p>
              )}
            </form>

            {/* Step 2 – Password */}
            <form onSubmit={handleSubmit} className="w-1/2 pl-1">
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{ color: seba.inkMuted }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {email}
              </button>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
                  {t("passwordLabel")}
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="current-password"
                    autoComplete="current-password"
                    autoFocus={step === "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    className="w-full rounded-xl border bg-white p-4 pr-12 outline-none transition-colors"
                    style={{ color: seba.ink, borderColor: seba.hairline }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("hide") : t("show")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: seba.inkMuted }}
                  >
                    {showPassword ? <EyeSlashFill className="h-4 w-4" /> : <EyeFill className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: seba.red }}>
                  {t("forgotPassword")}
                </Link>
              </div>

              <div className="mt-4">
                <SebaCaptcha key={`password-${captchaInstance}`} onVerified={setCaptchaToken} />
              </div>

              <button
                type="submit"
                disabled={loading || lockedMinutes !== null}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: seba.red }}
              >
                {loading && (
                  <span className="seba-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? t("loggingIn") : t("login")}
              </button>
            </form>
          </div>
        </div>
      )}

      {useMagicLink && (
        <form onSubmit={handleMagicLink}>
          {magicLinkSent ? (
            <p className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#EAF7EF", color: seba.success }}>
              {t("magicLinkSent")}
            </p>
          ) : (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
                  {t("emailLabel")}
                </span>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="rounded-xl border bg-white p-4 outline-none"
                  style={{ color: seba.ink, borderColor: seba.hairline }}
                />
              </label>
              <div className="mt-4">
                <SebaCaptcha key={`magic-link-${captchaInstance}`} onVerified={setCaptchaToken} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-full py-4 font-bold text-white disabled:opacity-70"
                style={{ background: seba.red }}
              >
                {loading ? t("magicLinkSending") : t("magicLinkSend")}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setUseMagicLink(false);
              setMagicLinkSent(false);
            }}
            className="mt-4 w-full text-center text-sm font-semibold hover:underline"
            style={{ color: seba.inkMuted }}
          >
            {t("useAPassword")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
