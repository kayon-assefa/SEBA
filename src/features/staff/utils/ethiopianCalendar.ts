/**
 * Minimal Gregorian → Ethiopian calendar converter. Good enough for a
 * display hint next to a date field (staff still pick the actual date on a
 * normal Gregorian picker, since that's what the database stores — this
 * just shows them what that date is in the calendar most customers think
 * in day-to-day).
 */
const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
];

export function toEthiopian(isoDate: string): { day: number; month: number; monthName: string; year: number } {
  const g = new Date(isoDate + "T00:00:00");
  const gYear = g.getFullYear();

  // Ethiopian new year falls on Gregorian Sep 11 (Sep 12 in the Gregorian
  // leap year immediately before it).
  const isGregLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const newYearDay = isGregLeap(gYear) ? 12 : 11;

  let ethYear = gYear - 8;
  const gregorianNewYear = new Date(gYear, 8, newYearDay); // month 8 = September (0-indexed)
  let daysSinceNewYear: number;
  if (g >= gregorianNewYear) {
    daysSinceNewYear = Math.round((g.getTime() - gregorianNewYear.getTime()) / 86400000);
  } else {
    ethYear -= 1;
    const prevIsLeap = isGregLeap(gYear - 1);
    const prevNewYear = new Date(gYear - 1, 8, prevIsLeap ? 12 : 11);
    daysSinceNewYear = Math.round((g.getTime() - prevNewYear.getTime()) / 86400000);
  }

  const month = Math.floor(daysSinceNewYear / 30) + 1;
  const day = (daysSinceNewYear % 30) + 1;

  return { day, month, monthName: ETHIOPIAN_MONTHS[Math.min(month, 13) - 1] || "", year: ethYear };
}
