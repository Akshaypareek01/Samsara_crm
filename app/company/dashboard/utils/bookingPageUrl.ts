/**
 * Builds the company multi-session booking page URL.
 *
 * @param trainerId - Optional trainer to pre-select on the first session.
 * @param returnTo - Internal path after successful booking or cancel.
 */
export function bookingNewPageUrl(trainerId?: string, returnTo?: string): string {
    const path = '/company/dashboard/bookings/new';
    const params = new URLSearchParams();
    if (trainerId) params.set('trainerId', trainerId);
    if (returnTo) params.set('returnTo', returnTo);
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
}

/**
 * Validates return URL for booking flow navigation.
 *
 * @param value - Raw `returnTo` query param.
 * @param fallback - Default path when invalid.
 */
export function safeBookingReturnTo(
    value: string | null | undefined,
    fallback = '/company/dashboard/bookings'
): string {
    if (value && value.startsWith('/company/') && !value.startsWith('//')) {
        return value;
    }
    return fallback;
}
