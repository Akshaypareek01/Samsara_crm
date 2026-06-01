import type { Booking } from "@/services/bookingService";
import { getBookingCompany, getBookingCompanyName } from "@/shared/utils/companyDisplayUtils";
import { getBookingTrainer, getBookingTrainerName } from "@/shared/utils/bookingTrainerUtils";

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
export function isBookingPaid(booking: Booking): boolean {
    const ps = booking.paymentStatus as unknown;
    if (!ps) return false;
    if (typeof ps === "string") return ps === "confirmed";
    if (typeof ps === "object" && ps !== null && "isPaid" in ps) {
        return Boolean((ps as { isPaid?: boolean }).isPaid);
    }
    return false;
}
