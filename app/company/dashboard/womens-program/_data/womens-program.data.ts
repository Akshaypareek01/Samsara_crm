// ============================================================
// STATIC DATA LAYER — womens-program.data.ts
// ─────────────────────────────────────────────────────────────
// All data lives here. When APIs are ready, replace each
// function body with a fetch() call. The UI imports ONLY
// these functions, so zero component edits will be needed.
// ============================================================

import { getCompanyInsightsBundle } from '@/services/companyInsightsClient';

async function womensFromApi(): Promise<Record<string, unknown> | null> {
    const bundle = await getCompanyInsightsBundle();
    const w = bundle?.womens as Record<string, unknown> | undefined;
    return w || null;
}

/** Zeroed stat cards — same labels as live insights when there is no bundle. */
function zeroStatCards(labels: string[]): StatCard[] {
    return labels.map((label) => ({
        label,
        value: 0,
        change: '—',
        changePositive: true,
        iconBg: '#F3F4F6',
        iconColor: '#9CA3AF',
    }));
}

const EMPTY_WOMENS_STATS = zeroStatCards([
    'Women’s health bookings',
    'Completion rate (all)',
    'Pending approvals',
    'Active trainers used',
]);

// ─── Shared Types ────────────────────────────────────────────

export interface StatCard {
    label: string;
    value: string | number;
    change: string;
    changePositive: boolean;
    unit?: string;
    iconBg: string;
    iconColor: string;
}

export interface ProgramCard {
    id: string;
    title: string;
    activePatients: number;
    treatmentProgress: number;
    successRateLabel: string;
    successRate: number;
    progressColor: string;
    iconBg: string;
    iconColor: string;
    href: string;
}

export interface PatientDistributionItem {
    label: string;
    value: number;
    color: string;
}

export interface RecentActivity {
    id: string;
    description: string;
    timeAgo: string;
    iconBg: string;
    iconColor: string;
}

export interface Doctor {
    id: string;
    initials: string;
    avatarBg: string;
    avatarColor: string;
    name: string;
    qualification: string;
    specialty: string;
    specialtyBg: string;
    specialtyColor: string;
    nextAvailable: string;
    slots: string;
    status: 'Available' | 'Limited' | 'Unavailable';
}

export interface EngagementDataPoint {
    day: string;
    bar1: number;
    bar2: number;
    bar3: number;
}

export interface EngagementLegend {
    key: string;
    label: string;
    color: string;
}

// ═══════════════════════════════════════════════════════════
// WOMEN'S PROGRAM OVERVIEW
// ═══════════════════════════════════════════════════════════

export async function getWomensProgramStats(): Promise<StatCard[]> {
    const w = await womensFromApi();
    const stats = w?.stats as StatCard[] | undefined;
    if (stats?.length) return stats;
    return w ? [] : EMPTY_WOMENS_STATS;
}

export async function getWomensProgramCards(): Promise<ProgramCard[]> {
    const w = await womensFromApi();
    const cards = w?.programCards as ProgramCard[] | undefined;
    if (cards?.length) return cards;
    return [];
}

export async function getPatientDistribution(): Promise<PatientDistributionItem[]> {
    const w = await womensFromApi();
    const d = w?.patientDistribution as PatientDistributionItem[] | undefined;
    if (d?.length) return d;
    return [];
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
    const w = await womensFromApi();
    const a = w?.recentActivities as RecentActivity[] | undefined;
    if (a?.length) return a;
    return [];
}

const PCOS_BOOKING_STATS = zeroStatCards([
    'PCOS bookings',
    'Completed in subset',
    'Pending',
    'Trainers involved',
]);

const THYROID_BOOKING_STATS = zeroStatCards([
    'Thyroid bookings',
    'Completed in subset',
    'Pending',
    'Trainers involved',
]);

const MENOPAUSE_BOOKING_STATS = zeroStatCards([
    'Menopause bookings',
    'Completed in subset',
    'Pending',
    'Trainers involved',
]);

const PERIOD_BOOKING_STATS = zeroStatCards([
    'Period bookings',
    'Completed in subset',
    'Pending',
    'Trainers involved',
]);

const ENGAGEMENT_ZERO_7: EngagementDataPoint[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    bar1: 0,
    bar2: 0,
    bar3: 0,
}));

// ═══════════════════════════════════════════════════════════
// PCOS / PCOD
// ═══════════════════════════════════════════════════════════

export async function getPCOSStats(): Promise<StatCard[]> {
    const w = await womensFromApi();
    const p = w?.pcos as { stats?: StatCard[] } | undefined;
    if (p?.stats?.length) return p.stats;
    return PCOS_BOOKING_STATS;
}

export async function getPCOSDoctors(): Promise<Doctor[]> {
    const w = await womensFromApi();
    const p = w?.pcos as { doctors?: Doctor[] } | undefined;
    if (p?.doctors?.length) return p.doctors;
    return [];
}

// ═══════════════════════════════════════════════════════════
// THYROID
// ═══════════════════════════════════════════════════════════

export async function getThyroidStats(): Promise<StatCard[]> {
    const w = await womensFromApi();
    const t = w?.thyroid as { stats?: StatCard[] } | undefined;
    if (t?.stats?.length) return t.stats;
    return THYROID_BOOKING_STATS;
}

export async function getThyroidDoctors(): Promise<Doctor[]> {
    const w = await womensFromApi();
    const t = w?.thyroid as { doctors?: Doctor[] } | undefined;
    if (t?.doctors?.length) return t.doctors;
    return [];
}

// ═══════════════════════════════════════════════════════════
// MENOPAUSE
// ═══════════════════════════════════════════════════════════

export async function getMenopauseStats(): Promise<StatCard[]> {
    const w = await womensFromApi();
    const m = w?.menopause as { stats?: StatCard[] } | undefined;
    if (m?.stats?.length) return m.stats;
    return MENOPAUSE_BOOKING_STATS;
}

export async function getMenopauseEngagement(): Promise<EngagementDataPoint[]> {
    const w = await womensFromApi();
    const m = w?.menopause as { engagement?: EngagementDataPoint[] } | undefined;
    if (m?.engagement?.length) return m.engagement;
    return ENGAGEMENT_ZERO_7;
}

export const MENOPAUSE_ENGAGEMENT_LEGEND: EngagementLegend[] = [
    { key: 'bar1', label: 'Daily Active Users', color: '#3B82F6' },
    { key: 'bar2', label: 'Feature Usage',       color: '#6EE7B7' },
    { key: 'bar3', label: 'Symptom Logs',        color: '#F97316' },
];

// ═══════════════════════════════════════════════════════════
// PERIOD TRACKER
// ═══════════════════════════════════════════════════════════

export async function getPeriodTrackerStats(): Promise<StatCard[]> {
    const w = await womensFromApi();
    const p = w?.periodTracker as { stats?: StatCard[] } | undefined;
    if (p?.stats?.length) return p.stats;
    return PERIOD_BOOKING_STATS;
}

export async function getPeriodTrackerEngagement(): Promise<EngagementDataPoint[]> {
    const w = await womensFromApi();
    const p = w?.periodTracker as { engagement?: EngagementDataPoint[] } | undefined;
    if (p?.engagement?.length) return p.engagement;
    return ENGAGEMENT_ZERO_7;
}

export const PERIOD_TRACKER_ENGAGEMENT_LEGEND: EngagementLegend[] = [
    { key: 'bar1', label: 'Daily Active Users', color: '#3B82F6' },
    { key: 'bar2', label: 'Feature Usage',       color: '#6EE7B7' },
    { key: 'bar3', label: 'Session Duration',    color: '#FCD34D' },
];