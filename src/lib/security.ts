/** Normalizes email addresses before client-side validation or submission. */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/** Removes markup from short, plain-text user input. */
export function sanitizePlainText(input: string, maxLength = 120): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Detects potentially deceptive mixed-script email domains. */
export function hasMixedScriptDomain(email: string): boolean {
  const domain = email.split("@")[1] ?? "";
  const hasLatin = /[a-z]/i.test(domain);
  const hasCyrillic = /[\u0400-\u052f]/.test(domain);
  const hasGreek = /[\u0370-\u03ff]/.test(domain);

  return hasLatin && (hasCyrillic || hasGreek);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
