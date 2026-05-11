"use client";

import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    getBannerData,
    getWellnessTrend,
    getScoreDistribution,
    getScoreDistributionTotal,
    getOverviewStats,
    getWellnessPillars,
    getEmployeeWellnessRows,
    getTopPerformers,
    getEngagementCards,
    type FilterPeriod,
    type BannerData,
    type WellnessTrendPoint,
    type ScoreDistribution,
    type OverviewStat,
    type WellnessPillar,
    type EmployeeWellnessRow,
    type TopPerformer,
    type EngagementCard,
} from './_data/reports-analytics.data';
import companyService from '@/services/companyService';

// ─────────────────────────────────────────────────────────────
// Small reusable atoms
// ─────────────────────────────────────────────────────────────

const PERIODS: FilterPeriod[] = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

const StatusBadge = ({ status }: { status: EmployeeWellnessRow['status'] }) => {
    const map: Record<EmployeeWellnessRow['status'], string> = {
        Excellent: 'bg-success/15 text-success',
        Good:      'bg-info/15 text-info',
        Fair:      'bg-warning/15 text-warning',
        'At Risk': 'bg-danger/15 text-danger',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[status]}`}>
            {status}
        </span>
    );
};

const PillarProgressBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full bg-light rounded-full h-1.5 mt-1 mb-3">
        <div className="h-1.5 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
);

const MetricRow = ({ label, value }: { label: string; value: number | string }) => (
    <div className="flex justify-between text-xs py-1 border-b border-defaultborder/40 last:border-0">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-defaulttextcolor">{value}{typeof value === 'number' ? '%' : ''}</span>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

const ReportsAnalyticsPage = () => {
    const router = useRouter();
    const [period, setPeriod]           = useState<FilterPeriod>('Weekly');
    const [trendKey, setTrendKey]       = useState<'avgScore' | 'participation' | 'goal'>('avgScore');

    const [banner, setBanner]           = useState<BannerData | null>(null);
    const [trend, setTrend]             = useState<WellnessTrendPoint[]>([]);
    const [distribution, setDist]       = useState<ScoreDistribution[]>([]);
    const [distTotal, setDistTotal]     = useState<number>(0);
    const [overviewStats, setOverview]  = useState<OverviewStat[]>([]);
    const [pillars, setPillars]         = useState<WellnessPillar[]>([]);
    const [employees, setEmployees]     = useState<EmployeeWellnessRow[]>([]);
    const [performers, setPerformers]   = useState<TopPerformer[]>([]);
    const [engCards, setEngCards]       = useState<EngagementCard[]>([]);

    // When APIs exist, just change the data functions — no UI edits needed
    useEffect(() => {
        getBannerData().then(setBanner);
        getScoreDistribution().then(setDist);
        getScoreDistributionTotal().then(setDistTotal);
        getOverviewStats().then(setOverview);
        getWellnessPillars().then(setPillars);
        getEmployeeWellnessRows().then(setEmployees);
        getTopPerformers().then(setPerformers);
        getEngagementCards().then(setEngCards);
    }, []);

    // Re-fetch trend when period changes (API will accept period param)
    useEffect(() => {
        getWellnessTrend(period).then(setTrend);
    }, [period]);

    // ── Trend toggle labels ────────────────────────────────
    const trendButtons: { key: typeof trendKey; label: string }[] = [
        { key: 'avgScore',      label: 'Average Score' },
        { key: 'participation', label: 'Participation'  },
        { key: 'goal',          label: 'Goal'           },
    ];

    const exportEmployeesCsv = async () => {
        try {
            await companyService.downloadCompanyReportsExport('employees');
        } catch {
            alert('Export failed.');
        }
    };

    const exportBookingsCsv = async () => {
        try {
            await companyService.downloadCompanyReportsExport('bookings');
        } catch {
            alert('Export failed.');
        }
    };

    return (
        <Fragment>
            <Seo title="Reports & Analytics" />
            <Pageheader currentpage="Reports & Analytics" activepage="Dashboard" mainpage="Reports & Analytics" />

            {/* ── Top Action Bar ── */}
            <div className="flex justify-end gap-2 mb-4">
                {/* TODO: wire to export API */}
                <button
                    type="button"
                    onClick={() => void exportEmployeesCsv()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-warning text-white text-sm font-semibold whitespace-nowrap hover:opacity-90 transition"
                    aria-label="Export employees CSV"
                >
                    <i className="ri-download-2-line"></i> Export employees (CSV)
                </button>
                <button
                    type="button"
                    onClick={() => void exportBookingsCsv()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold whitespace-nowrap hover:opacity-90 transition"
                    aria-label="Export bookings CSV"
                >
                    <i className="ri-download-line"></i> Export bookings (CSV)
                </button>
            </div>

            {/* ── Banner ── */}
            {banner && (
                <div className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <i className="bx bx-trophy text-xl text-white"></i>
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight">{banner.message}</p>
                        <p className="text-sm text-white/90 mt-0.5">{banner.subtext}</p>
                    </div>
                </div>
            )}

            {/* ── Period Filter Tabs ── */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h6 className="font-bold text-base text-defaulttextcolor">Analytics Overview</h6>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1 bg-light rounded-lg p-1">
                        {PERIODS.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${
                                    period === p
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-muted hover:text-defaulttextcolor'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    {/* TODO: wire to date-picker API param */}
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-defaultborder bg-white text-sm whitespace-nowrap">
                        <i className="bx bx-calendar"></i> Select Date
                    </button>
                </div>
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-12 gap-4 mb-6">
                {/* Monthly Wellness Trend */}
                <div className="xl:col-span-7 col-span-12 box mb-0">
                    <div className="box-header justify-between items-start">
                        <div>
                            <h6 className="box-title font-bold !mb-0">Monthly Wellness Trend</h6>
                            <p className="text-xs text-muted mt-0.5">Average group score over 6 months</p>
                        </div>
                        <div className="flex gap-1">
                            {trendButtons.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setTrendKey(key)}
                                    className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                                        trendKey === key
                                            ? 'bg-primary text-white'
                                            : 'bg-light text-muted hover:text-defaulttextcolor'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="box-body pt-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={trend}>
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey={trendKey}
                                    stroke="#F97316"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#F97316' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Score Distribution */}
                <div className="xl:col-span-5 col-span-12 box mb-0">
                    <div className="box-header justify-between items-center">
                        <div>
                            <h6 className="box-title font-bold !mb-0">Score Distribution</h6>
                            <p className="text-xs text-muted mt-0.5">All {distTotal} employees · March</p>
                        </div>
                        <span className="badge bg-danger/15 text-danger text-xs font-semibold px-2 py-1">Live</span>
                    </div>
                    <div className="box-body pt-0 flex items-center gap-4">
                        {/* Donut */}
                        <div className="relative flex-shrink-0">
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie
                                        data={distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={72}
                                        dataKey="count"
                                        paddingAngle={2}
                                    >
                                        {distribution.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold text-defaulttextcolor">{distTotal}</span>
                                <span className="text-xs text-muted">employees</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-col gap-2 flex-1">
                            {distribution.map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-muted">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-defaulttextcolor ml-2">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Overview Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {overviewStats.map((stat, i) => (
                    <div key={i} className="box mb-0">
                        <div className="box-body p-4 flex items-center gap-4">
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: stat.iconBg }}
                            >
                                <i className={`bx ${stat.icon} text-xl`} style={{ color: stat.iconColor }}></i>
                            </div>
                            <div>
                                <p className="text-xs text-muted mb-0.5">{stat.label}</p>
                                <p className="text-2xl font-bold text-defaulttextcolor leading-tight">{stat.value}</p>
                                <p className={`text-xs font-semibold mt-0.5 ${stat.changePositive ? 'text-success' : 'text-danger'}`}>
                                    {stat.changePositive ? '↑' : '↓'} {stat.change}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Wellness Pillars ── */}
            <h6 className="font-bold text-base text-defaulttextcolor mb-4">Wellness Pillars Group Average</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {pillars.map((pillar) => (
                    <div key={pillar.id} className="box mb-0">
                        <div className="box-body p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: pillar.iconBg }}
                                    >
                                        <i className={`bx ${pillar.icon} text-base`} style={{ color: pillar.iconColor }}></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-defaulttextcolor leading-tight">{pillar.title}</p>
                                        <p className="text-xs text-muted">{pillar.participants} participants</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold" style={{ color: pillar.overallColor }}>
                                    {pillar.overallPct}%
                                </span>
                            </div>
                            <PillarProgressBar value={pillar.overallPct} color={pillar.overallColor} />
                            {/* Metrics */}
                            <div>
                                {pillar.metrics.map((m) => (
                                    <MetricRow key={m.label} label={m.label} value={m.value} />
                                ))}
                            </div>
                            <p className={`text-xs font-semibold mt-3 ${pillar.improvementPositive ? 'text-success' : 'text-danger'}`}>
                                {pillar.improvement}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Employee Wellness + Top Performers ── */}
            <div className="grid grid-cols-12 gap-4 mb-6">
                {/* Employee Table */}
                <div className="xl:col-span-7 col-span-12 box mb-0">
                    <div className="box-header justify-between items-center">
                        <h6 className="box-title font-bold !mb-0">Employee Wellness Score</h6>
                        <button
                            onClick={() => router.push('/company/dashboard/reports-and-analytics/employee-score')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-defaultborder bg-white text-sm font-semibold whitespace-nowrap hover:bg-light transition"
                        >
                            View All <i className="bx bx-right-arrow-alt"></i>
                        </button>
                    </div>
                    <div className="box-body p-0">
                        <div className="table-responsive w-full">
                            <table className="table w-full text-sm whitespace-nowrap mb-0">
                                <thead>
                                    <tr className="border-b border-defaultborder">
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Employee ID</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Name</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Score</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Change</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Streak</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.empId} className="border-b border-defaultborder/50 hover:bg-light/50">
                                            <td className="py-3 px-4 text-xs text-muted font-mono">{emp.empId}</td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-sm text-defaulttextcolor">{emp.name}</p>
                                                <p className="text-xs text-muted">{emp.role}</p>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-defaulttextcolor">{emp.score}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-semibold ${emp.change >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {emp.change >= 0 ? '+' : ''}{emp.change}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-muted">{emp.streak}</td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={emp.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="xl:col-span-5 col-span-12 box mb-0">
                    <div className="box-header">
                        <div>
                            <h6 className="box-title font-bold !mb-0">Top Performers</h6>
                            <p className="text-xs text-muted mt-0.5">Highest wellness scores this month</p>
                        </div>
                    </div>
                    <div className="box-body flex flex-col gap-3">
                        {performers.map((p) => (
                            <div key={p.rank} className="flex items-center gap-3 p-3 rounded-xl bg-light/60">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: p.rankColor }}
                                >
                                    {p.rank}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-defaulttextcolor leading-tight">{p.name}</p>
                                    <p className="text-xs text-muted">{p.role}</p>
                                </div>
                                <span className="text-lg font-bold text-defaulttextcolor">{p.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Engagement Cards (bottom) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {engCards.map((card) => (
                    <div key={card.id} className="box mb-0">
                        <div className="box-body p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: card.iconBg }}
                                    >
                                        <i className={`bx ${card.icon} text-base`} style={{ color: card.iconColor }}></i>
                                    </div>
                                    <p className="font-semibold text-sm text-defaulttextcolor leading-snug">{card.title}</p>
                                </div>
                                <span className="text-xl font-bold" style={{ color: card.progressColor }}>
                                    {card.valuePct}
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-light rounded-full h-1.5 mb-3">
                                <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                        width: card.valuePct.includes('%') ? card.valuePct : '90%',
                                        backgroundColor: card.progressColor,
                                    }}
                                />
                            </div>
                            {/* Metric rows */}
                            {card.metrics.map((m) => (
                                <div key={m.label} className="flex justify-between text-xs py-1 border-b border-defaultborder/40 last:border-0">
                                    <span className="text-muted">{m.label}</span>
                                    <span className="font-semibold text-defaulttextcolor">{m.value}</span>
                                </div>
                            ))}
                            <p className={`text-xs font-semibold mt-3 ${card.improvementPositive ? 'text-success' : 'text-danger'}`}>
                                {card.improvement}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Fragment>
    );
};

export default ReportsAnalyticsPage;