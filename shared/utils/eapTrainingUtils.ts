import type { Booking, EapTrainingRef } from "@/services/bookingService";
import type { EapDurationHours, EapSyllabusEntry, EapTraining } from "@/services/eapTrainingService";

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

/**
 * Human-readable session label for a duration option.
 *
 * @param hours - Session length in hours.
 */
export function formatEapSessionDurationLabel(hours: EapDurationHours | number): string {
  const n = Number(hours);
  return `${n} Hour${n === 1 ? "" : "s"} Session`;
}

/**
 * Syllabus entries ordered by the training's durationOptions list.
 *
 * @param training - EAP training program.
 */
export function getOrderedEapSyllabusEntries(training: EapTraining): EapSyllabusEntry[] {
  return (training.durationOptions || [])
    .map((hours) => training.syllabus?.find((entry) => entry.durationHours === hours))
    .filter((entry): entry is EapSyllabusEntry => Boolean(entry));
}
