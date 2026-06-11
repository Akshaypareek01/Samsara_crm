export interface CalendarMeta {
  year: number;
  monthIndex: number;
  daysInMonth: number;
  startDow: number;
  todayDay: number | null;
  monthLabel: string;
}

/**
 * Build calendar metadata for the bookings month grid.
 *
 * @param year - Full calendar year.
 * @param monthIndex - Zero-based month index.
 */
export function buildCalendarMeta(year: number, monthIndex: number): CalendarMeta {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDow = new Date(year, monthIndex, 1).getDay();
  const now = new Date();
  const todayDay =
    now.getFullYear() === year && now.getMonth() === monthIndex ? now.getDate() : null;
  const monthLabel = new Date(year, monthIndex, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  return { year, monthIndex, daysInMonth, startDow, todayDay, monthLabel };
}

/**
 * Parse a `YYYY-MM` month key.
 *
 * @param ym - Month key string.
 */
export function parseYearMonth(ym: string): { year: number; monthIndex: number } {
  const [y, m] = ym.split('-').map((n) => parseInt(n, 10));
  return { year: y, monthIndex: m - 1 };
}

/**
 * Shift a month key by a number of months.
 *
 * @param ym - Current month key.
 * @param delta - Months to add (negative to go back).
 */
export function shiftYearMonth(ym: string, delta: number): string {
  const { year, monthIndex } = parseYearMonth(ym);
  const d = new Date(year, monthIndex + delta, 1);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}`;
}

/**
 * Current month as `YYYY-MM`.
 */
export function currentYearMonth(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}`;
}

/**
 * Maximum forward month key for calendar navigation (default +12 months).
 *
 * @param monthsAhead - How many months ahead of today to allow.
 */
export function maxYearMonth(monthsAhead = 12): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}`;
}

/**
 * ISO date string (`YYYY-MM-DD`) for a day in a month key.
 *
 * @param monthKey - `YYYY-MM`.
 * @param day - Day of month (1–31).
 */
export function toIsoDateInMonth(monthKey: string, day: number): string {
  const { year, monthIndex } = parseYearMonth(monthKey);
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
