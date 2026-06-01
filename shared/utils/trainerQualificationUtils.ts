import {
  MAX_TRAINER_CERTIFICATION_ENTRIES,
  MAX_TRAINER_EDUCATION_ENTRIES,
  TrainerCertification,
  TrainerEducation,
} from '@/services/trainerService';

export { MAX_TRAINER_CERTIFICATION_ENTRIES, MAX_TRAINER_EDUCATION_ENTRIES };

type LegacyEducation = TrainerEducation | TrainerEducation[] | null | undefined;
type LegacyCertification = TrainerCertification | TrainerCertification[] | null | undefined;

/**
 * Whether an education entry has at least one populated field.
 *
 * @param entry - Education row to inspect.
 * @returns True when any field is non-empty.
 */
export function isEducationEntryFilled(entry: TrainerEducation | null | undefined): boolean {
  if (!entry) return false;
  return Boolean(
    (entry.qualification && entry.qualification.trim()) ||
      (entry.university && entry.university.trim()) ||
      entry.yearOfCompletion
  );
}

/**
 * Whether a certification entry has at least one populated field.
 *
 * @param entry - Certification row to inspect.
 * @returns True when any field is non-empty.
 */
export function isCertificationEntryFilled(
  entry: TrainerCertification | null | undefined
): boolean {
  if (!entry) return false;
  return Boolean(
    (entry.name && entry.name.trim()) ||
      (entry.institute && entry.institute.trim()) ||
      entry.year
  );
}

/**
 * Normalize education from legacy single object or array shape.
 *
 * @param value - Raw education value from API or form state.
 * @returns Normalized education array.
 */
export function normalizeEducationList(value: LegacyEducation): TrainerEducation[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return isEducationEntryFilled(value) ? [value] : [];
}

/**
 * Normalize certification from legacy single object or array shape.
 *
 * @param value - Raw certification value from API or form state.
 * @returns Normalized certification array.
 */
export function normalizeCertificationList(value: LegacyCertification): TrainerCertification[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return isCertificationEntryFilled(value) ? [value] : [];
}

/**
 * Return only filled education rows, capped at the allowed maximum.
 *
 * @param entries - Education rows from the form.
 * @returns Filtered education array for API submit.
 */
export function filterFilledEducationEntries(entries: TrainerEducation[] | undefined): TrainerEducation[] {
  return (entries || [])
    .filter(isEducationEntryFilled)
    .slice(0, MAX_TRAINER_EDUCATION_ENTRIES);
}

/**
 * Return only filled certification rows, capped at the allowed maximum.
 *
 * @param entries - Certification rows from the form.
 * @returns Filtered certification array for API submit.
 */
export function filterFilledCertificationEntries(
  entries: TrainerCertification[] | undefined
): TrainerCertification[] {
  return (entries || [])
    .filter(isCertificationEntryFilled)
    .slice(0, MAX_TRAINER_CERTIFICATION_ENTRIES);
}

/**
 * Create an empty education row for the add-entry form action.
 *
 * @returns Blank education object.
 */
export function createEmptyEducationEntry(): TrainerEducation {
  return {
    qualification: '',
    university: '',
    yearOfCompletion: null,
  };
}

/**
 * Create an empty certification row for the add-entry form action.
 *
 * @returns Blank certification object.
 */
export function createEmptyCertificationEntry(): TrainerCertification {
  return {
    name: '',
    institute: '',
    year: null,
  };
}
