interface ApiWomensStat {
    label: string;
    value: string | number;
    change: string;
    changePositive: boolean;
    iconBg?: string;
    iconColor?: string;
}

/** One program slice under `wellness` */
interface ApiWellnessSection {
    stats?: { label: string; value: string; change?: string; changePositive?: boolean }[];
    participants?: unknown[];
    clients?: unknown[];
}

interface ApiRecentActivity {
    description?: string;
    timeAgo?: string;
    iconBg?: string;
    iconColor?: string;
}

export interface WellnessOverviewStat {
    label: string;
    value: string;
    change: string;
    changePositive: boolean;
    icon: string;
    iconBg: string;
    iconColor: string;
}

export interface WellnessProgramCard {
    title: string;
    subtitle: string;
    participants: number;
    completionRate: number;
    icon: string;
    iconBg: string;
    iconColor: string;
    href: string;
}

export interface NamedSlice {
    name: string;
    value: number;
    color: string;
}

export interface RecentActivityItem {
    text: string;
    time: string;
    iconBg: string;
    iconColor: string;
    icon: string;
}

const STAT_ICONS: Pick<WellnessOverviewStat, "icon" | "iconBg" | "iconColor">[] = [
    { icon: "ri-user-line", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { icon: "ri-pulse-line", iconBg: "bg-success/10", iconColor: "text-success" },
    { icon: "ri-checkbox-circle-line", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { icon: "ri-star-line", iconBg: "bg-warning/10", iconColor: "text-warning" },
];

const PROGRAM_META: Array<{
    key: keyof ApiWellnessPrograms;
    title: string;
    shortLabel: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    href: string;
}> = [
    {
        key: "yoga",
        title: "Yoga Programs",
        shortLabel: "Yoga",
        icon: "ri-mental-health-line",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        href: "/company/dashboard/wellness-program/yoga",
    },
    {
        key: "ayurveda",
        title: "Ayurveda Sessions",
        shortLabel: "Ayurveda",
        icon: "ri-heart-pulse-line",
        iconBg: "bg-success/10",
        iconColor: "text-success",
        href: "/company/dashboard/wellness-program/ayurveda",
    },
    {
        key: "meditation",
        title: "Meditation Classes",
        shortLabel: "Meditation",
        icon: "ri-map-pin-line",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        href: "/company/dashboard/wellness-program/meditation",
    },
    {
        key: "workshop",
        title: "Workshops",
        shortLabel: "Workshops",
        icon: "ri-group-line",
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
        href: "/company/dashboard/wellness-program/workshop",
    },
];

const PIE_COLORS = ["#3B82F6", "#10B981", "#F97316", "#EF4444"];

type ApiWellnessPrograms = {
    yoga?: ApiWellnessSection;
    ayurveda?: ApiWellnessSection;
    meditation?: ApiWellnessSection;
    workshop?: ApiWellnessSection;
};

/**
 * Parses numeric count from first wellness stat row (e.g. "Yoga bookings").
 */
function firstStatCount(section: ApiWellnessSection | undefined): number {
    const v = section?.stats?.[0]?.value;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Completed count is typically the third stat (index 2) for program sections.
 */
function completedCount(section: ApiWellnessSection | undefined): number {
    const v = section?.stats?.[2]?.value;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function rowCount(section: ApiWellnessSection | undefined): number {
    const rows = section?.participants ?? section?.clients ?? [];
    return Array.isArray(rows) ? rows.length : 0;
}

/**
 * Builds wellness landing page models from GET /companies/insights payload.
 *
 * @param bundle - Full insights JSON or null
 * @returns Mapped view models; callers merge with static defaults when fields are empty
 */
export function mapWellnessLandingFromInsights(bundle: Record<string, unknown> | null): {
    overviewStats: WellnessOverviewStat[];
    programCards: WellnessProgramCard[];
    programDistribution: NamedSlice[];
    activeParticipants: { name: string; value: number }[];
    recentActivity: RecentActivityItem[];
} {
    const womens = bundle?.womens as { stats?: ApiWomensStat[]; recentActivities?: ApiRecentActivity[] } | undefined;
    const wellness = bundle?.wellness as ApiWellnessPrograms | undefined;

    const overviewStats: WellnessOverviewStat[] = (womens?.stats || []).slice(0, 4).map((s, idx) => {
        const preset = STAT_ICONS[idx % STAT_ICONS.length];
        const iconBg =
            typeof s.iconBg === 'string' && s.iconBg.length > 0 ? s.iconBg : preset.iconBg;
        const iconColor =
            typeof s.iconColor === 'string' && s.iconColor.length > 0 ? s.iconColor : preset.iconColor;
        return {
            label: s.label,
            value: String(s.value ?? "—"),
            change: s.change || "",
            changePositive: s.changePositive !== false,
            icon: preset.icon,
            iconBg,
            iconColor,
        };
    });

    const programCards: WellnessProgramCard[] = PROGRAM_META.map((m) => {
        const sec = wellness?.[m.key];
        const bookings = firstStatCount(sec);
        const done = completedCount(sec);
        const participants = rowCount(sec) || bookings;
        const completionRate = bookings > 0 ? Math.round((done / bookings) * 100) : 0;
        return {
            title: m.title,
            subtitle: `${bookings} booking${bookings === 1 ? "" : "s"} · ${done} completed`,
            participants,
            completionRate,
            icon: m.icon,
            iconBg: m.iconBg,
            iconColor: m.iconColor,
            href: m.href,
        };
    });

    const counts = PROGRAM_META.map((m) => ({
        name: m.shortLabel,
        value: firstStatCount(wellness?.[m.key]),
    }));
    const sum = counts.reduce((a, c) => a + c.value, 0) || 1;
    const programDistribution: NamedSlice[] = counts.map((c, i) => ({
        name: c.name,
        value: Math.round((c.value / sum) * 100),
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    const activeParticipants = counts.map((c, i) => ({
        name: PROGRAM_META[i].title,
        value: c.value,
    }));

    const recentActivity: RecentActivityItem[] = (womens?.recentActivities || []).slice(0, 8).map((a) => ({
        text: a.description || "Activity",
        time: a.timeAgo || "—",
        iconBg: a.iconBg || "bg-primary/10",
        iconColor: a.iconColor || "text-primary",
        icon: "ri-calendar-check-line",
    }));

    return { overviewStats, programCards, programDistribution, activeParticipants, recentActivity };
}

/** Max value for progress bars under the pie chart */
export function maxParticipantValue(items: { value: number }[]): number {
    const m = Math.max(1, ...items.map((i) => i.value));
    return m;
}

/** True if string is a hex color (for inline styles from API payloads). */
export function isHexColor(s: string): boolean {
    return /^#[0-9A-Fa-f]{3,8}$/.test(String(s).trim());
}
