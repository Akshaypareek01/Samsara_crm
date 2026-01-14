"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import { useRouter } from 'next/navigation';

const TrainerDashboard = () => {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchMyProfile();
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
            <div className="grid grid-cols-12 gap-6">
                <div className="xl:col-span-12 col-span-12">
                    <div className="box">
                        <div className="box-body">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : trainer ? (
                                <>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        {trainer.profilePhoto?.path ? (
                                            <img
                                                src={trainer.profilePhoto.path}
                                                alt={trainer.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-defaultborder flex-shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-defaultborder flex-shrink-0">
                                                <span className="text-primary font-semibold text-2xl sm:text-3xl">
                                                    {trainer.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-xl sm:text-2xl font-bold mb-1">{trainer.name}</h3>
                                            <p className="text-muted text-sm sm:text-base">{trainer.title}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Welcome to your Dashboard</h3>
                                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                                        Manage your profile, view your training details, and update your information.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        <div className="p-3 sm:p-4 bg-primary/10 rounded-lg">
                                            <h4 className="font-semibold text-base sm:text-lg text-primary mb-2">Specialties</h4>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {Array.isArray(trainer.specialistIn) ? (
                                                    trainer.specialistIn.map((spec, idx) => (
                                                        <span key={idx} className="badge bg-primary/20 text-primary">
                                                            {spec}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="badge bg-primary/20 text-primary">
                                                        {trainer.specialistIn}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-success/10 rounded-lg">
                                            <h4 className="font-semibold text-base sm:text-lg text-success mb-2">Training Types</h4>
                                            <p className="text-xl sm:text-2xl font-bold">
                                                {Array.isArray(trainer.typeOfTraining) ? trainer.typeOfTraining.length : 1}
                                            </p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-info/10 rounded-lg">
                                            <h4 className="font-semibold text-base sm:text-lg text-info mb-2">Status</h4>
                                            <span className={`badge ${trainer.status !== false ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                                {trainer.status !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted">Unable to load profile</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default TrainerDashboard;
