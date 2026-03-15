"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import { useRouter } from 'next/navigation';
import BookingModal from './components/BookingModal';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// ─────────────────────────────────────────────
// HARDCODED DATA — replace with API calls later
// ─────────────────────────────────────────────

const ANALYTICS_OVERVIEW = {
    wellnessScore: { value: 87, total: 100, change: '+12% from last period' },
    totalActiveUsers: { value: 2847, change: '+8.5% from last period' },
    completionRate: { value: 74, change: '+5.2% from last period' },
    avgSessionDuration: { value: '28min', change: '+3.1% from last period' },
};

const YOGA_METRICS = {
    sessionAttendance: 82,
    mostPopularClass: 'Hatha Yoga Flow',
    avgRating: 4.8,
    consultationBookings: 156,
    dietPlanAdherence: 78,
    treatmentSuccessRate: 91,
};

const WOMEN_WELLNESS = {
    programEnrollment: 68,
    breakdown: [
        { name: 'PCOS/PCOS', value: 45 },
        { name: 'Thyroid', value: 32 },
        { name: 'Menopause', value: 23 },
        { name: 'Period Tracker', value: 15 },
    ],
};

const PROGRAM_ENGAGEMENT_DATA = [
    { time: '6AM', value: 120 },
    { time: '9AM', value: 280 },
    { time: '12PM', value: 350 },
    { time: '3PM', value: 220 },
    { time: '6PM', value: 410 },
    { time: '9PM', value: 180 },
];

const USER_ACTIVITY_DATA = [
    { time: '6AM', value: 80 },
    { time: '9AM', value: 200 },
    { time: '12PM', value: 310 },
    { time: '3PM', value: 260 },
    { time: '6PM', value: 520 },
    { time: '9PM', value: 140 },
];

const PROGRAM_SUCCESS_DATA = [
    { name: 'Yoga Pr.', value: 35, color: '#3B82F6' },
    { name: "Women's", value: 30, color: '#F97316' },
    { name: 'Ayurveda', value: 20, color: '#10B981' },
    { name: 'Meditation', value: 15, color: '#A78BFA' },
];

const USER_DEMOGRAPHICS_DATA = [
    { name: '25-35', value: 35, color: '#3B82F6' },
    { name: '35-45', value: 28, color: '#10B981' },
    { name: '45+', value: 22, color: '#F97316' },
    { name: '55+ years', value: 15, color: '#A78BFA' },
];

const WELLNESS_CALENDAR = {
    month: 'May 2025',
    today: 14,
    days: Array.from({ length: 30 }, (_, i) => i + 1),
};

const PROGRAM_STATS = {
    goalsAchievement: { label: 'Q1 2025', wellnessSessions: 92, healthMetrics: 78 },
    stressScore: { value: 67, change: '↓ 12% from last month' },
    fitnessIndex: { value: 83, change: '↑ 8% from last month' },
};

// ─────────────────────────────────────────────

const TimeFilterButtons = ({ active, onChange }: { active: string; onChange: (v: string) => void }) => (
    <div className="flex gap-1">
        {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((f) => (
            <button
                key={f}
                onClick={() => onChange(f)}
                className={`px-3 py-1.5 text-xs rounded font-medium transition-all ${
                    active === f
                        ? 'bg-warning text-white'
                        : 'bg-transparent border border-defaultborder text-muted hover:bg-light'
                }`}
            >
                {f}
            </button>
        ))}
    </div>
);

const StatCard = ({
    label,
    value,
    change,
    icon,
    color,
}: {
    label: string;
    value: string | number;
    change: string;
    icon: string;
    color: string;
}) => (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-${color}/10 border border-${color}/20`}>
        <div className={`w-10 h-10 rounded-full bg-${color}/20 flex items-center justify-center text-lg flex-shrink-0`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-muted mb-0.5">{label}</p>
            <p className={`text-2xl font-bold text-${color}`}>{value}</p>
            <p className="text-xs text-success mt-0.5">{change}</p>
        </div>
    </div>
);

const ProgressBar = ({ value, color = 'bg-primary' }: { value: number; color?: string }) => (
    <div className="w-full bg-light rounded-full h-1.5 mt-1">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
    </div>
);

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-sm ${star <= Math.floor(rating) ? 'text-warning' : 'text-gray-300'}`}>
                ★
            </span>
        ))}
    </div>
);

const CompanyDashboard = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalTrainers, setTotalTrainers] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [trainerToBook, setTrainerToBook] = useState<Trainer | null>(null);
    const [activeFilter, setActiveFilter] = useState('Weekly');
    const router = useRouter();

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            const response = await TrainerService.getTrainers({
                status: true,
                page: 1,
                limit: 6,
                sortBy: 'createdAt:desc',
            });
            setTrainers(response.results || []);
            setTotalTrainers(response.totalResults || 0);
        } catch (err) {
            console.error('Error fetching trainers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTrainerClick = () => {
        router.push('/company/dashboard/trainers');
    };

    const handleBookTrainer = (trainer: Trainer, e: React.MouseEvent) => {
        e.stopPropagation();
        setTrainerToBook(trainer);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        setShowBookingModal(false);
        setTrainerToBook(null);
    };

    return (
        <Fragment>
            <Seo title={"Company Dashboard"} />
            <Pageheader currentpage="Dashboard" activepage="Company" mainpage="Dashboard" />

            {/* ── Main 3-column grid ── */}
            <div className="grid grid-cols-12 gap-6">

                {/* ══════════════════════════════════
                    LEFT + CENTER COLUMN (col-span-9)
                ══════════════════════════════════ */}
                <div className="xl:col-span-9 col-span-12 flex flex-col gap-6">

                    {/* ── Original 3 cards — live API data ── */}
                    <div className="box">
                        <div className="box-body">
                            <h3 className="text-xl font-bold mb-4">Welcome to the Company Dashboard</h3>
                            <p className="text-gray-500">
                                Navigate through the menu to manage trainers, view user speeches, and update settings.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                <div className="p-4 bg-primary/10 rounded-lg">
                                    <h4 className="font-semibold text-lg text-primary">Trainers</h4>
                                    <p className="text-2xl font-bold">{totalTrainers}</p>
                                </div>
                                <div className="p-4 bg-success/10 rounded-lg">
                                    <h4 className="font-semibold text-lg text-success">Speeches</h4>
                                    <p className="text-2xl font-bold">45</p>
                                </div>
                                <div className="p-4 bg-warning/10 rounded-lg">
                                    <h4 className="font-semibold text-lg text-warning">Pending</h4>
                                    <p className="text-2xl font-bold">3</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Analytics stat cards ── */}
                    <div className="box">
                        <div className="box-body">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard
                                    label="Overall Wellness Score"
                                    value={`${ANALYTICS_OVERVIEW.wellnessScore.value}/100`}
                                    change={ANALYTICS_OVERVIEW.wellnessScore.change}
                                    icon="❤️"
                                    color="warning"
                                />
                                <StatCard
                                    label="Total Active Users"
                                    value={ANALYTICS_OVERVIEW.totalActiveUsers.value.toLocaleString()}
                                    change={ANALYTICS_OVERVIEW.totalActiveUsers.change}
                                    icon="👤"
                                    color="primary"
                                />
                                <StatCard
                                    label="Program Completion Rate"
                                    value={`${ANALYTICS_OVERVIEW.completionRate.value}%`}
                                    change={ANALYTICS_OVERVIEW.completionRate.change}
                                    icon="✅"
                                    color="success"
                                />
                                <StatCard
                                    label="Avg Session Duration"
                                    value={ANALYTICS_OVERVIEW.avgSessionDuration.value}
                                    change={ANALYTICS_OVERVIEW.avgSessionDuration.change}
                                    icon="⏱️"
                                    color="info"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Analytics Overview Header ── */}
                    <div className="box">
                        <div className="box-header justify-between items-center flex-wrap gap-3">
                            <div>
                                <h5 className="box-title font-bold text-lg !mb-0">Analytics Overview</h5>
                                <p className="text-muted text-xs mt-0.5">Comprehensive wellness metrics and program analytics</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <TimeFilterButtons active={activeFilter} onChange={setActiveFilter} />
                                <button className="ti-btn ti-btn-sm ti-btn-light gap-1 text-xs">
                                    <i className="ri-filter-line"></i> Filters
                                </button>
                                <button className="ti-btn ti-btn-sm ti-btn-warning gap-1 text-xs">
                                    <i className="ri-download-line"></i> Export Data
                                </button>
                            </div>
                        </div>

                        {/* ── 3 Metric Panels ── */}
                        <div className="box-body">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* Yoga Metrics */}
                                <div className="p-4 rounded-xl border border-defaultborder">
                                    <div className="flex justify-between items-center mb-3">
                                        <h6 className="font-semibold text-sm text-defaulttextcolor">Yoga Metrics</h6>
                                        <span className="w-7 h-7 rounded-full border-2 border-success flex items-center justify-center text-xs text-success">○</span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted">Session Attendance</span>
                                            <span className="font-semibold">{YOGA_METRICS.sessionAttendance}%</span>
                                        </div>
                                        <ProgressBar value={YOGA_METRICS.sessionAttendance} color="bg-warning" />
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <p className="text-muted">Most Popular Class</p>
                                        <p className="font-semibold text-defaulttextcolor">{YOGA_METRICS.mostPopularClass}</p>
                                        <p className="text-muted mt-2">Average Rating</p>
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold">{YOGA_METRICS.avgRating}</span>
                                            <StarRating rating={YOGA_METRICS.avgRating} />
                                        </div>
                                    </div>
                                </div>

                                {/* Ayurveda Metrics */}
                                <div className="p-4 rounded-xl border border-defaultborder">
                                    <div className="flex justify-between items-center mb-3">
                                        <h6 className="font-semibold text-sm text-defaulttextcolor">Ayurveda Metrics</h6>
                                        <span className="w-7 h-7 rounded-full bg-warning/20 flex items-center justify-center text-sm">🌿</span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted">Consultation Bookings</span>
                                            <span className="font-semibold">{YOGA_METRICS.consultationBookings}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <p className="text-muted">Diet Plan Adherence</p>
                                        <ProgressBar value={YOGA_METRICS.dietPlanAdherence} color="bg-warning" />
                                        <div className="flex justify-between mt-1">
                                            <span></span>
                                            <span className="font-semibold">{YOGA_METRICS.dietPlanAdherence}%</span>
                                        </div>
                                        <p className="text-muted mt-2">Treatment Success Rate</p>
                                        <p className="font-semibold text-defaulttextcolor">{YOGA_METRICS.treatmentSuccessRate}%</p>
                                    </div>
                                </div>

                                {/* Women Wellness */}
                                <div className="p-4 rounded-xl border border-defaultborder">
                                    <div className="flex justify-between items-center mb-3">
                                        <h6 className="font-semibold text-sm text-defaulttextcolor">Women Wellness</h6>
                                        <span className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-sm">♀</span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted">Program Enrollment</span>
                                            <span className="font-semibold">{WOMEN_WELLNESS.programEnrollment}%</span>
                                        </div>
                                        <ProgressBar value={WOMEN_WELLNESS.programEnrollment} color="bg-danger" />
                                    </div>
                                    <div className="text-xs space-y-1.5">
                                        {WOMEN_WELLNESS.breakdown.map((item) => (
                                            <div key={item.name} className="flex justify-between">
                                                <span className="text-muted">{item.name}</span>
                                                <span className="font-semibold">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Charts Row ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h6 className="font-semibold text-sm mb-0.5">Program Engagement Trend</h6>
                                    <p className="text-xs text-muted mb-3">Weekly participation across all programs</p>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={PROGRAM_ENGAGEMENT_DATA} barSize={24}>
                                            <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h6 className="font-semibold text-sm mb-0.5">User Activity Distribution</h6>
                                    <p className="text-xs text-muted mb-3">Peak usage times and patterns</p>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={USER_ACTIVITY_DATA} barSize={24}>
                                            <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* ── Pie Charts Row ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h6 className="font-semibold text-sm mb-0.5">Program Success Rates</h6>
                                    <p className="text-xs text-muted mb-3">Completion and satisfaction metrics</p>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={PROGRAM_SUCCESS_DATA}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {PROGRAM_SUCCESS_DATA.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h6 className="font-semibold text-sm mb-0.5">User Demographics</h6>
                                    <p className="text-xs text-muted mb-3">Age and department distribution</p>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={USER_DEMOGRAPHICS_DATA}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {USER_DEMOGRAPHICS_DATA.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Featured Trainers (kept from original) ── */}
                    <div className="box">
                        <div className="box-header justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="w-0.5 h-4 bg-info rounded"></div>
                                    <div className="w-0.5 h-3 bg-info rounded"></div>
                                </div>
                                <div className="box-title !mb-0 font-bold text-lg">Featured Trainers</div>
                            </div>
                            <button
                                onClick={() => router.push('/company/dashboard/trainers')}
                                className="ti-btn ti-btn-sm ti-btn-primary"
                            >
                                View All
                            </button>
                        </div>
                        <div className="box-body">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : trainers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted">No trainers available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {trainers.map((trainer) => (
                                        <div
                                            key={trainer._id || trainer.id}
                                            className="box hover:shadow-lg transition-shadow cursor-pointer border border-defaultborder bg-white rounded-lg"
                                            onClick={() => handleTrainerClick()}
                                        >
                                            <div className="box-body p-5">
                                                <div className="text-center">
                                                    {trainer.profilePhoto?.path ? (
                                                        <img
                                                            src={trainer.profilePhoto.path}
                                                            alt={trainer.name}
                                                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-primary/20"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center mx-auto mb-3 border-2 border-primary/20">
                                                            <span className="text-primary font-semibold text-2xl">
                                                                {trainer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <h5 className="font-bold text-sm mb-1 text-defaulttextcolor">{trainer.name}</h5>
                                                    <p className="text-muted text-xs mb-3">{trainer.title}</p>
                                                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                                                        {Array.isArray(trainer.specialistIn) ? (
                                                            trainer.specialistIn.slice(0, 1).map((spec, idx) => (
                                                                <span key={idx} className="badge bg-info/10 text-info text-xs">
                                                                    {spec}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="badge bg-info/10 text-info text-xs">
                                                                {trainer.specialistIn}
                                                            </span>
                                                        )}
                                                        {Array.isArray(trainer.specialistIn) && trainer.specialistIn.length > 1 && (
                                                            <span className="badge bg-secondary/10 text-secondary text-xs">
                                                                +{trainer.specialistIn.length - 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleBookTrainer(trainer, e)}
                                                        className="ti-btn ti-btn-primary w-full text-xs"
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════
                    RIGHT SIDEBAR COLUMN (col-span-3)
                ══════════════════════════════════ */}
                <div className="xl:col-span-3 col-span-12 flex flex-col gap-6">

                    {/* ── Wellness Calendar ── */}
                    <div className="box">
                        <div className="box-header">
                            <div className="flex justify-between items-center w-full">
                                <h6 className="box-title font-bold !mb-0">Wellness Calendar</h6>
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <button className="hover:text-primary">‹</button>
                                    <span>{WELLNESS_CALENDAR.month}</span>
                                    <button className="hover:text-primary">›</button>
                                </div>
                            </div>
                        </div>
                        <div className="box-body pt-0">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <span key={i} className="py-1 font-medium">{d}</span>
                                ))}
                            </div>
                            {/* May 2025 starts on Thursday (offset 4) */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {Array.from({ length: 4 }).map((_, i) => <span key={`e${i}`} />)}
                                {WELLNESS_CALENDAR.days.map((day) => (
                                    <button
                                        key={day}
                                        className={`py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            day === WELLNESS_CALENDAR.today
                                                ? 'bg-warning text-white'
                                                : 'hover:bg-light text-defaulttextcolor'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="box">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Quick Actions</h6>
                        </div>
                        <div className="box-body flex flex-col gap-3 pt-0">
                            {/* TODO: wire download to actual report API */}
                            <button className="flex items-center gap-3 p-3 rounded-xl border border-defaultborder hover:bg-light transition-colors text-left w-full">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm flex-shrink-0">
                                    <i className="ri-file-download-line"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-defaulttextcolor mb-0">Download Report</p>
                                    <p className="text-xs text-muted">Export wellness analytics</p>
                                </div>
                            </button>
                            {/* TODO: wire to share/email API */}
                            <button className="flex items-center gap-3 p-3 rounded-xl border border-defaultborder hover:bg-light transition-colors text-left w-full">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-sm flex-shrink-0">
                                    <i className="ri-share-line"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-defaulttextcolor mb-0">Share Metrics</p>
                                    <p className="text-xs text-muted">Send to stakeholders</p>
                                </div>
                            </button>
                            {/* TODO: wire to notifications/alert settings API */}
                            <button className="flex items-center gap-3 p-3 rounded-xl border border-defaultborder hover:bg-light transition-colors text-left w-full">
                                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning text-sm flex-shrink-0">
                                    <i className="ri-notification-line"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-defaulttextcolor mb-0">Set Alerts</p>
                                    <p className="text-xs text-muted">Configure notifications</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* ── Program Statistics ── */}
                    <div className="box">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Program Statistics</h6>
                        </div>
                        <div className="box-body flex flex-col gap-4 pt-0">
                            {/* Goals Achievement */}
                            {/* TODO: replace PROGRAM_STATS with API data when available */}
                            <div className="p-3 rounded-xl bg-light border border-defaultborder">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm font-semibold text-defaulttextcolor">Goals Achievement</p>
                                    <span className="badge bg-primary/10 text-primary text-xs">{PROGRAM_STATS.goalsAchievement.label}</span>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted">Wellness Sessions</span>
                                            <span className="font-semibold">{PROGRAM_STATS.goalsAchievement.wellnessSessions}%</span>
                                        </div>
                                        <ProgressBar value={PROGRAM_STATS.goalsAchievement.wellnessSessions} color="bg-warning" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted">Health Metrics</span>
                                            <span className="font-semibold">{PROGRAM_STATS.goalsAchievement.healthMetrics}%</span>
                                        </div>
                                        <ProgressBar value={PROGRAM_STATS.goalsAchievement.healthMetrics} color="bg-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Stress + Fitness */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl border border-defaultborder text-center">
                                    <div className="flex items-center gap-1 justify-center text-xs text-muted mb-1">
                                        <span>📍</span> Stress Score
                                    </div>
                                    <p className="text-2xl font-bold text-defaulttextcolor">{PROGRAM_STATS.stressScore.value}%</p>
                                    <p className="text-xs text-danger">{PROGRAM_STATS.stressScore.change}</p>
                                </div>
                                <div className="p-3 rounded-xl border border-defaultborder text-center">
                                    <div className="flex items-center gap-1 justify-center text-xs text-muted mb-1">
                                        <span>🏃</span> Fitness Index
                                    </div>
                                    <p className="text-2xl font-bold text-defaulttextcolor">{PROGRAM_STATS.fitnessIndex.value}%</p>
                                    <p className="text-xs text-success">{PROGRAM_STATS.fitnessIndex.change}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal (kept from original) */}
            <BookingModal
                trainer={trainerToBook}
                isOpen={showBookingModal}
                onClose={() => {
                    setShowBookingModal(false);
                    setTrainerToBook(null);
                }}
                onSuccess={handleBookingSuccess}
            />
        </Fragment>
    );
};

export default CompanyDashboard;