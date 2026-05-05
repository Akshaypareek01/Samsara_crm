"use client";

import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const FALLBACK = {
    analyticsOverview: {
        wellnessScore: { value: 0, total: 100, change: "—" },
        totalActiveUsers: { value: 0, change: "—" },
        completionRate: { value: 0, change: "—" },
        avgSessionDuration: { value: "—", change: "—" },
    },
    yogaMetrics: {
        sessionAttendance: 0,
        mostPopularClass: "—",
        avgRating: 0,
        consultationBookings: 0,
        dietPlanAdherence: 0,
        treatmentSuccessRate: 0,
    },
    womenWellness: {
        programEnrollment: 0,
        breakdown: [
            { name: "PCOS/PCOD", value: 0 },
            { name: "Thyroid", value: 0 },
            { name: "Menopause", value: 0 },
            { name: "Period Tracker", value: 0 },
        ],
    },
    programEngagement: [
        { time: "6AM", value: 0 },
        { time: "9AM", value: 0 },
        { time: "12PM", value: 0 },
        { time: "3PM", value: 0 },
        { time: "6PM", value: 0 },
        { time: "9PM", value: 0 },
    ],
    userActivity: [
        { time: "6AM", value: 0 },
        { time: "9AM", value: 0 },
        { time: "12PM", value: 0 },
        { time: "3PM", value: 0 },
        { time: "6PM", value: 0 },
        { time: "9PM", value: 0 },
    ],
    programSuccess: [{ name: "Sessions", value: 1, color: "#3B82F6" }],
    userDemographics: [
        { name: "25-35", value: 35, color: "#3B82F6" },
        { name: "35-45", value: 28, color: "#10B981" },
        { name: "45+", value: 22, color: "#F97316" },
        { name: "55+ years", value: 15, color: "#A78BFA" },
    ],
    wellnessCalendar: {
        month: "",
        today: 1,
        days: [] as number[],
    },
    programStats: {
        goalsAchievement: { label: "", wellnessSessions: 0, healthMetrics: 0 },
        stressScore: { value: 0, change: "" },
        fitnessIndex: { value: 0, change: "" },
    },
};

export type CompanyDashboardOverview = typeof FALLBACK;

/**
 * Merge API overview with local fallbacks for safe rendering.
 *
 * @param raw - Payload from GET /companies/dashboard/overview
 */
function useMergedOverview(raw: Record<string, unknown> | null): CompanyDashboardOverview {
    return useMemo(() => {
        if (!raw) return { ...FALLBACK };
        const w = raw.wellnessCalendar as CompanyDashboardOverview["wellnessCalendar"] | undefined;
        return {
            analyticsOverview: {
                ...FALLBACK.analyticsOverview,
                ...(raw.analyticsOverview as object),
            },
            yogaMetrics: { ...FALLBACK.yogaMetrics, ...(raw.yogaMetrics as object) },
            womenWellness: {
                ...FALLBACK.womenWellness,
                ...(raw.womenWellness as object),
                breakdown:
                    (raw.womenWellness as CompanyDashboardOverview["womenWellness"] | undefined)
                        ?.breakdown || FALLBACK.womenWellness.breakdown,
            },
            programEngagement:
                (raw.programEngagement as CompanyDashboardOverview["programEngagement"]) ||
                FALLBACK.programEngagement,
            userActivity:
                (raw.userActivity as CompanyDashboardOverview["userActivity"]) || FALLBACK.userActivity,
            programSuccess:
                (raw.programSuccess as CompanyDashboardOverview["programSuccess"]) ||
                FALLBACK.programSuccess,
            userDemographics:
                (raw.userDemographics as CompanyDashboardOverview["userDemographics"]) ||
                FALLBACK.userDemographics,
            wellnessCalendar: w && w.days?.length ? w : FALLBACK.wellnessCalendar,
            programStats: {
                ...FALLBACK.programStats,
                ...(raw.programStats as object),
                goalsAchievement: {
                    ...FALLBACK.programStats.goalsAchievement,
                    ...(raw.programStats as CompanyDashboardOverview["programStats"] | undefined)
                        ?.goalsAchievement,
                },
                stressScore: {
                    ...FALLBACK.programStats.stressScore,
                    ...(raw.programStats as CompanyDashboardOverview["programStats"] | undefined)
                        ?.stressScore,
                },
                fitnessIndex: {
                    ...FALLBACK.programStats.fitnessIndex,
                    ...(raw.programStats as CompanyDashboardOverview["programStats"] | undefined)
                        ?.fitnessIndex,
                },
            },
        };
    }, [raw]);
}

const ProgressBar = ({ value, color = "bg-primary" }: { value: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
);

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={`text-sm ${star <= Math.floor(rating) ? "text-warning" : "text-gray-300"}`}
            >
                ★
            </span>
        ))}
    </div>
);

const StatCard = ({
    label,
    value,
    change,
    icon,
    iconBg,
    iconColor,
    labelColor,
    valueColor,
}: {
    label: string;
    value: string | number;
    change: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    labelColor: string;
    valueColor: string;
}) => (
    <div className="flex flex-col gap-2 p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: iconBg, color: iconColor }}
            >
                {icon}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: labelColor }}>
                {label}
            </span>
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800" style={{ color: valueColor }}>
                {value}
            </p>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <span>↑</span> {change}
            </p>
        </div>
    </div>
);

type MainProps = {
    overview: Record<string, unknown> | null;
    loading: boolean;
    activeFilter: string;
    onFilterChange: (f: string) => void;
};

/**
 * Main analytics column for company home (charts driven by booking aggregates).
 */
export const CompanyDashboardMainAnalytics: React.FC<MainProps> = ({
    overview,
    loading,
    activeFilter,
    onFilterChange,
}) => {
    const d = useMergedOverview(overview);
    const ao = d.analyticsOverview;

    return (
        <div className="box">
            <div className="box-header border-b border-gray-100 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-3 w-full">
                    <div>
                        <h5 className="box-title font-bold text-xl !mb-0 text-gray-800">Analytics Overview</h5>
                        <p className="text-muted text-xs mt-0.5">
                            {loading ? "Loading metrics…" : "Derived from your company bookings"}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {["Weekly", "Monthly", "Quarterly", "Yearly"].map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => onFilterChange(f)}
                                className={`px-4 py-1.5 text-xs rounded-full font-semibold transition-all whitespace-nowrap ${
                                    activeFilter === f
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "bg-transparent border border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="box-body flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Overall"
                        value={`${ao.wellnessScore.value}/${ao.wellnessScore.total}`}
                        change={ao.wellnessScore.change}
                        icon="❤️"
                        iconBg="#FFF3E0"
                        iconColor="#F97316"
                        labelColor="#F97316"
                        valueColor="#1F2937"
                    />
                    <StatCard
                        label="Active"
                        value={ao.totalActiveUsers.value}
                        change={ao.totalActiveUsers.change}
                        icon="👤"
                        iconBg="#EFF6FF"
                        iconColor="#3B82F6"
                        labelColor="#3B82F6"
                        valueColor="#1F2937"
                    />
                    <StatCard
                        label="Completion"
                        value={`${ao.completionRate.value}%`}
                        change={ao.completionRate.change}
                        icon="✅"
                        iconBg="#F0FDF4"
                        iconColor="#10B981"
                        labelColor="#10B981"
                        valueColor="#1F2937"
                    />
                    <StatCard
                        label="Session"
                        value={ao.avgSessionDuration.value}
                        change={ao.avgSessionDuration.change}
                        icon="⏱️"
                        iconBg="#F5F3FF"
                        iconColor="#8B5CF6"
                        labelColor="#8B5CF6"
                        valueColor="#1F2937"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h6 className="font-bold text-sm text-gray-800">Yoga Metrics</h6>
                            <span className="w-8 h-8 rounded-full border-2 border-green-400 flex items-center justify-center text-xs text-green-500 font-bold">
                                ○
                            </span>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Session Attendance</span>
                                <span className="font-semibold text-gray-700">
                                    {d.yogaMetrics.sessionAttendance}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className="bg-green-400 h-1.5 rounded-full"
                                    style={{ width: `${d.yogaMetrics.sessionAttendance}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs space-y-2">
                            <div>
                                <p className="text-gray-400">Most Popular Class</p>
                                <p className="font-semibold text-gray-700 mt-0.5">
                                    {d.yogaMetrics.mostPopularClass}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 mt-2">Average Rating</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="font-semibold text-gray-700">{d.yogaMetrics.avgRating}</span>
                                    <StarRating rating={d.yogaMetrics.avgRating} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h6 className="font-bold text-sm text-gray-800">Ayurveda Metrics</h6>
                            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">
                                🌿
                            </span>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Consultation Bookings</span>
                                <span className="font-bold text-gray-700 text-base">
                                    {d.yogaMetrics.consultationBookings}
                                </span>
                            </div>
                            <ProgressBar value={Math.min(100, d.yogaMetrics.consultationBookings * 3)} color="bg-orange-400" />
                        </div>
                        <div className="text-xs space-y-2">
                            <div>
                                <p className="text-gray-400">Diet Plan Adherence</p>
                                <ProgressBar value={d.yogaMetrics.dietPlanAdherence} color="bg-orange-400" />
                                <div className="flex justify-end mt-0.5">
                                    <span className="font-semibold text-gray-700">{d.yogaMetrics.dietPlanAdherence}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400">Treatment Success Rate</p>
                                <p className="font-semibold text-gray-700 mt-0.5">
                                    {d.yogaMetrics.treatmentSuccessRate}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h6 className="font-bold text-sm text-gray-800">Women Wellness</h6>
                            <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm">
                                ♀
                            </span>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Program Enrollment</span>
                                <span className="font-semibold text-gray-700">{d.womenWellness.programEnrollment}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className="bg-red-400 h-1.5 rounded-full"
                                    style={{ width: `${d.womenWellness.programEnrollment}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs space-y-2">
                            {d.womenWellness.breakdown.map((item) => (
                                <div key={item.name} className="flex justify-between">
                                    <span className="text-gray-500">{item.name}</span>
                                    <span className="font-semibold text-gray-700">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <h6 className="font-bold text-sm text-gray-800 mb-0.5">Program Engagement Trend</h6>
                        <p className="text-xs text-gray-400 mb-4">Booking start times bucketed</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={d.programEngagement} barSize={28}>
                                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }}
                                    cursor={{ fill: "#F3F4F6" }}
                                />
                                <Bar dataKey="value" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <h6 className="font-bold text-sm text-gray-800 mb-0.5">User Activity Distribution</h6>
                        <p className="text-xs text-gray-400 mb-4">Relative load by time bucket</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={d.userActivity} barSize={28}>
                                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }}
                                    cursor={{ fill: "#F3F4F6" }}
                                />
                                <Bar dataKey="value" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <h6 className="font-bold text-sm text-gray-800 mb-0.5">Program mix (bookings)</h6>
                        <p className="text-xs text-gray-400 mb-2">By training type</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={d.programSuccess}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    dataKey="value"
                                    paddingAngle={2}
                                >
                                    {d.programSuccess.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <h6 className="font-bold text-sm text-gray-800 mb-0.5">User Demographics</h6>
                        <p className="text-xs text-gray-400 mb-2">Placeholder until HR linkage exists</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={d.userDemographics}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    dataKey="value"
                                    paddingAngle={2}
                                >
                                    {d.userDemographics.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

type RailProps = { overview: Record<string, unknown> | null };

/**
 * Right column: calendar rail + quick actions + program stats.
 */
export const CompanyDashboardRightRail: React.FC<RailProps> = ({ overview }) => {
    const d = useMergedOverview(overview);
    const now = new Date();
    const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const defaultDays = Array.from({ length: dim }, (_, i) => i + 1);
    const defaultMonthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });
    const calDays = d.wellnessCalendar.days?.length ? d.wellnessCalendar.days : defaultDays;
    const calMonth = d.wellnessCalendar.month || defaultMonthLabel;
    const calToday =
        d.wellnessCalendar.today && d.wellnessCalendar.days?.length
            ? d.wellnessCalendar.today
            : now.getDate();
    const startDow = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const ps = d.programStats;

    return (
        <div className="xl:col-span-3 col-span-12 flex flex-col gap-6">
            <div className="box">
                <div className="box-header border-b border-gray-100">
                    <div className="flex justify-between items-center w-full">
                        <h6 className="box-title font-bold !mb-0 text-gray-800">Wellness Calendar</h6>
                        <span className="text-xs text-gray-500 font-medium">{calMonth}</span>
                    </div>
                </div>
                <div className="box-body pt-0">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                        {["S", "M", "T", "W", "T", "F", "S"].map((x, i) => (
                            <span key={`${x}-${i}`} className="py-1 font-semibold">
                                {x}
                            </span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {Array.from({ length: startDow }).map((_, i) => (
                            <span key={`b${i}`} />
                        ))}
                        {calDays.map((day) => (
                            <button
                                key={day}
                                type="button"
                                className={`py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    day === calToday
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "hover:bg-orange-50 text-gray-700"
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="box">
                <div className="box-header border-b border-gray-100">
                    <h6 className="box-title font-bold !mb-0 text-gray-800">Quick Actions</h6>
                </div>
                <div className="box-body flex flex-col gap-3 pt-3">
                    {[
                        { icon: "ri-file-download-line", bg: "bg-blue-50", color: "text-blue-500", t: "Download Report", s: "Export analytics" },
                        { icon: "ri-share-line", bg: "bg-green-50", color: "text-green-500", t: "Share Metrics", s: "Stakeholders" },
                        { icon: "ri-notification-line", bg: "bg-orange-50", color: "text-orange-500", t: "Set Alerts", s: "Notifications" },
                    ].map((q) => (
                        <button
                            key={q.t}
                            type="button"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left w-full"
                        >
                            <div className={`w-9 h-9 rounded-lg ${q.bg} flex items-center justify-center ${q.color} text-sm flex-shrink-0`}>
                                <i className={q.icon}></i>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-0">{q.t}</p>
                                <p className="text-xs text-gray-400">{q.s}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="box">
                <div className="box-header border-b border-gray-100">
                    <h6 className="box-title font-bold !mb-0 text-gray-800">Program Statistics</h6>
                </div>
                <div className="box-body flex flex-col gap-4 pt-3">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-semibold text-gray-700">Goals Achievement</p>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                                {ps.goalsAchievement.label}
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Wellness Sessions</span>
                                    <span className="font-semibold text-gray-700">{ps.goalsAchievement.wellnessSessions}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-orange-400 h-1.5 rounded-full"
                                        style={{
                                            width: `${Math.min(100, ps.goalsAchievement.wellnessSessions)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Health Metrics</span>
                                    <span className="font-semibold text-gray-700">{ps.goalsAchievement.healthMetrics}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-400 h-1.5 rounded-full"
                                        style={{ width: `${Math.min(100, ps.goalsAchievement.healthMetrics)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                <span className="text-green-500">🛡</span>
                                <span>Stress Score</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{ps.stressScore.value}%</p>
                            <p className="text-xs text-red-400 mt-1">{ps.stressScore.change}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                <span className="text-orange-400">🏃</span>
                                <span>Fitness Index</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{ps.fitnessIndex.value}%</p>
                            <p className="text-xs text-green-500 mt-1">{ps.fitnessIndex.change}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
