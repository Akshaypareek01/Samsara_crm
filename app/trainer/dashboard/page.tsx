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
import { trainerHasWeeklySchedule } from '@/shared/utils/trainerAvailabilityUtils';
import SamsaraWellnessCtaBanner from '@/shared/components/SamsaraWellnessCtaBanner';

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

            {!loading && trainer && trainer.status !== false && !trainerHasWeeklySchedule(trainer.weeklyAvailability) && (
                <div className="alert alert-warning mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" role="alert">
                    <div className="flex items-start gap-2 min-w-0">
                        <i className="ri-calendar-schedule-line text-lg shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="mb-0 text-sm leading-relaxed">
                            Your weekly schedule is not set up or incomplete. Companies cannot see your
                            availability until you add time slots on your Profile.
                        </p>
                    </div>
                    <Link
                        href="/trainer/dashboard/profile"
                        className="ti-btn ti-btn-sm ti-btn-warning !m-0 shrink-0 inline-flex items-center justify-center gap-1.5 !px-4 !py-2 font-semibold"
                    >
                        <i className="ri-user-settings-line" aria-hidden="true" />
                        Update schedule
                    </Link>
                </div>
            )}

            {/* ── Welcome / profile banner ───────────────────────── */}
            <section className="trainer-dashboard-welcome mb-6" aria-label="Welcome">
                <div className="trainer-dashboard-welcome-body">
                    {loading ? (
                        <div className="text-center py-6">
                            <div className="spinner-border trainer-dashboard-welcome-spinner" role="status">
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
                                        className="trainer-dashboard-welcome-avatar w-20 h-20 rounded-full object-cover flex-shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="trainer-dashboard-welcome-avatar-fallback w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                                        aria-hidden="true"
                                    >
                                        <span className="font-semibold text-3xl">
                                            {trainer.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                                        <h3 className="trainer-dashboard-welcome-title text-xl font-bold mb-0">
                                            Welcome back, {trainer.name}
                                        </h3>
                                        <span
                                            className={`trainer-dashboard-welcome-badge shrink-0 badge ${trainer.status !== false ? 'trainer-dashboard-welcome-badge--active' : 'trainer-dashboard-welcome-badge--inactive'}`}
                                        >
                                            {trainer.status !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="trainer-dashboard-welcome-subtitle mb-0 mt-1">{trainer.title}</p>
                                    <TrainerRatingBadge trainer={trainer} size="md" className="trainer-dashboard-welcome-rating mt-2" />
                                </div>
                            </div>

                            <div
                                className="trainer-dashboard-welcome-actions flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start lg:justify-end gap-3 pt-4 lg:pt-0 lg:flex-shrink-0"
                                role="group"
                                aria-label="Quick navigation"
                            >
                                <Link
                                    href="/trainer/dashboard/bookings"
                                    className="trainer-dashboard-welcome-cta ti-btn !m-0 inline-flex items-center justify-center gap-2 !px-5 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.75rem] rounded-lg shadow-sm"
                                >
                                    <i className="ri-calendar-check-line text-base leading-none" aria-hidden="true"></i>
                                    <span>Bookings</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="trainer-dashboard-welcome-subtitle mb-0">Unable to load profile</p>
                        </div>
                    )}
                </div>
            </section>

            <TrainerReviewsSection trainer={trainer} />

            {/* ── KPI cards ──────────────────────────────────────── */}
            <h5 className="font-bold text-lg text-defaulttextcolor mb-4">Analytics Overview</h5>
            <TrainerStatCards kpis={kpis} loading={statsLoading} />

            {/* ── Charts ─────────────────────────────────────────── */}
            <TrainerAnalyticsCharts charts={charts} loading={statsLoading} />

            <div className="mt-8">
                <SamsaraWellnessCtaBanner />
            </div>
        </Fragment>
    );
};

export default TrainerDashboard;
