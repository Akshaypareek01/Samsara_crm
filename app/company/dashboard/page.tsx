"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const CompanyDashboard = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalTrainers, setTotalTrainers] = useState(0);
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
        Swal.fire({
            title: 'Book Trainer',
            html: `Would you like to book <strong>${trainer.name}</strong>?<br/><br/>This feature will be available soon!`,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });
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
                                                            className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-2 border-defaultborder"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-28 h-28 rounded-full bg-gradient-to-b from-gray-300 to-gray-600 flex items-center justify-center mx-auto mb-4 border-2 border-defaultborder">
                                                            <span className="text-white font-semibold text-3xl">
                                                                {trainer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <h5 className="font-bold text-base mb-1 text-defaulttextcolor capitalize">{trainer.name}</h5>
                                                    <p className="text-muted text-sm mb-4 min-h-[2rem] line-clamp-2">{trainer.title}</p>
                                                    <div className="flex flex-col gap-2 mt-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            className="w-full !bg-info/10 !text-info hover:!bg-info/20 rounded-lg !py-2.5 !px-3 flex items-center justify-center gap-2 border border-info/20 !font-medium !text-sm"
                                                            title={trainer.specialistIn}
                                                        >
                                                            <i className="ri-calendar-line text-base"></i>
                                                            <span className="truncate">{trainer.specialistIn}</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleBookTrainer(trainer, e)}
                                                            className="ti-btn !bg-primary !text-white hover:!bg-primary/90 w-full !font-medium !py-2.5 rounded-lg"
                                                        >
                                                            Book
                                                        </button>
                                                    </div>
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
        </Fragment>
    );
}

export default CompanyDashboard;

