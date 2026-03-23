"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState } from 'react';

// ─────────────────────────────────────────────
// HARDCODED DATA — replace with API calls later
// ─────────────────────────────────────────────

const WORKSHOP_STATS = [
    {
        label: 'Total Active Workshops',
        value: '24',
        change: '+15.2%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-calendar-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Total Participants',
        value: '342',
        change: '+18 new registrations',
        changePositive: true,
        subIcon: 'ri-user-line',
        icon: 'ri-group-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
    },
    {
        label: 'Instructor Assignment Rate',
        value: '96%',
        change: '+4.1%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-user-heart-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
    },
    {
        label: 'Average Workshop Rating',
        value: '4.7',
        change: '+0.3',
        changePositive: true,
        subIcon: null,
        icon: 'ri-star-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
    },
];

const WORKSHOP_OPTIONS = ['All Workshops', 'Morning Group Meditation', 'Stress Relief Workshop', 'Weekend Retreat', 'Nutrition Masterclass'];

// TODO: Replace with API response — GET /api/wellness/workshop/participants
const WORKSHOP_PARTICIPANTS = [
    {
        id: 1,
        name: 'Jessica Williams',
        email: 'jessica.williams@email.com',
        initials: 'JW',
        workshop: 'Morning Group Meditation',
        workshopColor: 'bg-purple-100 text-purple-600',
        registrationDate: 'Dec 15, 2024',
        sessionsAttended: '8/10 sessions',
        attendance: 88,
        attendanceColor: 'bg-success',
        status: 'Active',
        statusColor: 'bg-success/10 text-success',
    },
    {
        id: 2,
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        initials: 'RJ',
        workshop: 'Stress Relief Workshop',
        workshopColor: 'bg-warning/10 text-warning',
        registrationDate: 'Dec 18, 2024',
        sessionsAttended: '5/8 sessions',
        attendance: 65,
        attendanceColor: 'bg-warning',
        status: 'Active',
        statusColor: 'bg-success/10 text-success',
    },
    {
        id: 3,
        name: 'Amanda Davis',
        email: 'amanda.davis@email.com',
        initials: 'AD',
        workshop: 'Weekend Retreat',
        workshopColor: 'bg-primary/10 text-primary',
        registrationDate: 'Dec 20, 2024',
        sessionsAttended: '2/4 sessions',
        attendance: 88,
        attendanceColor: 'bg-success',
        status: 'Registered',
        statusColor: 'bg-warning/10 text-warning',
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

const WorkshopPage = () => {
    const [search, setSearch] = useState('');
    const [workshopFilter, setWorkshopFilter] = useState('All Workshops');
    const [showModal, setShowModal] = useState(false);
const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    workshop: 'Morning Group Meditation',
    registrationDate: '',
});
const [workshopParticipants, setWorkshopParticipants] = useState(WORKSHOP_PARTICIPANTS);

    // TODO: Replace filter logic with API query params when backend is ready
    const filteredParticipants = workshopParticipants.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase());
        const matchesWorkshop = workshopFilter === 'All Workshops' || p.workshop === workshopFilter;
        return matchesSearch && matchesWorkshop;
    });



const handleRegisterParticipant = () => {
    if (!newParticipant.name || !newParticipant.email || !newParticipant.registrationDate) return;

    const workshopColorMap: Record<string, string> = {
        'Morning Group Meditation': 'bg-purple-100 text-purple-600',
        'Stress Relief Workshop': 'bg-warning/10 text-warning',
        'Weekend Retreat': 'bg-primary/10 text-primary',
        'Nutrition Masterclass': 'bg-success/10 text-success',
    };

    const initials = newParticipant.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const participant = {
        id: Date.now(),
        name: newParticipant.name,
        email: newParticipant.email,
        initials,
        workshop: newParticipant.workshop,
        workshopColor: workshopColorMap[newParticipant.workshop],
        registrationDate: newParticipant.registrationDate,
        sessionsAttended: '0 sessions',
        attendance: 0,
        attendanceColor: 'bg-danger',
        status: 'Registered',
        statusColor: 'bg-warning/10 text-warning',
    };

    // NOTE: Replace with API POST when backend is ready
    setWorkshopParticipants((prev) => [...prev, participant]);
    setNewParticipant({ name: '', email: '', workshop: 'Morning Group Meditation', registrationDate: '' });
    setShowModal(false);
};


    return (
        <Fragment>
            <Seo title={"Workshop"} />
            <Pageheader
                currentpage="Workshop"
                activepage="Wellness Program"
                mainpage="Workshop"
            />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {WORKSHOP_STATS.map((stat) => (
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
                                    placeholder="Search workshop participants..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ minWidth: '240px' }}
                                />
                                <i className="ri-search-line absolute start-3 top-1/2 -translate-y-1/2 text-[#8c9097]"></i>
                            </div>
                            <select
                                className="ti-form-select !text-[0.875rem]"
                                value={workshopFilter}
                                onChange={(e) => setWorkshopFilter(e.target.value)}
                            >
                                {WORKSHOP_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            {/* TODO: wire Register Participant to modal/API */}
                            <button
                                type="button"
                                className="ti-btn !bg-orange-500 !text-white !font-medium ti-btn-wave gap-1"
                                  onClick={() => setShowModal(true)} 
                            >
                                <i className="ri-add-line"></i> Register Participant
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
                                    <th className="!text-[0.8125rem] !font-semibold">Workshop</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Registration Date</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Sessions Attended</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Attendance</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParticipants.map((p) => (
                                    <tr key={p.id}>
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
                                            <span className={`badge ${p.workshopColor} text-[0.75rem] font-medium px-2 py-1 rounded`}>
                                                {p.workshop}
                                            </span>
                                        </td>
                                        <td className="text-[0.875rem] text-defaulttextcolor font-medium">{p.registrationDate}</td>
                                        <td className="text-[0.875rem] text-[#8c9097]">{p.sessionsAttended}</td>
                                        <td>
                                            <AttendanceBar value={p.attendance} color={p.attendanceColor} />
                                        </td>
                                        <td>
                                            <span className={`badge ${p.statusColor} text-[0.75rem] font-medium px-2 py-1 rounded`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredParticipants.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-8">No participants found.</td>
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
                <h6 className="text-[1rem] font-semibold text-defaulttextcolor">Register New Participant</h6>
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
                        placeholder="e.g. Jessica Williams"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Email</label>
                    <input
                        type="email"
                        className="ti-form-control w-full"
                        placeholder="e.g. jessica@email.com"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Workshop</label>
                    <select
                        className="ti-form-select w-full"
                        value={newParticipant.workshop}
                        onChange={(e) => setNewParticipant({ ...newParticipant, workshop: e.target.value })}
                    >
                        {['Morning Group Meditation', 'Stress Relief Workshop', 'Weekend Retreat', 'Nutrition Masterclass'].map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Registration Date</label>
                    <input
                        type="date"
                        className="ti-form-control w-full"
                        value={newParticipant.registrationDate}
                        onChange={(e) => setNewParticipant({ ...newParticipant, registrationDate: e.target.value })}
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
                    onClick={handleRegisterParticipant}
                    disabled={!newParticipant.name || !newParticipant.email || !newParticipant.registrationDate}
                >
                    <i className="ri-add-line me-1"></i> Register Participant
                </button>
            </div>
        </div>
    </div>
)}




        </Fragment>
    );
};

export default WorkshopPage;