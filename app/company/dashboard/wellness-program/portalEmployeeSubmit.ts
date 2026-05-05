import companyService from "@/services/companyService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";

/**
 * Maps wellness UI level labels to portal API enum values.
 */
export function uiLevelToApi(level: string): "beginner" | "intermediate" | "advanced" {
    if (level === "Intermediate") return "intermediate";
    if (level === "Advanced") return "advanced";
    return "beginner";
}

/**
 * Creates a company employee via the portal API and busts cached insights so dashboards refetch.
 */
export async function submitPortalEmployee(opts: {
    fullName: string;
    email: string;
    levelLabel: string;
    department?: string;
}): Promise<Record<string, unknown>> {
    const created = await companyService.createPortalEmployee({
        fullName: opts.fullName.trim(),
        email: opts.email.trim().toLowerCase(),
        level: uiLevelToApi(opts.levelLabel),
        department: (opts.department?.trim() || "Wellness").slice(0, 200),
        status: true,
    });
    clearCompanyInsightsCache();
    return created as Record<string, unknown>;
}
