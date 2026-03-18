// ============================================================
// STATIC DATA LAYER — womens-program.data.ts
// ─────────────────────────────────────────────────────────────
// All data lives here. When APIs are ready, replace each
// function body with a fetch() call. The UI imports ONLY
// these functions, so zero component edits will be needed.
// ============================================================

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
    // TODO: return await fetch('/api/womens-program/stats').then(r => r.json())
    return [
        { label: 'Total Active Patients',     value: '1,247', change: '+8.3%',  changePositive: true, iconBg: '#FDE8E8', iconColor: '#E8613C' },
        { label: 'Treatment Success Rate',    value: '92%',   change: '+4.2%',  changePositive: true, iconBg: '#D1FAE5', iconColor: '#10B981' },
        { label: 'Ongoing Treatments',        value: '342',   change: '+12.1%', changePositive: true, iconBg: '#E0F2FE', iconColor: '#3B82F6' },
        { label: 'Patient Satisfaction Score',value: '4.7',   change: '+0.3',   changePositive: true, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
    ];
}

export async function getWomensProgramCards(): Promise<ProgramCard[]> {
    // TODO: return await fetch('/api/womens-program/programs').then(r => r.json())
    return [
        {
            id: 'pcos', title: 'PCOS/PCOD Management', activePatients: 156,
            treatmentProgress: 78, successRateLabel: 'Success Rate', successRate: 89,
            progressColor: '#9B59B6', iconBg: '#F3E8FF', iconColor: '#9B59B6',
            href: '/company/dashboard/womens-program/pcod-pcos',
        },
        {
            id: 'thyroid', title: 'Thyroid Care', activePatients: 98,
            treatmentProgress: 85, successRateLabel: 'Success Rate', successRate: 94,
            progressColor: '#3B82F6', iconBg: '#DBEAFE', iconColor: '#3B82F6',
            href: '/company/dashboard/womens-program/thyroid',
        },
        {
            id: 'menopause', title: 'Menopause Wellness', activePatients: 88,
            treatmentProgress: 92, successRateLabel: 'Success Rate', successRate: 96,
            progressColor: '#EC4899', iconBg: '#FCE7F3', iconColor: '#EC4899',
            href: '/company/dashboard/womens-program/menopause',
        },
        {
            id: 'period-tracker', title: 'Period Tracker', activePatients: 243,
            treatmentProgress: 82, successRateLabel: 'Cycle Prediction Accuracy', successRate: 91,
            progressColor: '#EF4444', iconBg: '#FEE2E2', iconColor: '#EF4444',
            href: '/company/dashboard/womens-program/period-tracker',
        },
    ];
}

export async function getPatientDistribution(): Promise<PatientDistributionItem[]> {
    // TODO: return await fetch('/api/womens-program/distribution').then(r => r.json())
    return [
        { label: 'Period Tracking', value: 32, color: '#F97316' },
        { label: 'PCOS/PCOD',       value: 28, color: '#3B82F6' },
        { label: 'Thyroid',          value: 22, color: '#22C55E' },
        { label: 'Menopause',        value: 18, color: '#EAB308' },
    ];
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
    // TODO: return await fetch('/api/womens-program/activities').then(r => r.json())
    return [
        { id: '1', description: 'New PCOS patient registered',    timeAgo: '5 minutes ago',  iconBg: '#F3E8FF', iconColor: '#9B59B6' },
        { id: '2', description: 'Thyroid consultation completed', timeAgo: '18 minutes ago', iconBg: '#DBEAFE', iconColor: '#3B82F6' },
        { id: '3', description: '5-star review from patient',     timeAgo: '42 minutes ago', iconBg: '#FEF3C7', iconColor: '#F59E0B' },
        { id: '4', description: 'Menopause treatment reminder',   timeAgo: '1 hour ago',     iconBg: '#FCE7F3', iconColor: '#EC4899' },
        { id: '5', description: 'Prescription updated',           timeAgo: '2 hours ago',    iconBg: '#D1FAE5', iconColor: '#10B981' },
    ];
}

// ═══════════════════════════════════════════════════════════
// PCOS / PCOD
// ═══════════════════════════════════════════════════════════

export async function getPCOSStats(): Promise<StatCard[]> {
    // TODO: return await fetch('/api/womens-program/pcos/stats').then(r => r.json())
    return [
        { label: 'Total PCOS/PCOD Patients',   value: '156', change: '+12.5%', changePositive: true,  iconBg: '#F3E8FF', iconColor: '#9B59B6' },
        { label: 'Average Treatment Duration', value: '4.2', change: '',       changePositive: true,  iconBg: '#E0F2FE', iconColor: '#3B82F6', unit: 'months' },
        { label: 'Success Rate',               value: '89%', change: '+3.2%',  changePositive: true,  iconBg: '#D1FAE5', iconColor: '#10B981' },
        { label: 'Patient Compliance Rate',    value: '78%', change: '+5.8%',  changePositive: true,  iconBg: '#FDE8E8', iconColor: '#E8613C' },
    ];
}

export async function getPCOSDoctors(): Promise<Doctor[]> {
    // TODO: return await fetch('/api/womens-program/pcos/doctors').then(r => r.json())
    return [
        {
            id: '1', initials: 'SJ', avatarBg: '#EDE9FE', avatarColor: '#7C3AED',
            name: 'Dr. Sarah Johnson',  qualification: 'Gynecologist, MD',
            specialty: 'PCOS Specialist',    specialtyBg: '#F3E8FF', specialtyColor: '#9B59B6',
            nextAvailable: 'Today, 2:00 PM', slots: '3 slots available', status: 'Available',
        },
        {
            id: '2', initials: 'RP', avatarBg: '#FEF3C7', avatarColor: '#D97706',
            name: 'Dr. Robert Patel',   qualification: 'Endocrinologist, MD',
            specialty: 'Hormone Specialist', specialtyBg: '#FEF9C3', specialtyColor: '#CA8A04',
            nextAvailable: 'Dec 28, 10:00 AM', slots: '1 slot available', status: 'Limited',
        },
        {
            id: '3', initials: 'ML', avatarBg: '#D1FAE5', avatarColor: '#059669',
            name: 'Dr. Michelle Lee',   qualification: 'Nutritionist, PhD',
            specialty: 'Diet Specialist',    specialtyBg: '#D1FAE5', specialtyColor: '#059669',
            nextAvailable: 'Dec 26, 3:30 PM', slots: '5 slots available', status: 'Available',
        },
        {
            id: '4', initials: 'AK', avatarBg: '#FFE4E6', avatarColor: '#E11D48',
            name: 'Dr. Amanda Kim',     qualification: 'Fertility Specialist, MD',
            specialty: 'Fertility Expert',   specialtyBg: '#FFE4E6', specialtyColor: '#E11D48',
            nextAvailable: 'Dec 30, 11:15 AM', slots: '2 slots available', status: 'Available',
        },
    ];
}

// ═══════════════════════════════════════════════════════════
// THYROID
// ═══════════════════════════════════════════════════════════

export async function getThyroidStats(): Promise<StatCard[]> {
    // TODO: return await fetch('/api/womens-program/thyroid/stats').then(r => r.json())
    return [
        { label: 'Total Thyroid Patients',   value: '243', change: '+8.3%', changePositive: true, iconBg: '#DBEAFE', iconColor: '#3B82F6' },
        { label: 'Average TSH Levels',        value: '3.8', change: '',      changePositive: true, iconBg: '#D1FAE5', iconColor: '#10B981', unit: 'mIU/L · Normal' },
        { label: 'T3/T4 Ratio',               value: '2.4', change: '+2.1%', changePositive: true, iconBg: '#F3E8FF', iconColor: '#9B59B6' },
        { label: 'Patient Compliance Rate',   value: '85%', change: '+4.7%', changePositive: true, iconBg: '#D1FAE5', iconColor: '#10B981' },
    ];
}

export async function getThyroidDoctors(): Promise<Doctor[]> {
    // TODO: return await fetch('/api/womens-program/thyroid/doctors').then(r => r.json())
    return [
        {
            id: '1', initials: 'DM', avatarBg: '#DBEAFE', avatarColor: '#2563EB',
            name: 'Dr. Michael Rodriguez', qualification: 'Endocrinologist, MD',
            specialty: 'Thyroid Specialist',   specialtyBg: '#DBEAFE', specialtyColor: '#2563EB',
            nextAvailable: 'Today, 3:30 PM', slots: '2 slots available', status: 'Available',
        },
        {
            id: '2', initials: 'JW', avatarBg: '#D1FAE5', avatarColor: '#059669',
            name: 'Dr. Jennifer Wilson',   qualification: 'Endocrinologist, MD',
            specialty: 'Hormone Specialist',   specialtyBg: '#D1FAE5', specialtyColor: '#059669',
            nextAvailable: 'Dec 29, 9:00 AM', slots: '4 slots available', status: 'Available',
        },
        {
            id: '3', initials: 'KT', avatarBg: '#EDE9FE', avatarColor: '#7C3AED',
            name: 'Dr. Kevin Thompson',    qualification: 'Nuclear Medicine, MD',
            specialty: 'Nuclear Medicine',     specialtyBg: '#EDE9FE', specialtyColor: '#7C3AED',
            nextAvailable: 'Dec 31, 2:15 PM', slots: '1 slot available', status: 'Limited',
        },
        {
            id: '4', initials: 'SC', avatarBg: '#FFE4E6', avatarColor: '#E11D48',
            name: 'Dr. Sophia Chen',       qualification: 'Endocrine Surgeon, MD',
            specialty: 'Endocrine Surgeon',    specialtyBg: '#FFE4E6', specialtyColor: '#E11D48',
            nextAvailable: 'Jan 3, 10:30 AM', slots: '3 slots available', status: 'Available',
        },
    ];
}

// ═══════════════════════════════════════════════════════════
// MENOPAUSE
// ═══════════════════════════════════════════════════════════

export async function getMenopauseStats(): Promise<StatCard[]> {
    // TODO: return await fetch('/api/womens-program/menopause/stats').then(r => r.json())
    return [
        { label: 'Symptom Tracking Rate',           value: '87.3%',  change: '+5.2%',  changePositive: true,  iconBg: '#FCE7F3', iconColor: '#EC4899' },
        { label: 'Active Users in Menopause Phase', value: '1,847',  change: '+14.8%', changePositive: true,  iconBg: '#F3E8FF', iconColor: '#9B59B6' },
        { label: 'Average Symptom Severity',         value: '6.2/10', change: '-0.4',   changePositive: false, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
        { label: 'Overall Wellbeing Score',          value: '7.4',    change: '+0.6',   changePositive: true,  iconBg: '#D1FAE5', iconColor: '#10B981' },
    ];
}

export async function getMenopauseEngagement(): Promise<EngagementDataPoint[]> {
    // TODO: return await fetch('/api/womens-program/menopause/engagement').then(r => r.json())
    return [
        { day: 'Mon', bar1: 1200, bar2: 860,  bar3: 380 },
        { day: 'Tue', bar1: 1380, bar2: 920,  bar3: 520 },
        { day: 'Wed', bar1: 1480, bar2: 980,  bar3: 480 },
        { day: 'Thu', bar1: 1250, bar2: 820,  bar3: 360 },
        { day: 'Fri', bar1: 1560, bar2: 1180, bar3: 600 },
        { day: 'Sat', bar1: 1180, bar2: 840,  bar3: 320 },
        { day: 'Sun', bar1: 1100, bar2: 720,  bar3: 300 },
    ];
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
    // TODO: return await fetch('/api/womens-program/period-tracker/stats').then(r => r.json())
    return [
        { label: 'Active App Users',   value: '2,847', change: '+12.4%', changePositive: true, iconBg: '#FFE4E6', iconColor: '#E11D48' },
        { label: 'Daily Active Users', value: '1,234', change: '+8.7%',  changePositive: true, iconBg: '#F3E8FF', iconColor: '#9B59B6' },
        { label: 'Tracking Accuracy',  value: '94.2%', change: '+2.1%',  changePositive: true, iconBg: '#D1FAE5', iconColor: '#10B981' },
        { label: 'User Satisfaction',  value: '4.6',   change: '+0.2',   changePositive: true, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
    ];
}

export async function getPeriodTrackerEngagement(): Promise<EngagementDataPoint[]> {
    // TODO: return await fetch('/api/womens-program/period-tracker/engagement').then(r => r.json())
    return [
        { day: 'Mon', bar1: 1180, bar2: 860, bar3: 480 },
        { day: 'Tue', bar1: 1200, bar2: 920, bar3: 500 },
        { day: 'Wed', bar1: 1220, bar2: 900, bar3: 520 },
        { day: 'Thu', bar1: 1190, bar2: 880, bar3: 460 },
        { day: 'Fri', bar1: 1260, bar2: 940, bar3: 560 },
        { day: 'Sat', bar1: 1140, bar2: 860, bar3: 440 },
        { day: 'Sun', bar1: 1080, bar2: 740, bar3: 420 },
    ];
}

export const PERIOD_TRACKER_ENGAGEMENT_LEGEND: EngagementLegend[] = [
    { key: 'bar1', label: 'Daily Active Users', color: '#3B82F6' },
    { key: 'bar2', label: 'Feature Usage',       color: '#6EE7B7' },
    { key: 'bar3', label: 'Session Duration',    color: '#FCD34D' },
];