import type { Booking, BookingSession, EapTrainingRef } from '@/services/bookingService';
import type { Trainer } from '@/services/trainerService';
import { getTrainerIdFromRef } from '@/shared/utils/bookingTrainerUtils';

export type TrainerSessionStatus = 'pending' | 'approved' | 'rejected';

/** Normalized session row from a booking. */
export interface BookingSessionView {
    trainer: string | Trainer;
    startTime: string;
    duration: number;
    typeOfTraining: string[];
    eapTraining?: string;
    trainerStatus?: TrainerSessionStatus;
    trainerNotes?: string;
    approvedAt?: string;
}

/**
 * Resolve EAP training id from string or populated ref.
 *
 * @param eapTraining - EAP training reference from a booking session.
 */
function normalizeEapTrainingId(
    eapTraining?: string | EapTrainingRef | null
): string | undefined {
    if (!eapTraining) return undefined;
    if (typeof eapTraining === 'string') return eapTraining;
    return eapTraining._id || eapTraining.id;
}

/**
 * Map a raw booking session to the normalized view shape.
 *
 * @param session - Booking session from API payload.
 */
function toBookingSessionView(session: BookingSession): BookingSessionView {
    return {
        trainer: session.trainer,
        startTime: session.startTime,
        duration: session.duration,
        typeOfTraining: session.typeOfTraining || [],
        eapTraining: normalizeEapTrainingId(session.eapTraining),
        trainerStatus: session.trainerStatus,
        trainerNotes: session.trainerNotes,
        approvedAt: session.approvedAt,
    };
}

/**
 * Normalize legacy or multi-session booking into sessions array.
 *
 * @param booking - Booking record.
 * @returns Session rows.
 */
export function getBookingSessions(booking: Booking): BookingSessionView[] {
    if (Array.isArray(booking.sessions) && booking.sessions.length > 0) {
        return booking.sessions.map(toBookingSessionView);
    }

    if (booking.trainer && booking.startTime && booking.duration) {
        const trainerStatus: TrainerSessionStatus =
            booking.status === 'approved' ||
            booking.status === 'confirmed' ||
            booking.status === 'completed'
                ? 'approved'
                : booking.status === 'rejected'
                  ? 'rejected'
                  : 'pending';

        return [
            toBookingSessionView({
                trainer: booking.trainer,
                startTime: booking.startTime,
                duration: booking.duration,
                typeOfTraining: booking.typeOfTraining || [],
                eapTraining: booking.eapTraining,
                trainerStatus,
                trainerNotes: booking.trainerNotes,
            }),
        ];
    }

    return [];
}

/**
 * Count sessions and unique trainers in a booking.
 *
 * @param booking - Booking record.
 */
export function getBookingSessionSummary(booking: Booking): {
    sessionCount: number;
    trainerCount: number;
    label: string;
} {
    const sessions = getBookingSessions(booking);
    const trainerIds = new Set(
        sessions.map((s) => getTrainerIdFromRef(s.trainer)).filter(Boolean) as string[]
    );
    const sessionCount = sessions.length;
    const trainerCount = trainerIds.size || 1;

    if (sessionCount <= 1) {
        return { sessionCount: 1, trainerCount: 1, label: '1 session' };
    }

    return {
        sessionCount,
        trainerCount,
        label: `${sessionCount} sessions · ${trainerCount} trainer${trainerCount === 1 ? '' : 's'}`,
    };
}

/**
 * Trainer approval progress for multi-session bookings.
 *
 * @param booking - Booking record.
 */
export function getTrainerApprovalProgress(booking: Booking): {
    approved: number;
    total: number;
    pending: number;
    rejected: number;
} {
    const sessions = getBookingSessions(booking);
    const total = sessions.length;
    const approved = sessions.filter((s) => s.trainerStatus === 'approved').length;
    const pending = sessions.filter((s) => s.trainerStatus === 'pending' || !s.trainerStatus).length;
    const rejected = sessions.filter((s) => s.trainerStatus === 'rejected').length;
    return { approved, total, pending, rejected };
}

/**
 * Resolve trainer display names for a booking.
 *
 * @param booking - Booking record.
 */
export function getBookingTrainerNames(booking: Booking): string[] {
    const sessions = getBookingSessions(booking);
    const names = sessions.map((s) => {
        if (typeof s.trainer === 'object' && s.trainer?.name) {
            return s.trainer.name;
        }
        return 'Trainer';
    });
    return [...new Set(names)];
}

/**
 * Build a short trainers label for list views.
 *
 * @param booking - Booking record.
 */
export function getBookingTrainersLabel(booking: Booking, fallback = 'Trainer'): string {
    const names = getBookingTrainerNames(booking);
    if (names.length === 0) return fallback;
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names[0]} +${names.length - 1} more`;
}

/**
 * Find the session assigned to a trainer in a booking.
 *
 * @param booking - Booking record.
 * @param trainerId - Trainer id.
 */
export function getTrainerSessionInBooking(
    booking: Booking,
    trainerId: string
): BookingSessionView | null {
    const tid = String(trainerId);
    return (
        getBookingSessions(booking).find(
            (s) => getTrainerIdFromRef(s.trainer) === tid
        ) || null
    );
}

/**
 * Whether a trainer can act on their session (approve/reject).
 *
 * @param booking - Booking record.
 * @param trainerId - Trainer id.
 */
export function canTrainerActOnSession(booking: Booking, trainerId: string): boolean {
    if (!['pending_approval', 'approved'].includes(booking.status)) return false;
    const session = getTrainerSessionInBooking(booking, trainerId);
    return session?.trainerStatus === 'pending' || !session?.trainerStatus;
}
