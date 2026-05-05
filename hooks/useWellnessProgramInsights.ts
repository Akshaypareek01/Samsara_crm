"use client";

import { useEffect, useState } from "react";
import { getCompanyInsightsBundle, COMPANY_DATA_BUST_EVENT } from "@/services/companyInsightsClient";

export type WellnessProgramKey = "yoga" | "ayurveda" | "meditation" | "workshop";

/** Table row shape from `wellness.*` in GET /companies/insights */
export interface InsightsWellnessTableRow {
    id: number;
    name: string;
    email: string;
    initials: string;
    workshop: string;
    workshopColor: string;
    registrationDate: string;
    sessionsAttended: string;
    attendance: number;
    attendanceColor: string;
    status: string;
    statusColor: string;
}

export interface InsightsWellnessSection {
    stats: Record<string, unknown>[];
    rows: InsightsWellnessTableRow[];
}

/**
 * Fetches cached company insights and returns the wellness slice for one program (bookings-derived).
 *
 * @param program - Wellness module key under `insights.wellness`
 * @returns Stats + rows, or null if the bundle is missing or empty for that section
 */
export function useWellnessProgramInsights(program: WellnessProgramKey): InsightsWellnessSection | null {
    const [block, setBlock] = useState<InsightsWellnessSection | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const bundle = await getCompanyInsightsBundle();
            const wellness = bundle?.wellness as
                | Record<
                      string,
                      {
                          stats?: Record<string, unknown>[];
                          participants?: InsightsWellnessTableRow[];
                          clients?: InsightsWellnessTableRow[];
                      }
                  >
                | undefined;
            const section = wellness?.[program];
            if (!section?.stats?.length) {
                if (!cancelled) setBlock(null);
                return;
            }
            const rows =
                program === "yoga" || program === "workshop"
                    ? section.participants ?? []
                    : section.clients ?? [];
            if (!cancelled) {
                setBlock({ stats: section.stats, rows });
            }
        };

        void load();
        const onBust = () => {
            void load();
        };
        if (typeof window !== "undefined") {
            window.addEventListener(COMPANY_DATA_BUST_EVENT, onBust);
        }
        return () => {
            cancelled = true;
            if (typeof window !== "undefined") {
                window.removeEventListener(COMPANY_DATA_BUST_EVENT, onBust);
            }
        };
    }, [program]);

    return block;
}

const LEVEL_COLOR: Record<string, string> = {
    beginner: "bg-warning/10 text-warning",
    intermediate: "bg-primary/10 text-primary",
    advanced: "bg-purple-100 text-purple-600",
    general: "bg-primary/10 text-primary",
};

/**
 * Maps an insights row to the yoga participants table shape (level derived from training tags).
 */
export function mapInsightsRowToYogaParticipant(row: InsightsWellnessTableRow) {
    const raw = (row.workshop || "General").split(",")[0]?.trim() || "General";
    const levelKey = raw.toLowerCase();
    let level = "General";
    if (levelKey.includes("begin")) level = "Beginner";
    else if (levelKey.includes("inter") || levelKey.includes("mid")) level = "Intermediate";
    else if (levelKey.includes("adv")) level = "Advanced";
    else if (raw.length > 1 && raw.length < 40) level = raw.slice(0, 32);

    const levelColor =
        level === "Beginner"
            ? LEVEL_COLOR.beginner
            : level === "Intermediate"
              ? LEVEL_COLOR.intermediate
              : level === "Advanced"
                ? LEVEL_COLOR.advanced
                : LEVEL_COLOR.general;

    return {
        id: row.id,
        name: row.name.replace(/^Session with\s+/i, "").trim() || row.name,
        email: row.email === "—" ? "" : row.email,
        initials: row.initials,
        level,
        levelColor,
        sessionsAttended: row.sessionsAttended,
        attendance: row.attendance,
        attendanceColor: row.attendanceColor,
        progress: row.status,
        progressColor: row.statusColor,
    };
}

/**
 * Maps an insights row to the ayurveda clients table shape.
 */
export function mapInsightsRowToAyurvedaClient(row: InsightsWellnessTableRow) {
    return {
        id: row.id,
        name: row.name.replace(/^Session with\s+/i, "").trim() || row.name,
        email: row.email === "—" ? "" : row.email,
        initials: row.initials,
        treatmentPlan: row.workshop.split(",")[0]?.trim() || row.workshop,
        treatmentColor: row.workshopColor,
        consultationHistory: row.sessionsAttended,
        nextAppointment: row.registrationDate,
        attendance: row.attendance,
        attendanceColor: row.attendanceColor,
        progress: row.status,
        progressColor: row.statusColor,
    };
}

/**
 * Maps an insights row to the meditation clients table shape.
 */
export function mapInsightsRowToMeditationClient(row: InsightsWellnessTableRow) {
    return {
        id: row.id,
        name: row.name.replace(/^Session with\s+/i, "").trim() || row.name,
        email: row.email === "—" ? "" : row.email,
        initials: row.initials,
        treatmentPlan: row.workshop.split(",")[0]?.trim() || row.workshop,
        treatmentColor: row.workshopColor,
        sessionsAttended: row.sessionsAttended,
        registrationDate: row.registrationDate,
        attendance: row.attendance,
        attendanceColor: row.attendanceColor,
        progress: row.status,
        progressColor: row.statusColor,
    };
}
