import type { Booking, EapTrainingRef } from "@/services/bookingService";

/** Allowed EAP session durations in hours (24 = 1 day). */
export const EAP_DURATION_OPTIONS = [1, 2, 4, 24] as const;

export type EapDurationHours = (typeof EAP_DURATION_OPTIONS)[number];

export interface EapSyllabusEntry {
  durationHours: EapDurationHours;
  description: string;
}

/** Minimal training shape for syllabus helpers. */
export interface EapTrainingSyllabusSource {
  syllabus?: Array<EapSyllabusEntry & { points?: string[] }>;
  durationOptions?: number[];
}

/** Legacy duration value stored before 1-day migration. */
export const LEGACY_EAP_ONE_DAY_HOURS = 6;

/** Syllabus entry that may still carry legacy bullet points from older records. */
export type EapSyllabusEntryLike = EapSyllabusEntry & { points?: string[] };

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
 * Normalize legacy duration hours (6 → 24 for former "6 hrs" option).
 *
 * @param hours - Raw duration in hours.
 */
export function normalizeEapDurationHours(hours: number): EapDurationHours {
  if (hours === LEGACY_EAP_ONE_DAY_HOURS) return 24;
  return hours as EapDurationHours;
}

/**
 * Human-readable short label for a duration chip or badge.
 *
 * @param hours - Session length in hours.
 */
export function formatEapDurationLabel(hours: EapDurationHours | number): string {
  const n = normalizeEapDurationHours(Number(hours));
  if (n === 24) return "1 day";
  return `${n} hr${n === 1 ? "" : "s"}`;
}

/**
 * Human-readable session label for a duration option card.
 *
 * @param hours - Session length in hours.
 */
export function formatEapSessionDurationLabel(hours: EapDurationHours | number): string {
  const n = normalizeEapDurationHours(Number(hours));
  if (n === 24) return "1 Day Session";
  return `${n} Hour${n === 1 ? "" : "s"} Session`;
}

/**
 * Extract syllabus description from an entry, including legacy points arrays.
 *
 * @param entry - Syllabus entry from API or form state.
 */
export function getSyllabusEntryDescription(entry: EapSyllabusEntryLike | null | undefined): string {
  if (!entry) return "";
  const description = String(entry.description ?? "").trim();
  if (description) return description;
  return (entry.points ?? []).map((p) => String(p).trim()).filter(Boolean).join("\n");
}

/**
 * Syllabus description for the booked duration on an EAP training.
 *
 * @param training - Populated EAP training ref.
 * @param durationHours - Booked session duration.
 */
export function getEapSyllabusDescriptionForDuration(
  training: EapTrainingRef | EapTrainingSyllabusSource | null,
  durationHours: number
): string {
  if (!training?.syllabus?.length) return "";
  const normalized = normalizeEapDurationHours(durationHours);
  const entry =
    training.syllabus.find((s) => s.durationHours === normalized) ??
    training.syllabus.find((s) => s.durationHours === durationHours);
  return getSyllabusEntryDescription(entry as EapSyllabusEntryLike);
}

/**
 * @deprecated Use getEapSyllabusDescriptionForDuration instead.
 */
export function getEapSyllabusPointsForDuration(
  training: EapTrainingRef | null,
  durationHours: number
): string[] {
  const description = getEapSyllabusDescriptionForDuration(training, durationHours);
  if (!description) return [];
  return description.split("\n").filter(Boolean);
}

/**
 * Syllabus entries ordered by the training's durationOptions list.
 *
 * @param training - EAP training program.
 */
export function getOrderedEapSyllabusEntries(training: EapTrainingSyllabusSource): EapSyllabusEntry[] {
  return (training.durationOptions || [])
    .map((hours) => training.syllabus?.find((entry) => entry.durationHours === hours))
    .filter((entry): entry is EapSyllabusEntry => Boolean(entry))
    .map((entry) => ({
      durationHours: normalizeEapDurationHours(entry.durationHours),
      description: getSyllabusEntryDescription(entry as EapSyllabusEntryLike),
    }));
}
