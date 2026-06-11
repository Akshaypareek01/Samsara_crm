/** Letters, spaces, and common name punctuation only — no digits. */
export const PERSON_NAME_REGEX = /^[A-Za-z\s.'-]+$/;

/**
 * Strip digits from a person-name input value.
 *
 * @param raw - Raw input string.
 * @returns Sanitized name without digits.
 */
export function sanitizePersonName(raw: string): string {
  return raw.replace(/[0-9]/g, '');
}

/**
 * Validate a person or organization display name (letters only).
 *
 * @param value - Trimmed name string.
 * @returns Error message or null when valid.
 */
export function validatePersonName(value: string): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return null;
  }
  if (!PERSON_NAME_REGEX.test(trimmed)) {
    return 'Name must contain only letters, spaces, and . \' -';
  }
  return null;
}
