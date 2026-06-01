import type { Booking } from "@/services/bookingService";
import type { Trainer } from "@/services/trainerService";

/**
 * Returns populated trainer from a booking when available.
 *
 * @param booking - Booking that may embed trainer.
 */
export function getBookingTrainer(booking: Booking): Trainer | null {
    if (!booking.trainer || typeof booking.trainer === "string") {
        return null;
    }
    return booking.trainer as Trainer;
}

/**
 * Resolves trainer MongoDB id from a booking trainer ref.
 *
 * @param trainer - Populated trainer or id string.
 */
export function getTrainerIdFromRef(
    trainer: Booking["trainer"] | string | null | undefined
): string | null {
    if (!trainer) return null;
    if (typeof trainer === "string") return trainer;
    return trainer._id || trainer.id || null;
}

/**
 * Resolves display name for a booking's trainer.
 *
 * @param booking - Booking record.
 * @param fallback - Label when trainer is not populated.
 */
export function getBookingTrainerName(booking: Booking, fallback = "Trainer"): string {
    const trainer = getBookingTrainer(booking);
    return trainer?.name?.trim() || fallback;
}

/**
 * Trainer profile photo URL when set on the profile.
 *
 * @param trainer - Trainer profile or null.
 */
export function getTrainerProfilePhotoUrl(trainer: Trainer | null): string | null {
    const path = trainer?.profilePhoto?.path?.trim();
    return path || null;
}

/**
 * Builds a short location line from trainer city / pin code.
 *
 * @param trainer - Trainer profile or null.
 */
export function formatTrainerLocation(trainer: Trainer | null): string {
    if (!trainer) return "—";
    const parts = [trainer.city, trainer.pinCode].filter(
        (part) => typeof part === "string" && part.trim().length > 0
    ) as string[];
    return parts.length > 0 ? parts.join(", ") : "—";
}
