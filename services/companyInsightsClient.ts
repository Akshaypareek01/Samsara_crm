import ApiService from "./ApiService";

let insightsCache: Record<string, unknown> | null = null;
let insightsCacheAt = 0;
const INSIGHTS_TTL_MS = 45_000;

/** Window event name: other hooks/pages listen to refetch company-scoped analytics. */
export const COMPANY_DATA_BUST_EVENT = "samsara-company-data-bust";

/**
 * Cached GET /companies/insights for client-side data layers.
 */
export async function getCompanyInsightsBundle(): Promise<Record<string, unknown> | null> {
    if (insightsCache && Date.now() - insightsCacheAt < INSIGHTS_TTL_MS) {
        return insightsCache;
    }
    try {
        insightsCache = (await ApiService.get("/companies/insights")) as Record<string, unknown>;
        insightsCacheAt = Date.now();
        return insightsCache;
    } catch {
        return null;
    }
}

/**
 * Invalidate cached insights (e.g. after booking mutation).
 */
export function clearCompanyInsightsCache(): void {
    insightsCache = null;
    insightsCacheAt = 0;
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(COMPANY_DATA_BUST_EVENT));
    }
}
