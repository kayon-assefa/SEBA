import { useEffect, useState } from "react";
import { ArrowClockwise, CheckCircleFill } from "react-bootstrap-icons";
import { useLanguage } from "../context/Languagecontext";
import { callEdgeFunction } from "../../../lib/supabase";
import { seba } from "../design/tokens";

/**
 * SEBA's own CAPTCHA — no third-party script, no reCAPTCHA/hCaptcha key.
 *
 * Why shapes instead of letters: the brief asked for something anyone can
 * use, in both English and Amharic. Text-based challenges force a choice
 * of alphabet (Latin "SEBA" vs Ge'ez "ሴባ") and are harder for low-literacy
 * or visually-impaired-adjacent users. Shapes drawn from the logo itself
 * (circle, quarter-circle, half-circle, square) need only ONE translated
 * sentence of instruction and work identically in both languages.
 *
 * Security note: the tap-to-select UI on its own proves nothing — a bot can
 * call the same API. The actual protection is server-side: /supabase/functions/captcha
 * issues a challenge, keeps the correct answer server-side only, and
 * returns a short-lived single-use token on success. login-guard and
 * resend-guard both reject requests that don't carry a valid, unused token.
 * See README "Custom CAPTCHA" section.
 */

type ShapeKind = "circle" | "square" | "half-circle" | "quarter-circle";

type ChallengeTile = {
  id: string;
  shape: ShapeKind;
};

type Challenge = {
  challengeId: string;
  targetShape: ShapeKind;
  tiles: ChallengeTile[];
  expiresAt: number;
};

function Shape({ kind, color }: { kind: ShapeKind; color: string }) {
  switch (kind) {
    case "circle":
      return <div className="h-full w-full rounded-full" style={{ background: color }} />;
    case "square":
      return <div className="h-full w-full" style={{ background: color }} />;
    case "half-circle":
      return <div className="h-full w-full rounded-t-full" style={{ background: color }} />;
    case "quarter-circle":
      return <div className="h-full w-full rounded-tl-full" style={{ background: color }} />;
  }
}

export default function SebaCaptcha({
  onVerified,
}: {
  onVerified: (token: string) => void;
}) {
  const { t } = useLanguage();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "checking" | "verified" | "failed">("idle");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  async function loadChallenge() {
    setStatus("idle");
    setSelected(new Set());
    setVerifiedToken(null);
    setLoadError(false);
    try {
      const data = await callEdgeFunction<Challenge>("captcha", { action: "start" });
      setChallenge(data);
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    void loadChallenge();
  }, []);

  function toggle(id: string) {
    if (status === "verified" || status === "checking") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!challenge || selected.size === 0) return;
    setStatus("checking");
    try {
      const data = await callEdgeFunction<{ ok: boolean; token?: string }>("captcha", {
        action: "verify",
        challengeId: challenge.challengeId,
        selected: Array.from(selected),
      });

      if (data.ok && data.token) {
        setStatus("verified");
        setVerifiedToken(data.token);
        onVerified(data.token);
      } else {
        setStatus("failed");
        await loadChallenge();
      }
    } catch {
      setStatus("failed");
      await loadChallenge();
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border p-4 text-sm" style={{ borderColor: seba.hairline, color: seba.danger }}>
        {t("genericError")}{" "}
        <button type="button" onClick={loadChallenge} className="font-bold underline">
          {t("captchaRefresh")}
        </button>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border" style={{ borderColor: seba.hairline }}>
        <span className="seba-spin h-5 w-5 rounded-full border-2 border-black/10" style={{ borderTopColor: seba.red }} />
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div
        className="flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold"
        style={{ borderColor: seba.success, color: seba.success, background: "#EAF7EF" }}
      >
        <CheckCircleFill className="h-4 w-4" />
        {t("captchaVerified")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: seba.hairline }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: seba.inkMuted }}>
          {t("captchaTitle")}
        </span>
        <button
          type="button"
          onClick={loadChallenge}
          aria-label={t("captchaRefresh")}
          className="text-[#8A6B67] transition hover:text-black"
        >
          <ArrowClockwise className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0" style={{ color: seba.red }}>
          <Shape kind={challenge.targetShape} color={seba.red} />
        </div>
        <p className="text-sm" style={{ color: seba.ink }}>
          {t("captchaShapeInstruction")}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
        {challenge.tiles.map((tile) => {
          const isSelected = selected.has(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => toggle(tile.id)}
              aria-pressed={isSelected}
              className="flex aspect-square items-center justify-center rounded-lg border-2 p-2.5 transition"
              style={{
                borderColor: isSelected ? seba.red : seba.hairline,
                background: isSelected ? "#FFF1EE" : "#fff",
              }}
            >
              <Shape kind={tile.shape} color={isSelected ? seba.red : "#D8CFCD"} />
            </button>
          );
        })}
      </div>

      {status === "failed" && (
        <p className="mt-3 text-xs font-semibold" style={{ color: seba.danger }}>
          {t("captchaFailed")}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={selected.size === 0 || status === "checking"}
        className="mt-4 w-full rounded-full py-3 text-sm font-bold text-white transition disabled:opacity-50"
        style={{ background: seba.red }}
      >
        {status === "checking" ? t("captchaVerifying") : t("confirm")}
      </button>

      {verifiedToken && <input type="hidden" value={verifiedToken} readOnly />}
    </div>
  );
}
