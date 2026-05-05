/** Browser event so trainer header + profile stay in sync after toggling booking availability. */
export const TRAINER_ACCEPTING_BOOKINGS_EVENT = "samsara:trainer-accepting-bookings";

export type TrainerAcceptingBookingsDetail = { acceptingBookings: boolean };

/**
 * Broadcasts latest `acceptingBookings` to other trainer dashboard UI (e.g. header).
 *
 * @param acceptingBookings - Whether new company bookings are accepted.
 */
export function broadcastTrainerAcceptingBookings(acceptingBookings: boolean): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent<TrainerAcceptingBookingsDetail>(TRAINER_ACCEPTING_BOOKINGS_EVENT, {
            detail: { acceptingBookings },
        })
    );
}
