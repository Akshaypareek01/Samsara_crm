"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import { useRouter } from 'next/navigation';
import BookingModal from './components/BookingModal';

const CompanyDashboard = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalTrainers, setTotalTrainers] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [trainerToBook, setTrainerToBook] = useState<Trainer | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            const response = await TrainerService.getTrainers({
                status: true,
                page: 1,
                limit: 6, // Show only 6 on dashboard
                sortBy: 'createdAt:desc',
            });
            setTrainers(response.results || []);
            setTotalTrainers(response.totalResults || 0);
        } catch (err) {
            console.error('Error fetching trainers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTrainerClick = (trainer: Trainer) => {
        router.push('/company/dashboard/trainers');
    };

    const handleBookTrainer = (trainer: Trainer, e: React.MouseEvent) => {
        e.stopPropagation();
        setTrainerToBook(trainer);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        setShowBookingModal(false);
        setTrainerToBook(null);
    };

    return (
        <Fragment>
            <Seo title={"Company Dashboard"} />
            <Pageheader currentpage="Dashboard" activepage="Company" mainpage="Dashboard" />
            <div className="grid grid-cols-12 gap-6">
                <div className="xl:col-span-12 col-span-12">
                    <div className="box">
                        <div className="box-body">
                            <h3 className="text-xl font-bold mb-4">Welcome to the Company Dashboard</h3>
                            <p className="text-gray-500">
                                Navigate through the menu to manage trainers, view user speeches, and update settings.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                <div className="p-4 bg-primary/10 rounded-lg">
                                    <h4 className="font-semibold text-lg text-primary">Trainers</h4>
                                    <p className="text-2xl font-bold">{totalTrainers}</p>
                                </div>
                                <div className="p-4 bg-success/10 rounded-lg">
                                    <h4 className="font-semibold text-lg text-success">Speeches</h4>
                                    <p className="text-2xl font-bold">45</p>
                                </div>
                                <div className="p-4 bg-warning/10 rounded-lg">
                                    <h4 className="font-semibold text-lg text-warning">Pending</h4>
                                    <p className="text-2xl font-bold">3</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Trainers */}
                <div className="xl:col-span-12 col-span-12">
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
                                onClick={() => router.push('/company/dashboard/trainers')}
                                className="ti-btn ti-btn-sm ti-btn-primary"
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
                                            onClick={() => handleTrainerClick(trainer)}
                                        >
                                            <div className="box-body p-5">
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
                                                    <h5 className="font-bold text-sm mb-1 text-defaulttextcolor">{trainer.name}</h5>
                                                    <p className="text-muted text-xs mb-3">{trainer.title}</p>
                                                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                                                        {Array.isArray(trainer.specialistIn) ? (
                                                            trainer.specialistIn.slice(0, 1).map((spec, idx) => (
                                                                <span key={idx} className="badge bg-info/10 text-info text-xs">
                                                                    {spec}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="badge bg-info/10 text-info text-xs">
                                                                {trainer.specialistIn}
                                                            </span>
                                                        )}
                                                        {Array.isArray(trainer.specialistIn) && trainer.specialistIn.length > 1 && (
                                                            <span className="badge bg-secondary/10 text-secondary text-xs">
                                                                +{trainer.specialistIn.length - 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleBookTrainer(trainer, e)}
                                                        className="ti-btn ti-btn-primary w-full text-xs"
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
            </div>

            {/* Booking Modal */}
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
}

export default CompanyDashboard;

