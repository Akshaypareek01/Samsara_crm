"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer, SPECIALIST_OPTIONS } from '@/services/trainerService';
import CompanyTrainerProfileDrawer from '../components/CompanyTrainerProfileDrawer';
import { useCompanyTrainerStats } from '@/hooks/useCompanyTrainerStats';

const YOGA_TRAINERS_RETURN = '/company/dashboard/yoga-trainers';

type FilterPeriod = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
const PERIODS: FilterPeriod[] = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

const TrainersPage = () => {
    const trainerStats = useCompanyTrainerStats();
    // ── NEW: analytics period state ───────────────────────────
    const [activePeriod, setActivePeriod] = useState<FilterPeriod>('Weekly');

    // ── EXISTING state (unchanged) ────────────────────────────
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialist, setFilterSpecialist] = useState('');

    useEffect(() => {
        fetchTrainers();
    }, [searchTerm, filterSpecialist]);

    // ── EXISTING fetch (unchanged) ────────────────────────────
    const fetchTrainers = async () => {
        try {
            setLoading(true);
            setError('');
            const params: any = {
                status: true,
                acceptingBookings: true,
                category: 'Yoga Trainer',
                page: 1,
                limit: 50,
                sortBy: 'createdAt:desc',
            };
            if (searchTerm)       params.name         = searchTerm;
            if (filterSpecialist) params.specialistIn = filterSpecialist;

            const response = await TrainerService.getTrainers(params);
            setTrainers(response.results || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch trainers');
            console.error('Error fetching trainers:', err);
        } finally {
            setLoading(false);
        }
    };

    const openProfileDrawer = async (trainer: Trainer) => {
        const id = trainer._id || trainer.id;
        setSelectedTrainer(trainer);
        setProfileDrawerOpen(true);
        if (!id) return;
        try {
            setProfileLoading(true);
            const full = await TrainerService.getTrainerById(id);
            setSelectedTrainer(full);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load trainer profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleTrainerClick = (trainer: Trainer) => {
        void openProfileDrawer(trainer);
    };

    const handleCloseProfileDrawer = () => {
        setProfileDrawerOpen(false);
        setSelectedTrainer(null);
    };

    return (
        <Fragment>
            <Seo title={"Yoga Trainers"} />
            <Pageheader currentpage="Yoga Trainers" activepage="Company" mainpage="Yoga Trainers" />

            {trainerStats.error && (
                <div className="alert alert-warning mb-4" role="status">
                    {trainerStats.error}
                </div>
            )}

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            {/* ══════════════════════════════════════════════════
                NEW — Analytics Overview + Stat Cards
            ══════════════════════════════════════════════════ */}

            {/* Period Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h6 className="font-bold text-base text-defaulttextcolor">Analytics Overview</h6>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1 bg-light rounded-lg p-1">
                        {PERIODS.map((p) => (
                            <button
                                key={p}
                                onClick={() => setActivePeriod(p)}
                                className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${
                                    activePeriod === p
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-muted hover:text-defaulttextcolor'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    {/* Period tabs reserved for future server-side stats filters */}
                    <button className="ti-btn ti-btn-sm ti-btn-light gap-1 text-xs">
                        <i className="bx bx-calendar"></i> Select Date
                    </button>
                </div>
            </div>

            {/* Trainer Profile Management heading */}
            <h5 className="font-bold text-xl text-defaulttextcolor mb-4">Yoga Trainers Management</h5>

            {/* Stat Cards — driven by live APIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="box mb-0">
                    <div className="box-body p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted mb-1">Total Trainers</p>
                                <p className="text-3xl font-bold text-defaulttextcolor">
                                    {trainerStats.loading ? "—" : trainerStats.totalTrainers}
                                </p>
                                <p className="text-[0.7rem] text-muted mt-1">Platform catalog</p>
                            </div>
                            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF2FF' }}>
                                <i className="bx bx-user text-xl" style={{ color: '#ed662e' }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted mb-1">Active Trainers</p>
                                <p className="text-3xl font-bold text-defaulttextcolor">
                                    {trainerStats.loading ? "—" : trainerStats.activeTrainers}
                                </p>
                                <p className="text-[0.7rem] text-muted mt-1">Listed as available</p>
                            </div>
                            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                                <i className="bx bx-check-circle text-xl" style={{ color: '#10B981' }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted mb-1">Catalog utilization</p>
                                <p className="text-3xl font-bold text-defaulttextcolor">
                                    {trainerStats.loading
                                        ? "—"
                                        : trainerStats.totalTrainers > 0
                                          ? Math.round(
                                                (trainerStats.activeTrainers / trainerStats.totalTrainers) * 100
                                            )
                                          : 0}
                                    {!trainerStats.loading && <span className="text-lg font-semibold">%</span>}
                                </p>
                                <p className="text-[0.7rem] text-muted mt-1">Active ÷ total</p>
                            </div>
                            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF9C3' }}>
                                <i className="bx bx-trending-up text-xl" style={{ color: '#EAB308' }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted mb-1">Your bookings</p>
                                <p className="text-3xl font-bold text-defaulttextcolor">
                                    {trainerStats.loading ? "—" : trainerStats.companyBookings}
                                </p>
                                <p className="text-[0.7rem] text-muted mt-1">
                                    {trainerStats.loading
                                        ? "—"
                                        : `${trainerStats.completionPct}% sessions completed`}
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3E8FF' }}>
                                <i className="bx bx-calendar text-xl" style={{ color: '#9B59B6' }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Trainers label (replaces old box header) */}
            <h6 className="font-semibold text-base text-defaulttextcolor mb-3">Search Trainers</h6>

            {/* ══════════════════════════════════════════════════
                EXISTING — Filters (unchanged, just restyled label)
            ══════════════════════════════════════════════════ */}
            <div className="box mb-4">
                <div className="box-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label" htmlFor="yoga-trainer-search">
                                Search
                            </label>
                            <input
                                id="yoga-trainer-search"
                                type="search"
                                className="form-control"
                                placeholder="Search by name, title, or program..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search yoga trainers by name, title, or program"
                            />
                        </div>
                        <div>
                            <label className="form-label" htmlFor="yoga-trainer-training-for">
                                Training For
                            </label>
                            <select
                                id="yoga-trainer-training-for"
                                className="form-control"
                                value={filterSpecialist}
                                onChange={(e) => setFilterSpecialist(e.target.value)}
                                aria-label="Filter by training audience"
                            >
                                <option value="">All audiences</option>
                                {SPECIALIST_OPTIONS.map((spec) => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                EXISTING — Trainer Cards Grid (100% unchanged)
            ══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-12 gap-6">
                {loading ? (
                    <div className="col-span-12 text-center py-8">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading trainers...</p>
                    </div>
                ) : trainers.length === 0 ? (
                    <div className="col-span-12 text-center py-8">
                        <p className="text-muted">No trainers found</p>
                    </div>
                ) : (
                    trainers.map((trainer) => (
                        <div key={trainer._id || trainer.id} className="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12">
                            <div className="box hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTrainerClick(trainer)}>
                                <div className="box-body">
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
                                        <h4 className="font-semibold text-base mb-1">{trainer.name}</h4>
                                        <p className="text-muted text-sm mb-3">{trainer.title}</p>
                                        <div className="flex flex-wrap gap-1 justify-center mb-3">
                                            {Array.isArray(trainer.specialistIn) ? (
                                                trainer.specialistIn.slice(0, 2).map((spec, idx) => (
                                                    <span key={idx} className="badge bg-info/10 text-info text-xs">
                                                        {spec}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="badge bg-info/10 text-info text-xs">
                                                    {trainer.specialistIn}
                                                </span>
                                            )}
                                            {Array.isArray(trainer.specialistIn) && trainer.specialistIn.length > 2 && (
                                                <span className="badge bg-secondary/10 text-secondary text-xs">
                                                    +{trainer.specialistIn.length - 2}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void openProfileDrawer(trainer);
                                            }}
                                            className="ti-btn ti-btn-primary !m-0 w-full inline-flex items-center justify-center gap-1.5"
                                            title="View profile and book a session"
                                        >
                                            <i className="ri-eye-line" aria-hidden="true"></i>
                                            View &amp; Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CompanyTrainerProfileDrawer
                open={profileDrawerOpen}
                trainer={selectedTrainer}
                loading={profileLoading}
                onClose={handleCloseProfileDrawer}
                returnTo={YOGA_TRAINERS_RETURN}
            />
        </Fragment>
    );
};

export default TrainersPage;

