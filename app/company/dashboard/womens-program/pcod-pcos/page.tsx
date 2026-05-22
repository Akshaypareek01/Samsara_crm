"use client";

import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    getPCOSStats,
    getPCOSDoctors,
    type StatCard,
    type Doctor,
} from '../_data/womens-program.data';

// ─── Shared Sub-components ───────────────────────────────────

const StatCardWidget = ({ card }: { card: StatCard }) => (
    <div className="box mb-0">
        <div className="box-body p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs text-muted mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-defaulttextcolor leading-tight">
                        {card.value}
                        {card.unit && (
                            <span className="text-sm font-normal text-muted ml-1 block">{card.unit}</span>
                        )}
                    </p>
                    {card.change && (
                        <p className={`text-xs font-semibold mt-1 ${card.changePositive ? 'text-success' : 'text-danger'}`}>
                            {card.changePositive ? '↑' : '↓'} {card.change}
                        </p>
                    )}
                </div>
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.iconBg }}
                >
                    <i className="bx bx-heart-circle text-base" style={{ color: card.iconColor }}></i>
                </div>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: Doctor['status'] }) => {
    const map: Record<Doctor['status'], { dot: string; label: string }> = {
        Available:   { dot: 'bg-success', label: 'Available'   },
        Limited:     { dot: 'bg-warning', label: 'Limited'     },
        Unavailable: { dot: 'bg-danger',  label: 'Unavailable' },
    };
    const { dot, label } = map[status];
    return (
        <span className="flex items-center gap-1.5 text-xs text-defaulttextcolor">
            <span className={`w-2 h-2 rounded-full ${dot}`}></span>
            {label}
        </span>
    );
};

// ─── Page Component ──────────────────────────────────────────

const PCOSPage = () => {
    const router = useRouter();
    const [stats, setStats]       = useState<StatCard[]>([]);
    const [doctors, setDoctors]   = useState<Doctor[]>([]);
    const [search, setSearch]     = useState('');
    const [specialtyFilter, setSpecialtyFilter]       = useState('All Specialties');
    const [availabilityFilter, setAvailabilityFilter] = useState('All Availability');

    useEffect(() => {
        getPCOSStats().then(setStats);
        getPCOSDoctors().then(setDoctors);
    }, []);

    const specialties = ['All Specialties', ...Array.from(new Set(doctors.map((d) => d.specialty)))];

    const filtered = doctors.filter((d) => {
        const matchSearch =
            search === '' ||
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.specialty.toLowerCase().includes(search.toLowerCase());
        const matchAvailability =
            availabilityFilter === 'All Availability' || d.status === availabilityFilter;
        const matchSpecialty =
            specialtyFilter === 'All Specialties' || d.specialty === specialtyFilter;
        return matchSearch && matchAvailability && matchSpecialty;
    });

    return (
        <Fragment>
            <Seo title="PCOS/PCOD" />
            <Pageheader currentpage="PCOS/PCOD" activepage="Women's Program" mainpage="PCOS/PCOD" />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {stats.map((card, i) => (
                    <StatCardWidget key={i} card={card} />
                ))}
            </div>

            {/* ── Medical Specialists Table ── */}
            <div className="box mb-0">
                <div className="box-header flex justify-between items-center flex-wrap gap-2">
                    <h6 className="box-title font-bold !mb-0">Medical Specialists</h6>
                    <p className="text-xs text-muted mb-0">
                        Specialists are trainers from your PCOS-related bookings. Book sessions to add more.
                    </p>
                </div>
                <div className="box-body">

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="relative" style={{ minWidth: '220px' }}>
                            <i
                                className="bx bx-search absolute top-1/2 -translate-y-1/2 text-muted text-sm"
                                style={{ left: '10px' }}
                            ></i>
                            <input
                                type="text"
                                placeholder="Search doctors..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="ti-form-control !text-[0.875rem]"
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>
                        <select
                            value={specialtyFilter}
                            onChange={(e) => setSpecialtyFilter(e.target.value)}
                            className="ti-form-select !text-[0.875rem]"
                        >
                            {specialties.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <select
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                            className="ti-form-select !text-[0.875rem]"
                        >
                            <option>All Availability</option>
                            <option>Available</option>
                            <option>Limited</option>
                            <option>Unavailable</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover text-sm whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-defaultborder">
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Doctor</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Specialty</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Next Available</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Status</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((doctor) => (
                                    <tr key={doctor.id} className="border-b border-defaultborder/50 hover:bg-light/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: doctor.avatarBg, color: doctor.avatarColor }}
                                                >
                                                    {doctor.initials}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-defaulttextcolor mb-0">{doctor.name}</p>
                                                    <p className="text-xs text-muted mb-0">{doctor.qualification}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{ backgroundColor: doctor.specialtyBg, color: doctor.specialtyColor }}
                                            >
                                                {doctor.specialty}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-defaulttextcolor mb-0">{doctor.nextAvailable}</p>
                                            <p className="text-xs text-muted mb-0">{doctor.slots}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={doctor.status} />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    className="text-xs font-semibold text-warning hover:underline"
                                                    onClick={() => router.push('/company/dashboard/bookings')}
                                                >
                                                    Schedule
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-xs font-semibold text-defaulttextcolor hover:underline"
                                                    onClick={() => router.push('/company/dashboard/trainers')}
                                                >
                                                    Profile
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted text-sm">
                                            No doctors match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </Fragment>
    );
};

export default PCOSPage;