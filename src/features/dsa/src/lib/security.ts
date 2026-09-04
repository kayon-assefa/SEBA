/**
 * Small, dependency-free helpers used across the auth pages. These are
 * defense-in-depth on the client; the server-side equivalents (Postgres
 * constraints, RLS, edge function validation) are the real boundary and
 * are documented in supabase/migrations and supabase/functions.
 */

/** Strips tags/attributes so free-text fields (business name) can never
 * carry markup into anywhere they're later rendered without escaping. */
export function sanitizePlainText(input: string, maxLength = 120): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Consistent email normalization used by every page — trim + lowercase.
 * (Supabase auth is case-insensitive on the local part in practice, but
 * normalizing client-side avoids "same" account confusion in the UI.) */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Very small homoglyph guard: flags emails whose domain contains
 * non-ASCII characters that LOOK like ASCII (Cyrillic а vs Latin a, etc).
 * This does not block internationalized domains outright — it just warns,
 * since Punycode domains are legitimate. It only fires when the domain
 * *mixes* scripts, which is the actual phishing/lookalike pattern.
 */
export function hasMixedScriptDomain(email: string): boolean {
  const domain = email.split("@")[1] ?? "";
  const hasLatin = /[a-z]/i.test(domain);
  const hasCyrillic = /[а-яА-ЯёЁ]/.test(domain);
  const hasGreek = /[α-ωΑ-Ω]/.test(domain);
  return hasLatin && (hasCyrillic || hasGreek);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
