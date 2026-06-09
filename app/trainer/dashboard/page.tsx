"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import { useRouter } from 'next/navigation';
import { TRAINER_ACCEPTING_BOOKINGS_EVENT, type TrainerAcceptingBookingsDetail } from '@/utils/trainerAvailabilitySync';
import { useTrainerDashboardStats } from '@/hooks/useTrainerDashboardStats';
import TrainerStatCards from './components/TrainerStatCards';
import TrainerAnalyticsCharts from './components/TrainerAnalyticsCharts';
import TrainerRatingBadge from '@/shared/components/trainer/TrainerRatingBadge';
import TrainerReviewsSection from './components/TrainerReviewsSection';

const TrainerDashboard = () => {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { kpis, charts, loading: statsLoading, error: statsError } = useTrainerDashboardStats();

    useEffect(() => {
        fetchMyProfile();
    }, []);

    useEffect(() => {
        const onSync = (ev: Event) => {
            const ce = ev as CustomEvent<TrainerAcceptingBookingsDetail>;
            if (typeof ce.detail?.acceptingBookings !== 'boolean') return;
            setTrainer((prev) =>
                prev ? { ...prev, acceptingBookings: ce.detail.acceptingBookings } : prev
            );
        };
        window.addEventListener(TRAINER_ACCEPTING_BOOKINGS_EVENT, onSync as EventListener);
        return () => window.removeEventListener(TRAINER_ACCEPTING_BOOKINGS_EVENT, onSync as EventListener);
    }, []);

    const fetchMyProfile = async () => {
        try {
            setLoading(true);
            const profile = await TrainerService.getMyProfile();
            setTrainer(profile);
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                router.push('/trainer/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Seo title={"Trainer Dashboard"} />
            <Pageheader currentpage="Dashboard" activepage="Trainer" mainpage="Dashboard" />

            {statsError && (
                <div className="alert alert-warning mb-4" role="status">
                    {statsError}
                </div>
            )}

            {!loading && trainer && trainer.status !== false && trainer.acceptingBookings === false && (
                <div className="alert alert-warning mb-4" role="status" aria-live="polite">
                    You are not accepting new bookings. Companies will see booking disabled until you turn this
                    back on from the header or Profile.
                </div>
            )}

            {/* ── Welcome / profile banner ───────────────────────── */}
            <div className="box mb-6 overflow-hidden">
                <div className="box-body p-5">
                    {loading ? (
                        <div className="text-center py-6">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : trainer ? (
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 min-w-0 flex-1">
                                {trainer.profilePhoto?.path ? (
                                    <img
                                        src={trainer.profilePhoto.path}
                                        alt={trainer.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-20 h-20 rounded-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0"
                                        aria-hidden="true"
                                    >
                                        <span className="text-primary font-semibold text-3xl">
                                            {trainer.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                                        <h3 className="text-xl font-bold mb-0">Welcome back, {trainer.name}</h3>
                                        <span
                                            className={`badge shrink-0 ${trainer.status !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                                        >
                                            {trainer.status !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-muted mb-0 mt-1">{trainer.title}</p>
                                    <TrainerRatingBadge trainer={trainer} size="md" className="mt-2" />
                                </div>
                            </div>

                            <div
                                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start lg:justify-end gap-3 pt-4 border-t border-defaultborder/60 lg:pt-0 lg:border-t-0 lg:flex-shrink-0"
                                role="group"
                                aria-label="Quick navigation"
                            >
                                <Link
                                    href="/trainer/dashboard/bookings"
                                    className="ti-btn ti-btn-primary !m-0 inline-flex items-center justify-center gap-2 !px-5 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.75rem] rounded-lg shadow-sm"
                                >
                                    <i className="ri-calendar-check-line text-base leading-none" aria-hidden="true"></i>
                                    <span>Bookings</span>
                                </Link>
                                <Link
                                    href="/trainer/dashboard/profile"
                                    className="ti-btn ti-btn-outline-primary !m-0 inline-flex items-center justify-center gap-2 !px-5 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.75rem] rounded-lg bg-white dark:bg-bodybg"
                                >
                                    <i className="ri-user-line text-base leading-none" aria-hidden="true"></i>
                                    <span>Profile</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted mb-0">Unable to load profile</p>
                        </div>
                    )}
                </div>
            </div>

            <TrainerReviewsSection trainer={trainer} />

            {/* ── KPI cards ──────────────────────────────────────── */}
            <h5 className="font-bold text-lg text-defaulttextcolor mb-4">Analytics Overview</h5>
            <TrainerStatCards kpis={kpis} loading={statsLoading} />

            {/* ── Charts ─────────────────────────────────────────── */}
            <TrainerAnalyticsCharts charts={charts} loading={statsLoading} />
        </Fragment>
    );
};

export default TrainerDashboard;
