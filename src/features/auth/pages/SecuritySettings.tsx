import { useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../context/Languagecontext";
import { seba } from "../design/tokens";

/**
 * Minimal stub: real TOTP enrollment (QR code + verify code) via
 * supabase.auth.mfa.enroll({ factorType: 'totp' }). Kept intentionally
 * small since #21 was "no" for a full always-on 2FA management screen —
 * this exists only so the "Enable 2FA" button from the post-reset prompt
 * goes somewhere real instead of faking success. Expand this page (list
 * factors, allow removal, backup codes) if you decide you want the fuller
 * version later.
 */
export default function SecuritySettings() {
  const { t } = useLanguage();
  const location = useLocation() as { state?: { promptMfa?: boolean } };
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "enrolling" | "verifying" | "done" | "error">("idle");

  async function startEnroll() {
    setStatus("enrolling");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) {
      setStatus("error");
      return;
    }
    setQr(data.totp.qr_code);
    setFactorId(data.id);
    setStatus("idle");
  }

  async function verify() {
    if (!factorId) return;
    setStatus("verifying");
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setStatus("error");
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });
    setStatus(verify.error ? "error" : "done");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-10 sm:px-8" style={{ color: seba.ink }}>
      <h1 className="text-2xl font-black">{t("mfaPromptTitle")}</h1>
      <p className="mt-2 text-sm" style={{ color: seba.inkMuted }}>
        {t("mfaPromptDesc")}
      </p>

      {location.state?.promptMfa && status === "idle" && !qr && (
        <button onClick={startEnroll} className="mt-6 w-full rounded-full py-3.5 font-bold text-white" style={{ background: seba.red }}>
          {t("enable2fa")}
        </button>
      )}

      {qr && status !== "done" && (
        <div className="mt-6 space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="TOTP QR code" className="mx-auto h-44 w-44" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="w-full rounded-xl border p-4 text-center tracking-[0.5em] outline-none"
            style={{ borderColor: seba.hairline }}
          />
          <button onClick={verify} disabled={code.length !== 6} className="w-full rounded-full py-3.5 font-bold text-white disabled:opacity-50" style={{ background: seba.red }}>
            {t("confirm")}
          </button>
          {status === "error" && (
            <p className="text-center text-sm font-semibold" style={{ color: seba.danger }}>
              {t("genericError")}
            </p>
          )}
        </div>
      )}

      {status === "done" && (
        <p className="mt-6 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#EAF7EF", color: seba.success }}>
          {t("captchaVerified")}
        </p>
      )}
    </div>
  );
}
