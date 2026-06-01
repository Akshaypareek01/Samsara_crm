import type { Trainer } from "@/services/trainerService";

/**
 * Normalizes specialist-in values to a string array.
 *
 * @param value - Trainer specialist field.
 */
export function trainerSpecialistList(value: Trainer["specialistIn"]): string[] {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
}

/**
 * Normalizes training-type values to a string array.
 *
 * @param value - Trainer training types field.
 */
export function trainerTrainingList(value: Trainer["typeOfTraining"]): string[] {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
}

/**
 * Training types selectable when booking a trainer.
 * Uses the trainer's saved specializations (including legacy labels), not a filtered catalog.
 *
 * @param trainer - Trainer record or null.
 */
export function getTrainerBookableTrainingTypes(
    trainer: Pick<Trainer, "typeOfTraining"> | null | undefined
): string[] {
    if (!trainer) return [];
    return trainerTrainingList(trainer.typeOfTraining);
}

/**
 * Formats a display value or returns a fallback em dash.
 *
 * @param value - Raw field value.
 */
export function displayOrDash(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "—";
    const s = String(value).trim();
    return s.length > 0 ? s : "—";
}

/**
 * Formats ISO date of birth for display.
 *
 * @param iso - Date string from API.
 */
export function formatTrainerDob(iso?: string | null): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return iso;
    }
}
