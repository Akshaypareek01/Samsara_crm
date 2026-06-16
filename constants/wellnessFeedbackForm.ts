/**
 * Public wellness session feedback form URL for employees.
 * Override with NEXT_PUBLIC_WELLNESS_FEEDBACK_FORM_URL when needed.
 */
export const WELLNESS_FEEDBACK_FORM_URL =
  process.env.NEXT_PUBLIC_WELLNESS_FEEDBACK_FORM_URL?.trim() ||
  "https://apis-samsarawellness.in/v1/wellness-feedback/form";
