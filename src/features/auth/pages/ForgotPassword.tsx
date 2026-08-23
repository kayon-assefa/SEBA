import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";
import AuthCard from "../components/AuthCard";
import { useLanguage } from "../context/Languagecontext";
import { supabase } from "../../../lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(t("invalidEmail"));
      return;
    }

    setEmailError("");
    setFormError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setFormError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("forgotTitle")} subtitle={t("forgotSubtitle")}>
      {sent ? (
        <div className="seba-pop flex flex-col items-center py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF7EF]">
            <CheckCircleFill className="h-7 w-7 text-[#3FA65C]" />
          </div>
          <p className="mt-5 text-lg font-black text-[#241210]">{t("resetSentTitle")}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6B4D4A]">{t("resetSentBody")}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#8B1E2D] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {formError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#FFF2F2] px-4 py-3 text-sm font-semibold text-[#8B1E2D]"
            >
              <ExclamationCircleFill className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
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
              className={`rounded-xl border bg-white p-4 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F] ${
                emailError ? "border-[#FF5A5F]" : "border-[#8B1E2D]/15"
              }`}
            />
            {emailError && (
              <span className="text-xs font-semibold text-[#FF5A5F]">{emailError}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A5F] py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && (
              <span className="seba-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? t("sending") : t("sendReset")}
          </button>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#8A6B67] hover:text-[#8B1E2D]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToLogin")}
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
