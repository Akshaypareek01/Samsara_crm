// ============================================================
// STATIC DATA LAYER — reports-analytics.data.ts
// ─────────────────────────────────────────────────────────────
// All data lives here. When APIs are ready, replace each
// function body with a fetch() call. The UI imports ONLY
// these functions, so zero component edits will be needed.
// ============================================================

import { getCompanyInsightsBundle } from '@/services/companyInsightsClient';

/**
 * Reads `reports` payload from cached GET /companies/insights.
 */
async function reportsFromInsights(): Promise<Record<string, unknown> | undefined> {
    try {
        const bundle = await getCompanyInsightsBundle();
        return bundle?.reports as Record<string, unknown> | undefined;
    } catch (err) {
        console.error('reportsFromInsights:', err);
        return undefined;
    }
}

const MONTHS_ZERO_TREND: WellnessTrendPoint[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => ({
    month,
    avgScore: 0,
    participation: 0,
    goal: 80,
}));

const ZERO_SCORE_DISTRIBUTION: ScoreDistribution[] = [
    { label: 'Excellent (75-100)', count: 0, color: '#10B981' },
    { label: 'Good (60-74)', count: 0, color: '#F97316' },
    { label: 'Fair (50-59)', count: 0, color: '#EAB308' },
    { label: 'At Risk (<50)', count: 0, color: '#EF4444' },
];

// ─── Types ───────────────────────────────────────────────────

export type FilterPeriod = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface WellnessTrendPoint {
    month: string;
    avgScore: number;
    participation: number;
    goal: number;
}

export interface ScoreDistribution {
    label: string;
    count: number;
    color: string;
}

export interface OverviewStat {
    label: string;
    value: string;
    change: string;
    changePositive: boolean;
    iconBg: string;
    iconColor: string;
    icon: string; // boxicons class e.g. 'bx-user'
}

export interface WellnessPillar {
    id: string;
    title: string;
    participants: number;
    overallPct: number;
    overallColor: string;
    iconBg: string;
    iconColor: string;
    icon: string;
    metrics: { label: string; value: number }[];
    improvement: string;
    improvementPositive: boolean;
}

export interface EmployeeWellnessRow {
    empId: string;
    name: string;
    role: string;
    score: number;
    change: number;
    streak: string;
    status: 'Excellent' | 'Good' | 'Fair' | 'At Risk';
}

export interface TopPerformer {
    rank: number;
    name: string;
    role: string;
    score: number;
    rankColor: string;
}

export interface EngagementCard {
    id: string;
    title: string;
    valuePct: string;
    progressColor: string;
    iconBg: string;
    iconColor: string;
    icon: string;
    metrics: { label: string; value: string }[];
    improvement: string;
    improvementPositive: boolean;
}

// ─── Banner ──────────────────────────────────────────────────

export interface BannerData {
    message: string;
    highlight: string;
    subtext: string;
}

export async function getBannerData(): Promise<BannerData> {
    const r = await reportsFromInsights();
    const banner = r?.banner as { titleLines?: string[]; highlightWord?: string; subtitle?: string } | undefined;
    if (banner?.subtitle) {
        return {
            message: (banner.titleLines || ['Wellness intelligence']).join(' · '),
            highlight: banner.highlightWord || 'Overview',
            subtext: banner.subtitle,
        };
    }
    return {
        message: 'No booking data yet',
        highlight: '—',
        subtext: 'Reports will populate once your company has completed sessions in the system.',
    };
}

// ─── Wellness Trend Chart ────────────────────────────────────

export async function getWellnessTrend(_period: FilterPeriod): Promise<WellnessTrendPoint[]> {
    const r = await reportsFromInsights();
    const api = r?.wellnessTrend as WellnessTrendPoint[] | undefined;
    if (api?.length) return api;
    return MONTHS_ZERO_TREND;
}

// ─── Score Distribution ──────────────────────────────────────

export async function getScoreDistribution(): Promise<ScoreDistribution[]> {
    const r = await reportsFromInsights();
    const api = r?.scoreDistribution as ScoreDistribution[] | undefined;
    if (api?.length) return api;
    return ZERO_SCORE_DISTRIBUTION;
}

export async function getScoreDistributionTotal(): Promise<number> {
    const r = await reportsFromInsights();
    const n = r?.scoreDistributionTotal;
    if (typeof n === 'number' && !Number.isNaN(n)) return n;
    return 0;
}

// ─── Overview Stats ──────────────────────────────────────────

export async function getOverviewStats(): Promise<OverviewStat[]> {
    const r = await reportsFromInsights();
    const api = r?.overviewStats as OverviewStat[] | undefined;
    if (api?.length) return api;
    return [];
}

// ─── Wellness Pillars ────────────────────────────────────────

export async function getWellnessPillars(): Promise<WellnessPillar[]> {
    const r = await reportsFromInsights();
    const api = r?.wellnessPillars as WellnessPillar[] | undefined;
    if (api?.length) return api;
    return [];
}

// ─── Employee Wellness Table ──────────────────────────────────

export async function getEmployeeWellnessRows(): Promise<EmployeeWellnessRow[]> {
    const r = await reportsFromInsights();
    const raw = r?.employeeWellnessRows as EmployeeWellnessRow[] | undefined;
    if (raw?.length) {
        return raw.filter((row): row is EmployeeWellnessRow =>
            Boolean(row?.name && row?.empId && typeof row.score === 'number')
        );
    }
    return [];
}

// ─── Top Performers ──────────────────────────────────────────

export async function getTopPerformers(): Promise<TopPerformer[]> {
    const r = await reportsFromInsights();
    const api = r?.topPerformers as TopPerformer[] | undefined;
    if (api?.length) return api;
    return [];
}

// ─── Engagement Cards (bottom section) ───────────────────────

export async function getEngagementCards(): Promise<EngagementCard[]> {
    const r = await reportsFromInsights();
    const api = r?.engagementCards as EngagementCard[] | undefined;
    if (api?.length) return api;
    return [];
}