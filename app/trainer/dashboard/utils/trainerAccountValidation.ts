/** Indian PAN format: 5 letters, 4 digits, 1 letter. */
export const TRAINER_PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * Normalizes PAN input to uppercase alphanumeric, max 10 characters.
 *
 * @param raw - Raw input value.
 */
export function sanitizeTrainerPan(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

/**
 * Validates trainer payout PAN when provided.
 *
 * @param panNumber - PAN string from the form.
 * @returns Error message or empty string when valid.
 */
export function validateTrainerPanNumber(panNumber: string): string {
  const pan = panNumber.trim().toUpperCase();
  if (!pan) return '';
  if (!TRAINER_PAN_REGEX.test(pan)) {
    return 'Please enter a valid 10-character PAN (e.g. ABCDE1234F)';
  }
  return '';
}
