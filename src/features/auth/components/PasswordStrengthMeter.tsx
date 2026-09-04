import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/Languagecontext";
import { seba } from "../design/tokens";

export type PasswordCheck = {
  score: 0 | 1 | 2 | 3 | 4;
  meetsMinimum: boolean;
  breached: boolean | null; // null while checking / unknown (offline)
};

const RULES = [
  { key: "tipLength" as const, test: (p: string) => p.length >= 8 },
  { key: "tipUpper" as const, test: (p: string) => /[A-Z]/.test(p) },
  { key: "tipLower" as const, test: (p: string) => /[a-z]/.test(p) },
  { key: "tipNumber" as const, test: (p: string) => /[0-9]/.test(p) },
  { key: "tipSpecial" as const, test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

async function sha1Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Checks the password against the "Have I Been Pwned" range API using
 * k-anonymity: only the first 5 characters of the SHA-1 hash are ever sent,
 * so the real password (and even its full hash) never leaves the device.
 * Public API, no key required. Fails open (returns null) if offline —
 * we never block registration purely because this third-party check
 * couldn't be reached.
 */
async function checkBreached(password: string): Promise<boolean | null> {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) return null;
    const text = await res.text();
    return text.split("\n").some((line) => line.startsWith(suffix));
  } catch {
    return null;
  }
}

export function usePasswordCheck(password: string): PasswordCheck {
  const [breached, setBreached] = useState<boolean | null>(null);

  const score = useMemo(() => {
    const passed = RULES.filter((r) => r.test(password)).length;
    if (!password) return 0;
    return Math.min(4, passed - 1) as PasswordCheck["score"];
  }, [password]);

  const meetsMinimum = RULES.every((r) => r.test(password));

  useEffect(() => {
    if (!meetsMinimum) {
      setBreached(null);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const result = await checkBreached(password);
      if (!cancelled) setBreached(result);
    }, 400); // debounce so we don't hit the API on every keystroke
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetsMinimum, password]);

  return { score, meetsMinimum, breached };
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const { t, tList } = useLanguage();
  const check = usePasswordCheck(password);
  const labels = tList("strengthLabels");
  const barColors = ["#D8CFCD", seba.danger, "#E08A2E", "#3FA65C", seba.success];

  if (!password) return null;

  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-xs font-semibold" style={{ color: seba.inkMuted }}>
        <span>{t("strength")}</span>
        <span style={{ color: barColors[check.score] }}>{labels[check.score]}</span>
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: i < check.score ? barColors[check.score] : "#EDE4E2" }}
          />
        ))}
      </div>

      <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.key}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: passed ? seba.success : seba.inkMuted }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: passed ? seba.success : "#D8CFCD" }}
              />
              {t(rule.key)}
            </li>
          );
        })}
      </ul>

      {check.meetsMinimum && check.breached === null && (
        <p className="mt-2 text-xs" style={{ color: seba.inkMuted }}>
          {t("checkingPassword")}
        </p>
      )}
      {check.breached === true && (
        <p className="mt-2 text-xs font-semibold" style={{ color: seba.danger }}>
          {t("passwordBreached")}
        </p>
      )}
    </div>
  );
}
