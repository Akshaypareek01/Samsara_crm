"use client";

import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import TrainerService, { Trainer, isTrainerAcceptingBookings } from "@/services/trainerService";
import CompanyService from "@/services/companyService";
import { useRouter } from "next/navigation";
import BookingModal from "./BookingModal";
import {
    CompanyDashboardMainAnalytics,
    CompanyDashboardRightRail,
} from "./CompanyDashboardDataPanels";

/**
 * Analytics overview dashboard (charts, metrics, featured trainers).
 */
const CompanyAnalyticsDashboard = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [trainerToBook, setTrainerToBook] = useState<Trainer | null>(null);
    const [activeFilter, setActiveFilter] = useState("Weekly");
    const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const router = useRouter();

    const fetchTrainers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await TrainerService.getTrainers({
                status: true,
                acceptingBookings: true,
                page: 1,
                limit: 6,
                sortBy: "createdAt:desc",
            });
            setTrainers(response.results || []);
        } catch (err) {
            console.error("Error fetching trainers:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOverview = useCallback(async () => {
        try {
            setOverviewLoading(true);
            const data = await CompanyService.getDashboardOverview(
                activeFilter as 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
            );
            setOverview(data as Record<string, unknown>);
        } catch (err) {
            console.error("Error fetching dashboard overview:", err);
            setOverview(null);
        } finally {
            setOverviewLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        void fetchTrainers();
    }, [fetchTrainers]);

    useEffect(() => {
        void fetchOverview();
    }, [fetchOverview]);

    const handleTrainerClick = () => {
        router.push("/company/dashboard/trainers");
    };

    const handleBookTrainer = (trainer: Trainer, e: React.MouseEvent) => {
        e.stopPropagation();
        setTrainerToBook(trainer);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        setShowBookingModal(false);
        setTrainerToBook(null);
        void fetchOverview();
        void fetchTrainers();
    };

    return (
        <Fragment>
            <Seo title={"Analytics"} />
            <Pageheader currentpage="Analytics" activepage="Company" mainpage="Analytics" />

            <div className="grid grid-cols-12 gap-6">
                <div className="xl:col-span-9 col-span-12 flex flex-col gap-6">
                    <CompanyDashboardMainAnalytics
                        overview={overview}
                        loading={overviewLoading}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />

                    <div className="box">
                        <div className="box-header justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="w-0.5 h-4 bg-info rounded"></div>
                                    <div className="w-0.5 h-3 bg-info rounded"></div>
                                </div>
                                <div className="box-title !mb-0 font-bold text-lg">Featured Trainers</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push("/company/dashboard/trainers")}
                                className="bg-primary text-white px-4 py-2 rounded-md inline-flex items-center justify-center whitespace-nowrap leading-none hover:bg-primary/90 transition"
                            >
                                View All
                            </button>
                        </div>
                        <div className="box-body">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : trainers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted">No trainers available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {trainers.map((trainer) => (
                                        <div
                                            key={trainer._id || trainer.id}
                                            className="box hover:shadow-lg transition-shadow cursor-pointer border border-defaultborder bg-white rounded-lg"
                                            onClick={() => handleTrainerClick()}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    handleTrainerClick();
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Open trainers, ${trainer.name}`}
                                        >
                                            <div className="box-body p-5">
                                                <div className="text-center">
                                                    {trainer.profilePhoto?.path ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={trainer.profilePhoto.path}
                                                            alt=""
                                                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-primary/20"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center mx-auto mb-3 border-2 border-primary/20">
                                                            <span className="text-primary font-semibold text-2xl">
                                                                {trainer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <h5 className="font-bold text-sm mb-1 text-defaulttextcolor">
                                                        {trainer.name}
                                                    </h5>
                                                    <p className="text-muted text-xs mb-3">{trainer.title}</p>
                                                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                                                        {Array.isArray(trainer.specialistIn) ? (
                                                            trainer.specialistIn.slice(0, 1).map((spec, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="badge bg-info/10 text-info text-xs"
                                                                >
                                                                    {spec}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="badge bg-info/10 text-info text-xs">
                                                                {trainer.specialistIn}
                                                            </span>
                                                        )}
                                                        {Array.isArray(trainer.specialistIn) &&
                                                            trainer.specialistIn.length > 1 && (
                                                                <span className="badge bg-secondary/10 text-secondary text-xs">
                                                                    +{trainer.specialistIn.length - 1}
                                                                </span>
                                                            )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleBookTrainer(trainer, e)}
                                                        className="ti-btn ti-btn-primary w-full text-xs"
                                                        disabled={!isTrainerAcceptingBookings(trainer)}
                                                        title={
                                                            !isTrainerAcceptingBookings(trainer)
                                                                ? "Trainer is not accepting new bookings"
                                                                : "Book this trainer"
                                                        }
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <CompanyDashboardRightRail overview={overview} />
            </div>

            <BookingModal
                trainer={trainerToBook}
                isOpen={showBookingModal}
                onClose={() => {
                    setShowBookingModal(false);
                    setTrainerToBook(null);
                }}
                onSuccess={handleBookingSuccess}
            />
        </Fragment>
    );
};

export default CompanyAnalyticsDashboard;
