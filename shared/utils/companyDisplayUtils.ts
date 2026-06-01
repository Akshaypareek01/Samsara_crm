import type { Booking } from '@/services/bookingService';
import type { Company } from '@/services/companyService';

/**
 * Returns populated company from a booking when available.
 *
 * @param booking - Booking record that may embed company.
 */
export function getBookingCompany(booking: Booking): Company | null {
    if (!booking.company || typeof booking.company === 'string') {
        return null;
    }
    return booking.company as Company;
}

/**
 * Resolves display name for a booking's company.
 *
 * @param booking - Booking record.
 * @param fallback - Label when company is not populated.
 */
export function getBookingCompanyName(booking: Booking, fallback = 'Company'): string {
    const company = getBookingCompany(booking);
    return company?.companyName?.trim() || fallback;
}

/**
 * Builds a single-line postal address from company fields.
 *
 * @param company - Company profile or null.
 */
export function formatCompanyAddress(company: Company | null): string {
    if (!company) return '—';
    const parts = [company.address, company.city, company.pincode, company.country].filter(
        (part) => typeof part === 'string' && part.trim().length > 0
    );
    return parts.length > 0 ? parts.join(', ') : '—';
}

/**
 * Company logo URL when set on the profile.
 *
 * @param company - Company profile or null.
 */
export function getCompanyLogoUrl(company: Company | null): string | null {
    const url = company?.companyLogo?.trim();
    return url || null;
}
