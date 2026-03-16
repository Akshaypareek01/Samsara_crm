"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState } from 'react';

// ─────────────────────────────────────────────
// HARDCODED DATA — replace with API calls later
// ─────────────────────────────────────────────

const YOGA_STATS = [
    {
        label: 'Active Participants',
        value: '247',
        change: '+12.5%',
        changePositive: true,
        isScheduled: false,
        icon: 'ri-user-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Classes Today',
        value: '8',
        change: 'Scheduled',
        changePositive: true,
        isScheduled: true,
        icon: 'ri-calendar-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
    },
    {
        label: 'Attendance Rate',
        value: '87%',
        change: '+3.2%',
        changePositive: true,
        isScheduled: false,
        icon: 'ri-bar-chart-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
    },
    {
        label: 'Completion Rate',
        value: '73%',
        change: '-1.8%',
        changePositive: false,
        isScheduled: false,
        icon: 'ri-award-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
    },
];

const LEVEL_OPTIONS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

// TODO: Replace with API response — GET /api/wellness/yoga/participants
const YOGA_PARTICIPANTS = [
    {
        id: 1,
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        initials: 'PS',
        level: 'Intermediate',
        levelColor: 'bg-primary/10 text-primary',
        sessionsAttended: '8 sessions completed',
        attendance: 88,
        attendanceColor: 'bg-success',
        progress: 'On Track',
        progressColor: 'bg-success/10 text-success',
    },
    {
        id: 2,
        name: 'Raj Patel',
        email: 'raj.patel@email.com',
        initials: 'RP',
        level: 'Beginner',
        levelColor: 'bg-warning/10 text-warning',
        sessionsAttended: '5 sessions completed',
        attendance: 65,
        attendanceColor: 'bg-warning',
        progress: 'On Track',
        progressColor: 'bg-success/10 text-success',
    },
    {
        id: 3,
        name: 'Meera Gupta',
        email: 'meera.gupta@email.com',
        initials: 'MG',
        level: 'Advanced',
        levelColor: 'bg-purple-100 text-purple-600',
        sessionsAttended: '12 sessions completed',
        attendance: 95,
        attendanceColor: 'bg-success',
        progress: 'On Track',
        progressColor: 'bg-success/10 text-success',
    },
];

// ─────────────────────────────────────────────

const AttendanceBar = ({ value, color }: { value: number; color: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-24 bg-light rounded-full h-1.5 flex-shrink-0">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-[0.8125rem] font-semibold text-defaulttextcolor">{value}%</span>
    </div>
);

const YogaPage = () => {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('All Levels');

    // TODO: Replace filter logic with API query params when backend is ready
    const filteredParticipants = YOGA_PARTICIPANTS.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase());
        const matchesLevel = levelFilter === 'All Levels' || p.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    return (
        <Fragment>
            <Seo title={"Yoga"} />
            <Pageheader currentpage="Yoga" activepage="Wellness Program" mainpage="Yoga" />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-12 gap-x-6 mb-6">
                {YOGA_STATS.map((stat) => (
                    <div key={stat.label} className="col-span-12 sm:col-span-6 xl:col-span-3">
                        <div className="box">
                            <div className="box-body">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[#8c9097] dark:text-white/50 text-[0.8rem] mb-1">{stat.label}</p>
                                        <p className="text-[1.75rem] font-bold text-defaulttextcolor mb-1">{stat.value}</p>
                                        <p className={`text-[0.75rem] font-medium flex items-center gap-1 ${stat.changePositive ? 'text-success' : 'text-danger'}`}>
                                            {stat.isScheduled
                                                ? <><i className="ri-calendar-line"></i> {stat.change}</>
                                                : <>{stat.changePositive ? '↑' : '↓'} {stat.change}</>
                                            }
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        <i className={`${stat.icon} text-[1.25rem] ${stat.iconColor}`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table Section ── */}
            <div className="grid grid-cols-12 gap-x-6">
                <div className="col-span-12">
                    <div className="box">
                        <div className="box-body">

                            {/* Toolbar */}
                            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="ti-form-control ps-9 !text-[0.875rem]"
                                            placeholder="Search participants..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{ width: '220px' }}
                                        />
                                        <i className="ri-search-line absolute start-3 top-1/2 -translate-y-1/2 text-[#8c9097]"></i>
                                    </div>
                                    <select
                                        className="ti-form-select !text-[0.875rem]"
                                        value={levelFilter}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                        style={{ width: '150px' }}
                                    >
                                        {LEVEL_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* TODO: wire Add Participant to modal/API */}
                                    <button type="button" className="ti-btn !bg-orange-500 !text-white !font-medium ti-btn-wave">
                                        <i className="ri-add-line me-1"></i> Add Participant
                                    </button>
                                    {/* TODO: wire Export to download API */}
                                    <button type="button" className="ti-btn ti-btn-outline-light !text-defaulttextcolor !font-medium ti-btn-wave">
                                        <i className="ri-download-line me-1"></i> Export
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="table table-hover text-nowrap">
                                    <thead>
                                        <tr className="border-b border-defaultborder">
                                            <th className="!text-[0.8125rem] !font-semibold text-[#8c9097]">Trainer</th>
                                            <th className="!text-[0.8125rem] !font-semibold text-[#8c9097]">Levels</th>
                                            <th className="!text-[0.8125rem] !font-semibold text-[#8c9097]">Sessions Attended</th>
                                            <th className="!text-[0.8125rem] !font-semibold text-[#8c9097]">Attendance</th>
                                            <th className="!text-[0.8125rem] !font-semibold text-[#8c9097]">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredParticipants.map((p) => (
                                            <tr key={p.id} className="border-b border-defaultborder">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-primary font-semibold text-[0.75rem]">{p.initials}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[0.875rem] text-defaulttextcolor mb-0">{p.name}</p>
                                                            <p className="text-[#8c9097] text-[0.75rem] mb-0">{p.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${p.levelColor} text-[0.75rem] font-medium px-2 py-1 rounded`}>
                                                        {p.level}
                                                    </span>
                                                </td>
                                                <td className="text-[0.875rem] text-[#8c9097] align-middle">{p.sessionsAttended}</td>
                                                <td className="align-middle">
                                                    <AttendanceBar value={p.attendance} color={p.attendanceColor} />
                                                </td>
                                                <td className="align-middle">
                                                    <span className={`badge ${p.progressColor} text-[0.75rem] font-medium px-2 py-1 rounded`}>
                                                        {p.progress}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredParticipants.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted py-8">No participants found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default YogaPage;