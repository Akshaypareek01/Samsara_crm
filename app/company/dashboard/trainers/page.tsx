"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService, { Trainer, SPECIALIST_OPTIONS } from '@/services/trainerService';
import BookingModal from '../components/BookingModal';

const TrainersPage = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [trainerToBook, setTrainerToBook] = useState<Trainer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialist, setFilterSpecialist] = useState('');

    useEffect(() => {
        fetchTrainers();
    }, [searchTerm, filterSpecialist]);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            setError('');
            const params: any = {
                status: true, // Only show active trainers
                page: 1,
                limit: 50,
                sortBy: 'createdAt:desc',
            };

            if (searchTerm) {
                params.name = searchTerm;
            }

            if (filterSpecialist) {
                params.specialistIn = filterSpecialist;
            }

            const response = await TrainerService.getTrainers(params);
            setTrainers(response.results || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch trainers');
            console.error('Error fetching trainers:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleTrainerClick = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setShowProfileModal(true);
    };

    const handleBookTrainer = (trainer: Trainer) => {
        setTrainerToBook(trainer);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        setShowBookingModal(false);
        setTrainerToBook(null);
        // Optionally refresh trainers list or show success message
    };

    const handleCloseModal = () => {
        setShowProfileModal(false);
        setSelectedTrainer(null);
    };

    return (
        <Fragment>
            <Seo title={"Trainers"} />
            <Pageheader currentpage="Trainers" activepage="Company" mainpage="Trainers" />

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="box mb-4">
                <div className="box-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Search by Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search trainers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Filter by Specialist</label>
                            <select
                                className="form-control"
                                value={filterSpecialist}
                                onChange={(e) => setFilterSpecialist(e.target.value)}
                            >
                                <option value="">All Specialists</option>
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookTrainer(trainer);
                                            }}
                                            className="ti-btn ti-btn-primary w-full"
                                        >
                                            <i className="ri-calendar-check-line me-1"></i>Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Trainer Profile Modal */}
            {showProfileModal && selectedTrainer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Trainer Profile</h3>
                            <button
                                onClick={handleCloseModal}
                                className="ti-btn ti-btn-sm ti-btn-ghost"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4">
                                <div className="text-center">
                                    {selectedTrainer.profilePhoto?.path ? (
                                        <img
                                            src={selectedTrainer.profilePhoto.path}
                                            alt={selectedTrainer.name}
                                            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
                                            <span className="text-primary font-semibold text-5xl">
                                                {selectedTrainer.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <h4 className="font-semibold text-xl mb-1">{selectedTrainer.name}</h4>
                                    <p className="text-muted mb-4">{selectedTrainer.title}</p>

                                    <button
                                        onClick={() => handleBookTrainer(selectedTrainer)}
                                        className="ti-btn ti-btn-primary w-full"
                                    >
                                        <i className="ri-calendar-check-line me-1"></i>Book Trainer
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-8">
                                <div className="space-y-4">
                                    {/* Specialist In */}
                                    <div>
                                        <label className="text-muted text-sm font-semibold">Specialist In</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Array.isArray(selectedTrainer.specialistIn) ? (
                                                selectedTrainer.specialistIn.map((spec, idx) => (
                                                    <span key={idx} className="badge bg-info/10 text-info">
                                                        {spec}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="badge bg-info/10 text-info">
                                                    {selectedTrainer.specialistIn}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {selectedTrainer.bio && selectedTrainer.bio !== 'none' && (
                                        <div>
                                            <label className="text-muted text-sm font-semibold">About</label>
                                            <p className="text-defaulttextcolor mt-1">{selectedTrainer.bio}</p>
                                        </div>
                                    )}

                                    {/* Type of Training */}
                                    <div>
                                        <label className="text-muted text-sm font-semibold">Training Programs Offered</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Array.isArray(selectedTrainer.typeOfTraining) ? (
                                                selectedTrainer.typeOfTraining.map((training, idx) => (
                                                    <span key={idx} className="badge bg-primary/10 text-primary">
                                                        {training}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="badge bg-primary/10 text-primary">
                                                    {selectedTrainer.typeOfTraining}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="text-muted text-sm font-semibold">Status</label>
                                        <div className="mt-1">
                                            <span className={`badge ${selectedTrainer.status !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                {selectedTrainer.status !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gallery */}
                                    {selectedTrainer.images && selectedTrainer.images.length > 0 && (
                                        <div>
                                            <label className="text-muted text-sm font-semibold">Gallery</label>
                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                {selectedTrainer.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.path}
                                                        alt={`Gallery ${idx + 1}`}
                                                        className="w-full h-24 object-cover rounded"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default TrainersPage;
