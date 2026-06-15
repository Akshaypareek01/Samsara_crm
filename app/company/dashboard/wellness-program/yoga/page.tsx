"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useWellnessProgramInsights, mapInsightsRowToYogaParticipant } from '@/hooks/useWellnessProgramInsights';
import companyService from '@/services/companyService';
import { submitPortalEmployee } from '../portalEmployeeSubmit';
import { clearCompanyInsightsCache } from '@/services/companyInsightsClient';
import Swal from 'sweetalert2';

const EMPTY_YOGA_STATS = [
    {
        label: 'Yoga bookings',
        value: '0',
        change: '+0%',
        changePositive: true,
        isScheduled: false,
        icon: 'ri-heart-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Unique trainers',
        value: '0',
        change: '+0%',
        changePositive: true,
        isScheduled: false,
        icon: 'ri-user-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Completed',
        value: '0',
        change: '+0%',
        changePositive: true,
        isScheduled: false,
        icon: 'ri-check-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Pending',
        value: '0',
        change: '+0%',
        changePositive: true,
        isScheduled: false,
        icon: 'ri-time-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
] as const;

const LEVEL_OPTIONS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const AttendanceBar = ({ value, color }: { value: number; color: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-24 bg-light rounded-full h-1.5 flex-shrink-0">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-[0.8125rem] font-semibold text-defaulttextcolor">{value}%</span>
    </div>
);

type YogaStat = (typeof EMPTY_YOGA_STATS)[number] & { isScheduled?: boolean };

interface YogaParticipant {
    id: number | string;
    name: string;
    email: string;
    initials: string;
    level: string;
    levelColor: string;
    sessionsAttended: string;
    attendance: number;
    attendanceColor: string;
    progress: string;
    progressColor: string;
}

const YogaPage = () => {
    const insights = useWellnessProgramInsights('yoga');
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('All Levels');
    const [showModal, setShowModal] = useState(false);
    const [newParticipant, setNewParticipant] = useState({
        name: '',
        email: '',
        level: 'Beginner',
    });
    const [yogaStats, setYogaStats] = useState<YogaStat[]>(
        () => [...EMPTY_YOGA_STATS].map((s) => ({ ...s, isScheduled: false })) as YogaStat[]
    );
    const [yogaParticipants, setYogaParticipants] = useState<YogaParticipant[]>([]);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!insights?.stats?.length) {
            setYogaStats([...EMPTY_YOGA_STATS].map((s) => ({ ...s, isScheduled: false })) as YogaStat[]);
            setYogaParticipants([]);
            return;
        }
        const withFlags = (insights.stats as YogaStat[]).map((s) => ({
            ...s,
            isScheduled: s.isScheduled ?? false,
        }));
        setYogaStats(withFlags);
        setYogaParticipants(insights.rows.map(mapInsightsRowToYogaParticipant));
    }, [insights]);

    // TODO: Replace filter logic with API query params when backend is ready
    const filteredParticipants = useMemo(
        () =>
            yogaParticipants.filter((p) => {
                const matchesSearch =
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.email.toLowerCase().includes(search.toLowerCase());
                const matchesLevel = levelFilter === 'All Levels' || p.level === levelFilter;
                return matchesSearch && matchesLevel;
            }),
        [yogaParticipants, search, levelFilter]
    );


    const exportYogaCsv = async () => {
        try {
            await companyService.downloadCompanyReportsExport('employees');
        } catch {
            void Swal.fire('Export failed', 'Could not download employee CSV.', 'error');
        }
    };

    const handleAddParticipant = async () => {
        if (!newParticipant.name || !newParticipant.email) return;
        setAdding(true);
        try {
            await submitPortalEmployee({
                fullName: newParticipant.name,
                email: newParticipant.email,
                levelLabel: newParticipant.level,
                department: 'Yoga',
            });
            clearCompanyInsightsCache();
            setNewParticipant({ name: '', email: '', level: 'Beginner' });
            setShowModal(false);
            void Swal.fire('Success', 'Participant added. Refreshing list…', 'success');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Could not add participant';
            void Swal.fire('Error', msg, 'error');
        } finally {
            setAdding(false);
        }
    };
    return (
        <Fragment>
            <Seo title={"Yoga"} />
            <Pageheader currentpage="Yoga" activepage="Wellness Program" mainpage="Yoga" />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-12 gap-x-6 mb-6">
                {yogaStats.map((stat) => (
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
                                    <button
                                        type="button"
                                        className="ti-btn !bg-primary !text-white !font-medium ti-btn-wave"
                                        onClick={() => setShowModal(true)}
                                        aria-label="Add participant"
                                    >
                                        <i className="ri-add-line me-1"></i> Add Participant
                                    </button>
                                    <button
                                        type="button"
                                        className="ti-btn ti-btn-outline-light !text-defaulttextcolor !font-medium ti-btn-wave"
                                        onClick={() => void exportYogaCsv()}
                                        aria-label="Export employees CSV"
                                    >
                                        <i className="ri-download-line me-1"></i> Export
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="table table-hover text-nowrap">
                                    <thead>
                                        <tr className="border-b border-defaultborder">
                                            <th className="!text-[0.8125rem] !font-semibold text-[#8c9097]">Participant</th>
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



            {showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-bodybg rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
                <h6 className="text-[1rem] font-semibold text-defaulttextcolor">Add New Participant</h6>
                <button onClick={() => setShowModal(false)} className="text-[#8c9097] hover:text-danger text-xl">
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Full Name</label>
                    <input
                        type="text"
                        className="ti-form-control w-full"
                        placeholder="e.g. Ananya Mehta"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Email</label>
                    <input
                        type="email"
                        className="ti-form-control w-full"
                        placeholder="e.g. ananya@email.com"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Level</label>
                    <select
                        className="ti-form-select w-full"
                        value={newParticipant.level}
                        onChange={(e) => setNewParticipant({ ...newParticipant, level: e.target.value })}
                    >
                        {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button
                    type="button"
                    className="ti-btn ti-btn-outline-light !text-defaulttextcolor"
                    onClick={() => setShowModal(false)}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="ti-btn !bg-primary !text-white"
                    onClick={() => void handleAddParticipant()}
                    disabled={!newParticipant.name || !newParticipant.email || adding}
                >
                    <i className="ri-add-line me-1"></i> {adding ? 'Adding…' : 'Add Participant'}
                </button>
            </div>
        </div>
    </div>
)}



        </Fragment>
    );
};

export default YogaPage;