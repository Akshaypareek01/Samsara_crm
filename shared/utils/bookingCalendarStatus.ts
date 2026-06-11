import type { BookingStatus } from '@/services/bookingService';

/** Calendar dot colors keyed by booking status. */
export const BOOKING_STATUS_DOT: Record<string, string> = {
  confirmed: '#22C55E',
  approved: '#3B82F6',
  completed: '#6366F1',
  pending_approval: '#F59E0B',
  cancelled: '#9CA3AF',
  rejected: '#EF4444',
};

/** Legend entries for company booking calendar. */
export const COMPANY_CALENDAR_LEGEND = [
  { label: 'Confirmed (shows time)', color: BOOKING_STATUS_DOT.confirmed },
  { label: 'Pending admin approval', color: BOOKING_STATUS_DOT.approved },
  { label: 'Pending trainer approval', color: BOOKING_STATUS_DOT.pending_approval },
] as const;

/** Legend entries for trainer booking calendar. */
export const TRAINER_CALENDAR_LEGEND = [
  { label: 'Confirmed (shows time)', color: BOOKING_STATUS_DOT.confirmed },
  { label: 'Pending admin', color: BOOKING_STATUS_DOT.approved },
  { label: 'Needs your accept', color: BOOKING_STATUS_DOT.pending_approval },
] as const;

/**
 * Resolve dot color for a booking status on calendar grids.
 *
 * @param status - Booking status value.
 */
export function getBookingStatusDotColor(status: BookingStatus | string): string {
  return BOOKING_STATUS_DOT[status] ?? '#9CA3AF';
}
