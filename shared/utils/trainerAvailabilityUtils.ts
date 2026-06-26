import { formatBookingTime } from './bookingUtils';

/** Day-of-week index (0 = Sunday) to display label. */
export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type WeeklyAvailabilitySlot = {
  startTime: string;
  endTime: string;
};

export type WeeklyAvailabilityDay = {
  dayOfWeek: number;
  slots: WeeklyAvailabilitySlot[];
};

export const AVAILABILITY_ERROR_MESSAGE =
  "Please select the time according to the trainer's availability";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Parse HH:MM into minutes from midnight.
 *
 * @param time - 24-hour time string.
 */
export function timeToMinutes(time: string): number | null {
  if (!TIME_REGEX.test(time)) {
    return null;
  }
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  return h * 60 + m;
}

/**
 * Format minutes from midnight as HH:MM.
 *
 * @param minutes - Minutes from midnight.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Coerce API/null weekly availability into a safe array.
 *
 * @param raw - weeklyAvailability from trainer profile.
 */
export function normalizeWeeklyAvailability(
  raw: WeeklyAvailabilityDay[] | null | undefined
): WeeklyAvailabilityDay[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter(
      (entry) =>
        entry &&
        typeof entry.dayOfWeek === 'number' &&
        entry.dayOfWeek >= 0 &&
        entry.dayOfWeek <= 6 &&
        Array.isArray(entry.slots)
    )
    .map((entry) => ({
      dayOfWeek: entry.dayOfWeek,
      slots: entry.slots.filter((slot) => slot?.startTime && slot?.endTime),
    }))
    .filter((entry) => entry.slots.length > 0);
}

/**
 * Whether a booking fits inside the trainer's weekly availability.
 *
 * @param schedule - Trainer weekly availability entries.
 * @param bookingDate - ISO date string (YYYY-MM-DD).
 * @param startTime - HH:MM start time.
 * @param durationHours - Session duration in hours.
 */
export function isWithinWeeklyAvailability(
  schedule: WeeklyAvailabilityDay[] | undefined,
  bookingDate: string,
  startTime: string,
  durationHours: number
): boolean {
  const normalized = normalizeWeeklyAvailability(schedule);
  if (!normalized.length) {
    return true;
  }

  const dayOfWeek = new Date(`${bookingDate}T12:00:00`).getDay();
  const dayEntry = normalized.find((entry) => entry.dayOfWeek === dayOfWeek);
  if (!dayEntry?.slots?.length) {
    return false;
  }

  const startMin = timeToMinutes(startTime);
  if (startMin == null) {
    return false;
  }
  const endMin = startMin + Math.round(durationHours * 60);
  if (endMin > 24 * 60) {
    return false;
  }

  return dayEntry.slots.some((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    if (slotStart == null || slotEnd == null || slotEnd <= slotStart) {
      return false;
    }
    return startMin >= slotStart && endMin <= slotEnd;
  });
}

/**
 * Build selectable start times (30-min steps) for a date from weekly availability.
 *
 * @param schedule - Trainer weekly availability.
 * @param bookingDate - ISO date string.
 * @param durationHours - Required session duration.
 */
export function getAvailableStartTimesForDate(
  schedule: WeeklyAvailabilityDay[] | undefined,
  bookingDate: string,
  durationHours: number
): string[] {
  const normalized = normalizeWeeklyAvailability(schedule);
  if (!normalized.length || !bookingDate) {
    return [];
  }

  const dayOfWeek = new Date(`${bookingDate}T12:00:00`).getDay();
  const dayEntry = normalized.find((entry) => entry.dayOfWeek === dayOfWeek);
  if (!dayEntry?.slots?.length) {
    return [];
  }

  const durationMin = Math.round(durationHours * 60);
  const options = new Set<string>();

  for (const slot of dayEntry.slots) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    if (slotStart == null || slotEnd == null || slotEnd <= slotStart) {
      continue;
    }
    for (let t = slotStart; t + durationMin <= slotEnd; t += 30) {
      options.add(minutesToTime(t));
    }
  }

  return Array.from(options).sort();
}

/**
 * Whether the trainer has saved at least one weekly availability window.
 *
 * @param schedule - Trainer weekly availability from profile.
 */
export function trainerHasWeeklySchedule(
  schedule: WeeklyAvailabilityDay[] | null | undefined
): boolean {
  return normalizeWeeklyAvailability(schedule).length > 0;
}

/**
 * Format weekly availability for read-only display (12-hour AM/PM times).
 *
 * @param schedule - Trainer weekly availability entries.
 */
export function formatWeeklyAvailabilityLines(
  schedule: WeeklyAvailabilityDay[] | undefined
): string[] {
  const normalized = normalizeWeeklyAvailability(schedule);
  if (!normalized.length) {
    return [];
  }

  return [...normalized]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((entry) => {
      const day = WEEKDAY_LABELS[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek}`;
      const slots = (entry.slots ?? [])
        .filter((s) => s.startTime && s.endTime)
        .map((s) => `${formatBookingTime(s.startTime)} – ${formatBookingTime(s.endTime)}`)
        .join(', ');
      return slots ? `${day}: ${slots}` : null;
    })
    .filter((line): line is string => Boolean(line));
}

/**
 * Map booking API errors to user-friendly availability message when applicable.
 *
 * @param error - Caught request error.
 */
export function mapBookingAvailabilityError(error: unknown): string | null {
  const msg =
    (error as { message?: string })?.message ||
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (typeof msg === 'string' && msg.includes('trainer\'s availability')) {
    return AVAILABILITY_ERROR_MESSAGE;
  }
  return null;
}
