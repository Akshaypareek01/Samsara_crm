import type { Booking, EapTrainingRef } from "@/services/bookingService";

/**
 * Resolve populated EAP training from a booking record.
 *
 * @param booking - Booking with optional populated eapTraining.
 */
export function getBookingEapTraining(booking: Booking | null | undefined): EapTrainingRef | null {
  if (!booking?.eapTraining) return null;
  if (typeof booking.eapTraining === "object") return booking.eapTraining;
  return null;
}

/**
 * Syllabus points for the booked duration on an EAP training.
 *
 * @param training - Populated EAP training ref.
 * @param durationHours - Booked session duration.
 */
export function getEapSyllabusPointsForDuration(
  training: EapTrainingRef | null,
  durationHours: number
): string[] {
  if (!training?.syllabus?.length) return [];
  const entry = training.syllabus.find((s) => s.durationHours === durationHours);
  return entry?.points ?? [];
}
