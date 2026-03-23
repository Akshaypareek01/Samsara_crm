"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState } from 'react';

// ─────────────────────────────────────────────
// HARDCODED DATA — replace with API calls later
// ─────────────────────────────────────────────

const MEDITATION_STATS = [
    {
        label: 'Active Meditation Sessions',
        value: '38',
        change: '+12.5%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-map-pin-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
    },
    {
        label: 'Participant Enrollment',
        value: '186',
        change: '+8 today',
        changePositive: true,
        subIcon: 'ri-user-line',
        icon: 'ri-user-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Instructor Availability',
        value: '94%',
        change: '+2.8%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-user-heart-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
    },
    {
        label: 'Session Ratings',
        value: '4.8',
        change: '+0.2',
        changePositive: true,
        subIcon: null,
        icon: 'ri-star-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
    },
];

const TREATMENT_PLAN_OPTIONS = ['All Treatment Plans', 'Mindfulness Basics', 'Stress Reduction', 'Deep Meditation', 'Sleep Therapy'];

// TODO: Replace with API response — GET /api/wellness/meditation/clients
const MEDITATION_CLIENTS = [
    {
        id: 1,
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        initials: 'PS',
        treatmentPlan: 'Mindfulness Basics',
        treatmentColor: 'bg-purple-100 text-purple-600',
        sessionsAttended: '8 sessions completed',
        registrationDate: 'Dec 28, 2024',
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
        treatmentPlan: 'Stress Reduction',
        treatmentColor: 'bg-warning/10 text-warning',
        sessionsAttended: '5 sessions completed',
        registrationDate: 'Dec 30, 2024',
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
        treatmentPlan: 'Deep Meditation',
        treatmentColor: 'bg-primary/10 text-primary',
        sessionsAttended: '12 sessions completed',
        registrationDate: 'Jan 3, 2025',
        attendance: 95,
        attendanceColor: 'bg-success',
        progress: 'On Track',
        progressColor: 'bg-success/10 text-success',
    },
];

// ─────────────────────────────────────────────

const AttendanceBar = ({ value, color }: { value: number; color: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-24 bg-light rounded-full h-1.5">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-[0.8125rem] font-semibold text-defaulttextcolor">{value}%</span>
    </div>
);

const MeditationPage = () => {
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('All Treatment Plans');
    const [showModal, setShowModal] = useState(false);
const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    treatmentPlan: 'Mindfulness Basics',
    registrationDate: '',
});
const [meditationClients, setMeditationClients] = useState(MEDITATION_CLIENTS);

    // TODO: Replace filter logic with API query params when backend is ready
    const filteredClients =  meditationClients.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase());
        const matchesPlan = planFilter === 'All Treatment Plans' || c.treatmentPlan === planFilter;
        return matchesSearch && matchesPlan;
    });

   
    const handleAddClient = () => {
    if (!newClient.name || !newClient.email || !newClient.registrationDate) return;

    const treatmentColorMap: Record<string, string> = {
        'Mindfulness Basics': 'bg-purple-100 text-purple-600',
        'Stress Reduction': 'bg-warning/10 text-warning',
        'Deep Meditation': 'bg-primary/10 text-primary',
        'Sleep Therapy': 'bg-success/10 text-success',
    };

    const initials = newClient.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const client = {
        id: Date.now(),
        name: newClient.name,
        email: newClient.email,
        initials,
        treatmentPlan: newClient.treatmentPlan,
        treatmentColor: treatmentColorMap[newClient.treatmentPlan],
        sessionsAttended: '0 sessions completed',
        registrationDate: newClient.registrationDate,
        attendance: 0,
        attendanceColor: 'bg-danger',
        progress: 'Just Started',
        progressColor: 'bg-warning/10 text-warning',
    };

    // NOTE: Replace with API POST when backend is ready
    setMeditationClients((prev) => [...prev, client]);
    setNewClient({ name: '', email: '', treatmentPlan: 'Mindfulness Basics', registrationDate: '' });
    setShowModal(false);
};
    

    return (
        <Fragment>
            <Seo title={"Meditation"} />
            <Pageheader
                currentpage="Meditation"
                activepage="Wellness Program"
                mainpage="Meditation"
            />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {MEDITATION_STATS.map((stat) => (
                    <div key={stat.label} className="box mb-0">
                        <div className="box-body flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[#8c9097] dark:text-white/50 text-[0.8rem] mb-1">{stat.label}</p>
                                <p className="text-[1.75rem] font-bold text-defaulttextcolor mb-1">{stat.value}</p>
                                <p className={`text-[0.75rem] font-medium flex items-center gap-1 ${stat.changePositive ? 'text-success' : 'text-danger'}`}>
                                    {stat.subIcon ? (
                                        <><i className={stat.subIcon}></i> {stat.change}</>
                                    ) : (
                                        <>{stat.changePositive ? '↑' : '↓'} {stat.change}</>
                                    )}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                                <i className={`${stat.icon} text-[1.25rem] ${stat.iconColor}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table Section ── */}
            <div className="box">
                <div className="box-body">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex gap-2 flex-wrap">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="ti-form-control ps-9 !text-[0.875rem]"
                                    placeholder="Search clients..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ minWidth: '220px' }}
                                />
                                <i className="ri-search-line absolute start-3 top-1/2 -translate-y-1/2 text-[#8c9097]"></i>
                            </div>
                            <select
                                className="ti-form-select !text-[0.875rem]"
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                            >
                                {TREATMENT_PLAN_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            {/* TODO: wire Add Client to modal/API */}
                            <button
                                type="button"
                                className="ti-btn !bg-orange-500 !text-white !font-medium ti-btn-wave gap-1"
                                onClick={() => setShowModal(true)}  
                            >
                                <i className="ri-add-line"></i> Add Client
                            </button>
                            {/* TODO: wire Export to download API */}
                            <button
                                type="button"
                                className="ti-btn ti-btn-outline-light !text-defaulttextcolor !font-medium ti-btn-wave gap-1"
                            >
                                <i className="ri-download-line"></i> Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="ti-custom-table ti-custom-table-head whitespace-nowrap w-full">
                            <thead>
                                <tr>
                                    <th className="!text-[0.8125rem] !font-semibold">Trainer</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Treatment Plan</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Sessions Attended</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Registration Date</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Attendance</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-purple-600 font-semibold text-[0.75rem]">{c.initials}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[0.875rem] text-defaulttextcolor mb-0">{c.name}</p>
                                                    <p className="text-[#8c9097] text-[0.75rem] mb-0">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${c.treatmentColor} text-[0.75rem] font-medium px-2 py-1 rounded`}>
                                                {c.treatmentPlan}
                                            </span>
                                        </td>
                                        <td className="text-[0.875rem] text-[#8c9097]">{c.sessionsAttended}</td>
                                        <td className="text-[0.875rem] text-defaulttextcolor font-medium">{c.registrationDate}</td>
                                        <td>
                                            <AttendanceBar value={c.attendance} color={c.attendanceColor} />
                                        </td>
                                        <td>
                                            <span className={`badge ${c.progressColor} text-[0.75rem] font-medium px-2 py-1 rounded`}>
                                                {c.progress}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-8">No clients found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>




{showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-bodybg rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
                <h6 className="text-[1rem] font-semibold text-defaulttextcolor">Add New Client</h6>
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
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Email</label>
                    <input
                        type="email"
                        className="ti-form-control w-full"
                        placeholder="e.g. ananya@email.com"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Treatment Plan</label>
                    <select
                        className="ti-form-select w-full"
                        value={newClient.treatmentPlan}
                        onChange={(e) => setNewClient({ ...newClient, treatmentPlan: e.target.value })}
                    >
                        {['Mindfulness Basics', 'Stress Reduction', 'Deep Meditation', 'Sleep Therapy'].map((plan) => (
                            <option key={plan} value={plan}>{plan}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Registration Date</label>
                    <input
                        type="date"
                        className="ti-form-control w-full"
                        value={newClient.registrationDate}
                        onChange={(e) => setNewClient({ ...newClient, registrationDate: e.target.value })}
                    />
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
                    className="ti-btn !bg-orange-500 !text-white"
                    onClick={handleAddClient}
                    disabled={!newClient.name || !newClient.email || !newClient.registrationDate}
                >
                    <i className="ri-add-line me-1"></i> Add Client
                </button>
            </div>
        </div>
    </div>
)}




        </Fragment>
    );
};

export default MeditationPage;