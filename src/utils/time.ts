/** "14 Nov 2026", the same on every build machine whatever its language or time zone. */
export const formatDateLong = (date: Date): string =>
  date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
