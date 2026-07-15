const STORAGE_KEY = "samsara:company-dashboard-feedback-alert-dismissed";

/**
 * Reads dismissed booking ids from localStorage.
 */
function readDismissedIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];
  } catch {
    return [];
  }
}

/**
 * Persists dismissed booking ids to localStorage.
 *
 * @param ids - Booking ids that should not show the dashboard alert again.
 */
function writeDismissedIds(ids: string[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore quota or privacy-mode errors.
  }
}

/**
 * Returns whether the feedback alert was dismissed for a booking.
 *
 * @param bookingId - Completed booking id.
 */
export function isFeedbackAlertDismissed(bookingId: string): boolean {
  return readDismissedIds().includes(bookingId);
}

/**
 * Marks a booking's feedback alert as dismissed for this browser.
 *
 * @param bookingId - Completed booking id.
 */
export function dismissFeedbackAlertBooking(bookingId: string): void {
  const ids = readDismissedIds();
  if (ids.includes(bookingId)) return;
  writeDismissedIds([...ids, bookingId]);
}
