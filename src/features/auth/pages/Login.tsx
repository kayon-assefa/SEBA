import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  EyeFill,
  EyeSlashFill,
  ArrowLeft,
  ExclamationCircleFill,
} from "react-bootstrap-icons";
import AuthCard from "../components/AuthCard";
import { useLanguage } from "../context/Languagecontext";
import { loginUser, type LoginMode } from "../services/auth.service";

type Step = "email" | "password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACCOUNT_MESSAGES = {
  owner: {
    title: "Business Owner Login",
    subtitle: "Sign in to manage your SEBA business.",
  },
  staff: {
    title: "Staff Login",
    subtitle: "Sign in with your SEBA staff account.",
  },
} as const;

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
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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

    setSearchParams(
      nextMode === "staff" ? { account: "staff" } : {},
      { replace: true }
    );
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim();

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (loading) return;

    setFormError("");
    setNeedsVerification(false);
    setLoading(true);

    try {
      const result = await loginUser(email, password, mode);

      if (result.accountType === "staff") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("genericError");

      if (message.toLowerCase().includes("verify your email")) {
        setNeedsVerification(true);
      }

      setFormError(message);
      triggerShake();
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendLoading || !email.trim()) return;

    setResendLoading(true);

    try {
      const { resendVerificationEmail } = await import(
        "../services/auth.service"
      );

      await resendVerificationEmail(email.trim());

      setFormError("Verification email sent. Please check your inbox.");
      setNeedsVerification(false);
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to resend verification email."
      );
    } finally {
      setResendLoading(false);
    }
  }

  const copy = ACCOUNT_MESSAGES[mode];

  return (
    <AuthCard title={copy.title} subtitle={copy.subtitle}>
      {/* Account type switch */}
      <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#FFF2E6] p-1">
        <button
          type="button"
          onClick={() => switchMode("owner")}
          className={`rounded-xl px-3 py-3 text-sm font-bold transition-all ${
            mode === "owner"
              ? "bg-white text-[#8B1E2D] shadow-sm"
              : "text-[#8A6B67] hover:text-[#8B1E2D]"
          }`}
        >
          Business Owner Login
        </button>

        <button
          type="button"
          onClick={() => switchMode("staff")}
          className={`rounded-xl px-3 py-3 text-sm font-bold transition-all ${
            mode === "staff"
              ? "bg-white text-[#8B1E2D] shadow-sm"
              : "text-[#8A6B67] hover:text-[#8B1E2D]"
          }`}
        >
          Staff Login
        </button>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-xl bg-[#FFF2F2] px-4 py-3 text-sm font-semibold text-[#8B1E2D]"
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
              className="self-start rounded-lg bg-[#FF5A5F] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#E64A50] disabled:opacity-70"
            >
              {resendLoading ? "Sending..." : "Resend Email"}
            </button>
          )}
        </div>
      )}

      <div className={`overflow-hidden ${shake ? "seba-shake" : ""}`}>
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{
            width: "200%",
            transform:
              step === "email" ? "translateX(0%)" : "translateX(-50%)",
          }}
        >
          {/* Step 1 – Email */}
          <form onSubmit={handleNext} className="w-1/2 pr-1">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
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
                className={`rounded-xl border bg-white p-4 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F] ${
                  emailError
                    ? "border-[#FF5A5F]"
                    : "border-[#8B1E2D]/15"
                }`}
              />

              {emailError && (
                <span className="text-xs font-semibold text-[#FF5A5F]">
                  {emailError}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-[#FF5A5F] py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30"
            >
              {t("next")}
            </button>

            {mode === "owner" && (
              <p className="mt-6 text-center text-sm text-[#8A6B67]">
                {t("noAccount")}{" "}
                <Link
                  to="/register"
                  className="font-bold text-[#8B1E2D] hover:underline"
                >
                  {t("signUp")}
                </Link>
              </p>
            )}

            {mode === "staff" && (
              <p className="mt-6 text-center text-xs text-[#8A6B67]">
                Staff accounts are created by the business owner.
              </p>
            )}
          </form>

          {/* Step 2 – Password */}
          <form onSubmit={handleSubmit} className="w-1/2 pl-1">
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8A6B67] transition-colors hover:text-[#8B1E2D]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {email}
            </button>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
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
                  className="w-full rounded-xl border border-[#8B1E2D]/15 bg-white p-4 pr-12 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A6B67] transition-colors hover:text-[#8B1E2D]"
                >
                  {showPassword ? (
                    <EyeSlashFill className="h-4 w-4" />
                  ) : (
                    <EyeFill className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#8B1E2D] hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A5F] py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span className="seba-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
              )}

              {loading ? t("loggingIn") : "Login"}
            </button>
          </form>
        </div>
      </div>
    </AuthCard>
  );
}
