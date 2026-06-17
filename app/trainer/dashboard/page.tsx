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
import TrainerReviewsSection from './components/TrainerReviewsSection';
import TrainerHomeWelcomeBanner from './components/home/TrainerHomeWelcomeBanner';
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

            <TrainerHomeWelcomeBanner
                userName={trainer?.name?.split(" ")[0] ?? ""}
                loading={loading}
            />

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
