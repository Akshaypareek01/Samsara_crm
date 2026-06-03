/**
 * Returns today's date as `YYYY-MM-DD` for HTML date input `max`.
 *
 * @returns ISO date string for the current local calendar day.
 */
export function getTrainerDobMaxDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate a trainer date of birth string (YYYY-MM-DD).
 *
 * @param value - Raw date value from the form.
 * @returns Error message, or undefined when valid.
 */
export function validateTrainerDateOfBirth(value: string | null | undefined): string | undefined {
  if (!value) {
    return 'Date of birth is required';
  }

  const dateOnly = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return 'Please enter a valid date of birth';
  }

  const parsed = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return 'Please enter a valid date of birth';
  }

  if (dateOnly > getTrainerDobMaxDate()) {
    return 'Date of birth cannot be in the future';
  }

  return undefined;
}
