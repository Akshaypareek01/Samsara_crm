/**
 * Public CRM origin for wellness feedback share links.
 */
export const CRM_PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_CRM_ORIGIN?.trim() ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

/**
 * Legacy static wellness feedback form URL (deprecated for booking-scoped sharing).
 */
export const WELLNESS_FEEDBACK_FORM_URL =
  process.env.NEXT_PUBLIC_WELLNESS_FEEDBACK_FORM_URL?.trim() ||
  'https://apis-samsarawellness.in/v1/wellness-feedback/form';

/**
 * Builds the public wellness feedback page URL with a signed token.
 *
 * @param token - Signed JWT from share-link API.
 */
export function buildWellnessFeedbackUrl(token: string): string {
  const origin = CRM_PUBLIC_ORIGIN.replace(/\/$/, '');
  return `${origin}/wellness-feedback?token=${encodeURIComponent(token)}`;
}
