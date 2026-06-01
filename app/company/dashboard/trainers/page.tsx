"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import TrainerService, { Trainer, SPECIALIST_OPTIONS, TRAINER_CATEGORY_OPTIONS, TYPE_OF_TRAINING_OPTIONS } from '@/services/trainerService';
import CompanyBookingDrawer from '../components/CompanyBookingDrawer';
import CompanyTrainerProfileDrawer from '../components/CompanyTrainerProfileDrawer';

import { useCompanyTrainerStats } from '@/hooks/useCompanyTrainerStats';

type FilterPeriod = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
const PERIODS: FilterPeriod[] = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

/**
 * Builds a compact list of page tokens with ellipsis for pagination.
 * Always shows first/last page and a window around the current page.
 * @param current - the active page (1-indexed)
 * @param total - total number of pages
 * @returns array of page numbers and '...' separators
 */
const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');

    pages.push(total);
    return pages;
};

const TrainersPage = () => {
    const [activePeriod, setActivePeriod] = useState<FilterPeriod>('Weekly');
    const trainerStats = useCompanyTrainerStats(activePeriod);

    // ── EXISTING state (unchanged) ────────────────────────────
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
    const [trainerToBook, setTrainerToBook] = useState<Trainer | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialist, setFilterSpecialist] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTraining, setFilterTraining] = useState('');
    const [sortBy, setSortBy] = useState('createdAt:desc');

    // ── Pagination state ──────────────────────────────────────
    const PAGE_LIMIT = 12;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Reset to first page whenever a filter changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterSpecialist, filterCategory, filterTraining, sortBy]);

    const fetchTrainers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params: any = {
                status: true,
                acceptingBookings: true,
                page,
                limit: PAGE_LIMIT,
                sortBy,
            };
            if (searchTerm) params.name = searchTerm;
            if (filterSpecialist) params.specialistIn = filterSpecialist;
            if (filterCategory) params.category = filterCategory;
            if (filterTraining) params.typeOfTraining = filterTraining;

            const response = await TrainerService.getTrainers(params);
            setTrainers(response.results || []);
            setTotalPages(response.totalPages || 1);
            setTotalResults(response.totalResults || 0);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch trainers');
            console.error('Error fetching trainers:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterSpecialist, filterCategory, filterTraining, sortBy, page]);

    /**
     * Resets every search/filter control back to its default state.
     */
    const handleClearFilters = () => {
        setSearchInput('');
        setSearchTerm('');
        setFilterCategory('');
        setFilterSpecialist('');
        setFilterTraining('');
        setSortBy('createdAt:desc');
    };

    const hasActiveFilters =
        !!searchInput ||
        !!filterCategory ||
        !!filterSpecialist ||
        !!filterTraining ||
        sortBy !== 'createdAt:desc';

    useEffect(() => {
        void fetchTrainers();
    }, [fetchTrainers]);

    /**
     * Opens profile drawer and loads full trainer record from API.
     *
     * @param trainer - Trainer from list card.
     */
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
            console.error("Error loading trainer profile:", err);
            setError(err instanceof Error ? err.message : "Failed to load trainer profile");
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

    /**
     * Closes profile drawer and opens booking drawer for the same trainer.
     *
     * @param trainer - Trainer to book.
     */
    const handleBookSessionFromProfile = (trainer: Trainer) => {
        setProfileDrawerOpen(false);
        setSelectedTrainer(null);
        setTrainerToBook(trainer);
        setBookingDrawerOpen(true);
    };

    const handleBookingSuccess = () => {
        setBookingDrawerOpen(false);
        setTrainerToBook(null);
    };

    return (
        <Fragment>
            <Seo title={"Trainers"} />
            <Pageheader currentpage="Trainers" activepage="Company" mainpage="Trainers" />

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
                                className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${activePeriod === p
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-muted hover:text-defaulttextcolor'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trainer Profile Management heading */}
            <h5 className="font-bold text-xl text-defaulttextcolor mb-4">Trainer Profile Management</h5>

            {/* Stat Cards — driven by live APIs (catalog + your bookings + overview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Total Trainers (catalog) */}
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
                                <i className="bx bx-user text-xl" style={{ color: '#6366F1' }}></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Trainers */}
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

                {/* Catalog utilization */}
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

                {/* Company bookings */}
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
                Filters — all available trainer query options
            ══════════════════════════════════════════════════ */}
            <div className="box mb-4">
                <div className="box-body">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label" htmlFor="trainer-search">Search by Name</label>
                            <input
                                id="trainer-search"
                                type="text"
                                className="form-control"
                                placeholder="Search by name or specialty..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                aria-label="Search trainers by name or specialty"
                            />
                        </div>
                        <div>
                            <label className="form-label" htmlFor="trainer-category">Category</label>
                            <select
                                id="trainer-category"
                                className="form-control"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                aria-label="Filter trainers by category"
                            >
                                <option value="">All Categories</option>
                                {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" htmlFor="trainer-specialist">Specialist In</label>
                            <select
                                id="trainer-specialist"
                                className="form-control"
                                value={filterSpecialist}
                                onChange={(e) => setFilterSpecialist(e.target.value)}
                                aria-label="Filter trainers by specialist in"
                            >
                                <option value="">All Specialties</option>
                                {SPECIALIST_OPTIONS.map((spec) => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" htmlFor="trainer-training">Training Program</label>
                            <select
                                id="trainer-training"
                                className="form-control"
                                value={filterTraining}
                                onChange={(e) => setFilterTraining(e.target.value)}
                                aria-label="Filter trainers by training program"
                            >
                                <option value="">All Programs</option>
                                {TYPE_OF_TRAINING_OPTIONS.map((training) => (
                                    <option key={training} value={training}>
                                        {training}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" htmlFor="trainer-sort">Sort By</label>
                            <select
                                id="trainer-sort"
                                className="form-control"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort trainers"
                            >
                                <option value="createdAt:desc">Newest First</option>
                                <option value="createdAt:asc">Oldest First</option>
                                <option value="name:asc">Name (A–Z)</option>
                                <option value="name:desc">Name (Z–A)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
                        <p className="text-sm text-muted mb-0">
                            {loading
                                ? 'Loading…'
                                : `${totalResults} trainer${totalResults === 1 ? '' : 's'} found`}
                        </p>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary"
                            aria-label="Clear all filters"
                        >
                            <i className="ri-refresh-line text-base"></i>
                            <span>Clear Filters</span>
                        </button>
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

            {/* ══════════════════════════════════════════════════
                Pagination controls
            ══════════════════════════════════════════════════ */}
            {!loading && totalResults > 0 && (
                <nav
                    className="flex items-center justify-between flex-wrap gap-3 mt-6"
                    aria-label="Trainers pagination"
                >
                    <p className="text-sm text-muted mb-0">
                        Showing{' '}
                        <span className="font-semibold text-defaulttextcolor">
                            {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, totalResults)}
                        </span>{' '}
                        of <span className="font-semibold text-defaulttextcolor">{totalResults}</span> trainers
                    </p>

                    <ul className="flex items-center gap-1 mb-0">
                        <li>
                            <button
                                type="button"
                                className="ti-btn ti-btn-sm ti-btn-light"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                aria-label="Previous page"
                            >
                                <i className="ri-arrow-left-s-line"></i>
                            </button>
                        </li>

                        {getPageNumbers(page, totalPages).map((item, idx) =>
                            item === '...' ? (
                                <li key={`ellipsis-${idx}`} className="px-2 text-muted select-none">
                                    …
                                </li>
                            ) : (
                                <li key={item}>
                                    <button
                                        type="button"
                                        className={`ti-btn ti-btn-sm ${
                                            item === page ? 'ti-btn-primary' : 'ti-btn-light'
                                        }`}
                                        onClick={() => setPage(item as number)}
                                        aria-label={`Go to page ${item}`}
                                        aria-current={item === page ? 'page' : undefined}
                                    >
                                        {item}
                                    </button>
                                </li>
                            )
                        )}

                        <li>
                            <button
                                type="button"
                                className="ti-btn ti-btn-sm ti-btn-light"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                aria-label="Next page"
                            >
                                <i className="ri-arrow-right-s-line"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            <CompanyTrainerProfileDrawer
                open={profileDrawerOpen}
                trainer={selectedTrainer}
                loading={profileLoading}
                onClose={handleCloseProfileDrawer}
                onBookSession={handleBookSessionFromProfile}
            />

            <CompanyBookingDrawer
                trainer={trainerToBook}
                isOpen={bookingDrawerOpen}
                onClose={() => {
                    setBookingDrawerOpen(false);
                    setTrainerToBook(null);
                }}
                onSuccess={handleBookingSuccess}
            />
        </Fragment>
    );
};

export default TrainersPage;

