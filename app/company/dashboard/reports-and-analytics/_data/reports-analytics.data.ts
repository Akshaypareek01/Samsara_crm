// ============================================================
// STATIC DATA LAYER — reports-analytics.data.ts
// ─────────────────────────────────────────────────────────────
// All data lives here. When APIs are ready, replace each
// function body with a fetch() call. The UI imports ONLY
// these functions, so zero component edits will be needed.
// ============================================================

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
    // TODO: return await fetch('/api/reports/banner').then(r => r.json())
    return {
        message: 'Great Progress!',
        highlight: '+8.4%',
        subtext: 'Overall group wellness score increased by +8.4% this month. 7 employees need follow-up attention.',
    };
}

// ─── Wellness Trend Chart ────────────────────────────────────

export async function getWellnessTrend(_period: FilterPeriod): Promise<WellnessTrendPoint[]> {
    // TODO: return await fetch(`/api/reports/wellness-trend?period=${_period}`).then(r => r.json())
    return [
        { month: 'Oct', avgScore: 52, participation: 60, goal: 75 },
        { month: 'Nov', avgScore: 55, participation: 62, goal: 75 },
        { month: 'Dec', avgScore: 58, participation: 65, goal: 75 },
        { month: 'Jan', avgScore: 63, participation: 70, goal: 75 },
        { month: 'Feb', avgScore: 70, participation: 74, goal: 75 },
        { month: 'Mar', avgScore: 76, participation: 80, goal: 75 },
    ];
}

// ─── Score Distribution ──────────────────────────────────────

export async function getScoreDistribution(): Promise<ScoreDistribution[]> {
    // TODO: return await fetch('/api/reports/score-distribution').then(r => r.json())
    return [
        { label: 'Excellent (75-100)', count: 42, color: '#10B981' },
        { label: 'Good (60-74)',        count: 31, color: '#F97316' },
        { label: 'Fair (50-59)',        count: 20, color: '#EAB308' },
        { label: 'At Risk (<50)',       count: 7,  color: '#EF4444' },
    ];
}

export async function getScoreDistributionTotal(): Promise<number> {
    // TODO: return await fetch('/api/reports/score-distribution/total').then(r => r.json())
    return 100;
}

// ─── Overview Stats ──────────────────────────────────────────

export async function getOverviewStats(): Promise<OverviewStat[]> {
    // TODO: return await fetch('/api/reports/overview-stats').then(r => r.json())
    return [
        {
            label: 'Active Participants',
            value: '87',
            change: '+5 from last period',
            changePositive: true,
            iconBg: '#EEF2FF',
            iconColor: '#6366F1',
            icon: 'bx-user',
        },
        {
            label: 'Program Completion Rate',
            value: '74%',
            change: '+5.2% improvement',
            changePositive: true,
            iconBg: '#D1FAE5',
            iconColor: '#10B981',
            icon: 'bx-check-circle',
        },
        {
            label: 'Average Session Duration',
            value: '28 min',
            change: '+3.1 improvement',
            changePositive: true,
            iconBg: '#FEF3C7',
            iconColor: '#F59E0B',
            icon: 'bx-time-five',
        },
        {
            label: 'Overall Wellness Score',
            value: '8.4/10',
            change: '+0.6 improvement',
            changePositive: true,
            iconBg: '#FFE4E6',
            iconColor: '#F43F5E',
            icon: 'bx-heart',
        },
    ];
}

// ─── Wellness Pillars ────────────────────────────────────────

export async function getWellnessPillars(): Promise<WellnessPillar[]> {
    // TODO: return await fetch('/api/reports/wellness-pillars').then(r => r.json())
    return [
        {
            id: 'mindfulness',
            title: 'Mindfulness & Stress',
            participants: 87,
            overallPct: 78,
            overallColor: '#6366F1',
            iconBg: '#EEF2FF',
            iconColor: '#6366F1',
            icon: 'bx-brain',
            metrics: [
                { label: 'Daily Check-ins',      value: 82 },
                { label: 'Meditation sessions',  value: 74 },
                { label: 'Stress Level (low)',   value: 78 },
            ],
            improvement: '+5% improvement this month',
            improvementPositive: true,
        },
        {
            id: 'physical',
            title: 'Physical Activities',
            participants: 92,
            overallPct: 85,
            overallColor: '#10B981',
            iconBg: '#D1FAE5',
            iconColor: '#10B981',
            icon: 'bx-run',
            metrics: [
                { label: 'Daily steps goal',   value: 88 },
                { label: 'Workout Frequency',  value: 81 },
                { label: 'Active Minutes',     value: 86 },
            ],
            improvement: '+3% improvement this month',
            improvementPositive: true,
        },
        {
            id: 'sleep',
            title: 'Sleep Quality',
            participants: 89,
            overallPct: 72,
            overallColor: '#8B5CF6',
            iconBg: '#EDE9FE',
            iconColor: '#8B5CF6',
            icon: 'bx-moon',
            metrics: [
                { label: 'Sleep duration (7-9h)',       value: 75 },
                { label: 'Sleep quality rating',        value: 69 },
                { label: 'Sleep schedule consistency',  value: 72 },
            ],
            improvement: '-2% this month',
            improvementPositive: false,
        },
        {
            id: 'nutrition',
            title: 'Nutrition',
            participants: 83,
            overallPct: 68,
            overallColor: '#F97316',
            iconBg: '#FEF3C7',
            iconColor: '#F97316',
            icon: 'bx-food-menu',
            metrics: [
                { label: 'Balanced meals logged', value: 71 },
                { label: 'Water intake goal',     value: 65 },
                { label: 'Balanced Meals',        value: 68 },
            ],
            improvement: '+7% improvement this month',
            improvementPositive: true,
        },
        {
            id: 'social',
            title: 'Social & Connection',
            participants: 94,
            overallPct: 81,
            overallColor: '#3B82F6',
            iconBg: '#DBEAFE',
            iconColor: '#3B82F6',
            icon: 'bx-group',
            metrics: [
                { label: 'Team activities',         value: 84 },
                { label: 'Social wellness events',  value: 78 },
                { label: 'Peer support engagement', value: 81 },
            ],
            improvement: '+4% improvement this month',
            improvementPositive: true,
        },
        {
            id: 'mental',
            title: 'Mental Wellness',
            participants: 88,
            overallPct: 75,
            overallColor: '#EC4899',
            iconBg: '#FCE7F3',
            iconColor: '#EC4899',
            icon: 'bx-heart',
            metrics: [
                { label: 'Mood Tracking',       value: 77 },
                { label: 'Anxiety Score (low)', value: 73 },
                { label: 'Resilience Index',    value: 75 },
            ],
            improvement: '+6% improvement this month',
            improvementPositive: true,
        },
    ];
}

// ─── Employee Wellness Table ──────────────────────────────────

export async function getEmployeeWellnessRows(): Promise<EmployeeWellnessRow[]> {
    // TODO: return await fetch('/api/reports/employee-wellness').then(r => r.json())
    return [
        { empId: '#EMP001', name: 'Urgent Mehta',  role: 'Senior Manager',   score: 92, change: 5,  streak: '12 days', status: 'Excellent' },
        { empId: '#EMP002', name: 'Sarah Johnson', role: 'HR Specialist',    score: 88, change: 3,  streak: '8 days',  status: 'Good'      },
        { empId: '#EMP003', name: 'Michael Chen',  role: 'Developer',        score: 75, change: -2, streak: '3 days',  status: 'Fair'      },
        { empId: '#EMP004', name: 'Emily Davis',   role: 'Marketing Lead',   score: 65, change: -8, streak: '0 days',  status: 'At Risk'   },
        { empId: '#EMP005', name: 'Daniel Kim',    role: 'Data Analyst',     score: 80, change: 1,  streak: '5 days',  status: 'Good'      },
    ];
}

// ─── Top Performers ──────────────────────────────────────────

export async function getTopPerformers(): Promise<TopPerformer[]> {
    // TODO: return await fetch('/api/reports/top-performers').then(r => r.json())
    return [
        { rank: 1, name: 'Urgent Mehta',  role: 'Senior Manager',  score: 92, rankColor: '#F59E0B' },
        { rank: 2, name: 'Sarah Johnson', role: 'HR Specialist',   score: 88, rankColor: '#94A3B8' },
        { rank: 3, name: 'David Wilson',  role: 'Product Manager', score: 85, rankColor: '#CD7F32' },
        { rank: 4, name: 'Lisa Anderson', role: 'Designer',        score: 82, rankColor: '#6B7280' },
    ];
}

// ─── Engagement Cards (bottom section) ───────────────────────

export async function getEngagementCards(): Promise<EngagementCard[]> {
    // TODO: return await fetch('/api/reports/engagement-cards').then(r => r.json())
    return [
        {
            id: 'trainer',
            title: 'Trainer Profile Engagement',
            valuePct: '92%',
            progressColor: '#6366F1',
            iconBg: '#EEF2FF',
            iconColor: '#6366F1',
            icon: 'bx-user-circle',
            metrics: [
                { label: 'Profile views this week',  value: '1,247' },
                { label: 'Employee interactions',    value: '89%'   },
                { label: 'Trainer availability rate',value: '94%'   },
                { label: 'Follow-up completion',     value: '91%'   },
            ],
            improvement: '+3.2% from last week',
            improvementPositive: true,
        },
        {
            id: 'yoga',
            title: 'Yoga Trainers Performance',
            valuePct: '4.8/5',
            progressColor: '#10B981',
            iconBg: '#D1FAE5',
            iconColor: '#10B981',
            icon: 'bx-body',
            metrics: [
                { label: 'Average rating',          value: '4.8/5' },
                { label: 'Session completion rate', value: '97%'   },
                { label: 'Employee retention',      value: '88%'   },
                { label: 'Punctuality score',       value: '95%'   },
            ],
            improvement: 'Consistently excellent performance',
            improvementPositive: true,
        },
        {
            id: 'bookings',
            title: 'Booking Statistics',
            valuePct: '156',
            progressColor: '#8B5CF6',
            iconBg: '#EDE9FE',
            iconColor: '#8B5CF6',
            icon: 'bx-calendar-check',
            metrics: [
                { label: 'This week bookings',    value: '156'     },
                { label: 'Cancellation rate',     value: '12%'     },
                { label: 'Peak booking time',     value: '6-8 PM'  },
                { label: 'Average advance booking',value: '3.2 days'},
            ],
            improvement: '+18% increase this week',
            improvementPositive: true,
        },
    ];
}