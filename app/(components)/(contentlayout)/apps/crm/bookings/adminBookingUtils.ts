import type { Booking } from "@/services/bookingService";
import { getBookingCompany, getBookingCompanyName } from "@/shared/utils/companyDisplayUtils";
import { getBookingTrainer, getBookingTrainerName } from "@/shared/utils/bookingTrainerUtils";
import { getBookingSessions } from "@/shared/utils/bookingSessionUtils";

/**
 * Resolves a MongoDB id from a populated or string ref.
 *
 * @param ref - Entity reference from a booking payload.
 */
export function getEntityId(
    ref: string | { _id?: string; id?: string } | null | undefined
): string | null {
    if (!ref) return null;
    if (typeof ref === "string") return ref;
    return ref._id || ref.id || null;
}

/**
 * Company id on a booking row.
 *
 * @param booking - Booking record.
 */
export function getBookingCompanyId(booking: Booking): string | null {
    return getEntityId(booking.company);
}

/**
 * Trainer id on a booking row.
 *
 * @param booking - Booking record.
 */
export function getBookingTrainerId(booking: Booking): string | null {
    return getEntityId(booking.trainer);
}

export { getBookingCompany, getBookingCompanyName, getBookingTrainer, getBookingTrainerName };

/**
 * Whether payment is recorded on a booking (handles legacy string or object shapes).
 *
 * @param booking - Booking record.
 */
export { isBookingPaid } from "@/shared/utils/bookingSessionUtils";

/**
 * Whether a session has recorded company payment.
 *
 * @param session - Session row from a booking.
 */
export { isSessionPaid } from "@/shared/utils/bookingSessionUtils";

/**
 * Sum of confirmed session payment amounts on a booking.
 *
 * @param booking - Booking record.
 */
export function getBookingSessionPaymentTotal(booking: Booking): number {
    const sessions = getBookingSessions(booking);
    const sessionTotal = sessions.reduce((sum, session) => sum + (session.paymentAmount || 0), 0);
    if (sessionTotal > 0) return sessionTotal;
    return typeof booking.paymentAmount === "number" ? booking.paymentAmount : 0;
}
