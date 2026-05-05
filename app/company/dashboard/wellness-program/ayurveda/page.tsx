"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useWellnessProgramInsights, mapInsightsRowToAyurvedaClient } from '@/hooks/useWellnessProgramInsights';
import companyService from '@/services/companyService';
import { submitPortalEmployee } from '../portalEmployeeSubmit';

const EMPTY_AYURVEDA_STATS = [
    {
        label: 'Ayurveda-tagged',
        value: '0',
        change: '+0%',
        changePositive: true,
        subIcon: null as string | null,
        icon: 'ri-leaf-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Completed',
        value: '0',
        change: '+0%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-check-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Pending',
        value: '0',
        change: '+0%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-time-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Trainers',
        value: '0',
        change: '+0%',
        changePositive: true,
        subIcon: null,
        icon: 'ri-user-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
] as const;

const TREATMENT_PLAN_OPTIONS = ['All Treatment Plans', 'Detox Program', 'Stress Relief', 'Digestive Health', 'Immunity Boost'];

const AttendanceBar = ({ value, color }: { value: number; color: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-24 bg-light rounded-full h-1.5">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-[0.8125rem] font-semibold text-defaulttextcolor">{value}%</span>
    </div>
);

type AyurvedaStat = (typeof EMPTY_AYURVEDA_STATS)[number];

interface AyurvedaClient {
    id: number | string;
    name: string;
    email: string;
    initials: string;
    treatmentPlan: string;
    treatmentColor: string;
    consultationHistory: string;
    nextAppointment: string;
    attendance: number;
    attendanceColor: string;
    progress: string;
    progressColor: string;
}

const AyurvedaPage = () => {
    const insights = useWellnessProgramInsights('ayurveda');
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('All Treatment Plans');
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        treatmentPlan: 'Detox Program',
        nextAppointment: '',
    });
    const [ayurvedaStats, setAyurvedaStats] = useState<AyurvedaStat[]>(() => [...EMPTY_AYURVEDA_STATS]);
    const [ayurvedaPlanOptions, setAyurvedaPlanOptions] = useState(TREATMENT_PLAN_OPTIONS);
    const [ayurvedaClients, setAyurvedaClients] = useState<AyurvedaClient[]>([]);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!insights?.stats?.length) {
            setAyurvedaStats([...EMPTY_AYURVEDA_STATS]);
            setAyurvedaClients([]);
            return;
        }
        setAyurvedaStats(insights.stats as AyurvedaStat[]);
        setAyurvedaClients(insights.rows.map(mapInsightsRowToAyurvedaClient));
    }, [insights]);

    useEffect(() => {
        const plans = new Set(
            ayurvedaClients.map((c) => c.treatmentPlan).filter(Boolean)
        );
        const merged = ['All Treatment Plans', ...Array.from(plans)];
        setAyurvedaPlanOptions(merged.length > 1 ? merged : TREATMENT_PLAN_OPTIONS);
    }, [ayurvedaClients]);

    // TODO: Replace filter logic with API query params when backend is ready
    const filteredClients = useMemo(
        () =>
            ayurvedaClients.filter((c) => {
                const matchesSearch =
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.email.toLowerCase().includes(search.toLowerCase());
                const matchesPlan =
                    planFilter === 'All Treatment Plans' || c.treatmentPlan === planFilter;
                return matchesSearch && matchesPlan;
            }),
        [ayurvedaClients, search, planFilter]
    );



    const exportAyurvedaCsv = async () => {
        try {
            await companyService.downloadCompanyReportsExport('employees');
        } catch {
            alert('Export failed.');
        }
    };

    const handleAddClient = async () => {
        if (!newClient.name || !newClient.email) return;
        setAdding(true);
        const treatmentColorMap: Record<string, string> = {
            'Detox Program': 'bg-success/10 text-success',
            'Stress Relief': 'bg-warning/10 text-warning',
            'Digestive Health': 'bg-primary/10 text-primary',
            'Immunity Boost': 'bg-purple-100 text-purple-600',
        };
        const initials = newClient.name
            .trim()
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        try {
            const created = await submitPortalEmployee({
                fullName: newClient.name,
                email: newClient.email,
                levelLabel: 'Beginner',
                department: `Ayurveda · ${newClient.treatmentPlan}`.slice(0, 200),
            });
            const id = created._id
                ? String(created._id)
                : created.id
                  ? String(created.id)
                  : `new-${Date.now()}`;
            const client: AyurvedaClient = {
                id,
                name: newClient.name,
                email: newClient.email,
                initials,
                treatmentPlan: newClient.treatmentPlan,
                treatmentColor: treatmentColorMap[newClient.treatmentPlan],
                consultationHistory: '0 sessions completed',
                nextAppointment: newClient.nextAppointment || '—',
                attendance: 0,
                attendanceColor: 'bg-danger',
                progress: 'Registered',
                progressColor: 'bg-warning/10 text-warning',
            };
            setAyurvedaClients((prev) => [...prev, client]);
            setNewClient({ name: '', email: '', treatmentPlan: 'Detox Program', nextAppointment: '' });
            setShowModal(false);
            alert('Employee added for your company.');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Could not add client';
            alert(msg);
        } finally {
            setAdding(false);
        }
    };    


    return (
        <Fragment>
            <Seo title={"Ayurveda"} />
            <Pageheader
                currentpage="Ayurveda"
                activepage="Wellness Program"
                mainpage="Ayurveda"
            />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {ayurvedaStats.map((stat) => (
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
                                {ayurvedaPlanOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="ti-btn !bg-orange-500 !text-white !font-medium ti-btn-wave gap-1"
                                onClick={() => setShowModal(true)}
                                aria-label="Add client"
                            >
                                <i className="ri-add-line"></i> Add Client
                            </button>
                            <button
                                type="button"
                                className="ti-btn ti-btn-outline-light !text-defaulttextcolor !font-medium ti-btn-wave gap-1"
                                onClick={() => void exportAyurvedaCsv()}
                                aria-label="Export employees CSV"
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
                                    <th className="!text-[0.8125rem] !font-semibold">Doctor</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Treatment Plan</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Consultation History</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Next Appointment</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Attendance</th>
                                    <th className="!text-[0.8125rem] !font-semibold">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-success font-semibold text-[0.75rem]">{c.initials}</span>
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
                                        <td className="text-[0.875rem] text-[#8c9097]">{c.consultationHistory}</td>
                                        <td className="text-[0.875rem] text-defaulttextcolor font-medium">{c.nextAppointment}</td>
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
                        {['Detox Program', 'Stress Relief', 'Digestive Health', 'Immunity Boost'].map((plan) => (
                            <option key={plan} value={plan}>{plan}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[0.8125rem] font-medium text-defaulttextcolor mb-1">Next Appointment</label>
                    <input
                        type="date"
                        className="ti-form-control w-full"
                        value={newClient.nextAppointment}
                        onChange={(e) => setNewClient({ ...newClient, nextAppointment: e.target.value })}
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
                    onClick={() => void handleAddClient()}
                    disabled={!newClient.name || !newClient.email || adding}
                >
                    <i className="ri-add-line me-1"></i> {adding ? 'Adding…' : 'Add Client'}
                </button>
            </div>
        </div>
    </div>
)}


        </Fragment>
    );
};

export default AyurvedaPage;