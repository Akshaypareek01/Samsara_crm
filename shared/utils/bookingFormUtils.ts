/** Maximum characters allowed for company booking notes (matches backend Joi). */
export const BOOKING_NOTES_MAX_LENGTH = 1000;

/**
 * Trim booking notes and omit when empty so optional field is not sent as "".
 *
 * @param notes - Raw notes from the form.
 */
export function normalizeBookingNotes(notes?: string): string | undefined {
  const trimmed = notes?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Validate optional booking notes.
 *
 * @param notes - Raw notes from the form.
 * @returns Error message or null when valid.
 */
export function validateBookingNotes(notes?: string): string | null {
  const trimmed = notes?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > BOOKING_NOTES_MAX_LENGTH) {
    return `Notes must be ${BOOKING_NOTES_MAX_LENGTH} characters or less`;
  }
  return null;
}

/**
 * Remaining characters for booking notes input.
 *
 * @param notes - Current notes value.
 */
export function bookingNotesRemaining(notes?: string): number {
  return BOOKING_NOTES_MAX_LENGTH - (notes?.length ?? 0);
}
