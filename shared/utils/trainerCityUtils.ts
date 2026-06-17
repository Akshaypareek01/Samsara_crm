/**
 * Normalize trainer cities from API payloads (supports legacy single `city` field).
 *
 * @param trainer - Trainer-like object with `cities` and/or legacy `city`.
 * @returns Deduplicated list of non-empty city names.
 */
export function normalizeTrainerCities(
  trainer: { cities?: string[] | null; city?: string | null } | null | undefined
): string[] {
  if (!trainer) return [];

  const fromArray = Array.isArray(trainer.cities)
    ? trainer.cities.map((c) => String(c).trim()).filter(Boolean)
    : [];

  if (fromArray.length > 0) {
    return Array.from(new Set(fromArray));
  }

  const legacy = trainer.city?.trim();
  return legacy ? [legacy] : [];
}

/**
 * Format trainer cities for display in cards and profile panels.
 *
 * @param cities - City names to join.
 * @returns Comma-separated label or empty string when none.
 */
export function formatTrainerCities(cities: string[]): string {
  const unique = Array.from(new Set(cities.map((c) => c.trim()).filter(Boolean)));
  return unique.join(', ');
}

/**
 * Display line for trainer location from cities (and optional pin code).
 *
 * @param trainer - Trainer-like object with cities and optional pinCode.
 * @returns Location string or null when no cities.
 */
export function trainerCitiesDisplayLine(
  trainer: { cities?: string[] | null; city?: string | null; pinCode?: string | null } | null | undefined
): string | null {
  const cities = formatTrainerCities(normalizeTrainerCities(trainer));
  if (!cities) return null;

  const pin = trainer?.pinCode?.trim();
  return pin ? `${cities} · ${pin}` : cities;
}
