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
                                <div className="flex flex-col items-center text-center">
                                    {/* Profile Photo */}
                                    {trainer.profilePhoto?.path ? (
                                        <img
                                            src={trainer.profilePhoto.path}
                                            alt={trainer.name}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 mb-4"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center border-4 border-primary/20 mb-4">
                                            <span className="text-primary font-semibold text-5xl">
                                                {trainer.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Name and Title */}
                                    <h3 className="text-2xl font-bold mb-2">{trainer.name}</h3>
                                    <p className="text-muted text-lg mb-4">{trainer.title}</p>

                                    {/* Specialties */}
                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                        {Array.isArray(trainer.specialistIn) ? (
                                            trainer.specialistIn.map((spec, idx) => (
                                                <span key={idx} className="badge bg-primary/10 text-primary">
                                                    {spec}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="badge bg-primary/10 text-primary">
                                                {trainer.specialistIn}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        <span className={`badge ${trainer.status !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                            {trainer.status !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
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
