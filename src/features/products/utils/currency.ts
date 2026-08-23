const CURRENCY_LOCALES: Record<string, string> = {
  ETB: "en-ET",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  KES: "en-KE",
};

export function formatCurrency(
  amount: number,
  currency: string = "ETB"
): string {
  const locale = CURRENCY_LOCALES[currency] ?? "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown currency code - fall back to a plain formatted number + code
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_LOCALES);
