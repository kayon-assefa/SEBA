import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleFill, EnvelopeFill } from "react-bootstrap-icons";
import AuthCard from "../components/AuthCard";
import { supabase } from "../../../lib/supabase";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email] = useState(emailFromUrl);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      setError("No email provided. Please register again.");
    }
  }, [email]);

  async function handleResend() {
    if (resendLoading || !email) return;

    setResendLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) throw error;

      setMessage("Verification email sent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthCard
      title="Email Sent"
      subtitle="Please verify your email before logging in"
    >
      <div className="flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8F0]">
          <CheckCircleFill className="h-8 w-8 text-[#2E7D4F]" />
        </div>

        <p className="mb-2 text-sm font-medium text-[#8A6B67]">
          We've sent a verification link to
        </p>

        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#8B1E2D]/10 bg-[#FFF8F7] px-4 py-3">
          <EnvelopeFill className="h-4 w-4 text-[#FF5A5F]" />
          <span className="text-sm font-bold text-[#241210]">
            {email || "your email"}
          </span>
        </div>

        <p className="mb-8 text-sm text-[#8A6B67]">
          Please check your inbox and click the link to verify your account.
          After verifying, you can log in.
        </p>

        {/* Success / Error message */}
        {message && (
          <div className="mb-5 w-full rounded-xl bg-[#E8F8F0] px-4 py-3 text-sm font-semibold text-[#2E7D4F]">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 w-full rounded-xl bg-[#FFF2F2] px-4 py-3 text-sm font-semibold text-[#8B1E2D]">
            {error}
          </div>
        )}

        {/* Resend button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || !email}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A5F] py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {resendLoading && (
            <span className="seba-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
          )}
          {resendLoading ? "Sending..." : "Resend Email"}
        </button>

        {/* Go to Login */}
        <Link
          to="/login"
          className="w-full rounded-full border border-[#8B1E2D]/20 py-4 text-center font-bold text-[#8B1E2D] transition-all hover:bg-[#FFF2F2]"
        >
          Go to Login
        </Link>
      </div>
    </AuthCard>
  );
}
