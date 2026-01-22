"use client";
import React, { useState, useEffect } from 'react';
import { Trainer, TYPE_OF_TRAINING_OPTIONS } from '@/services/trainerService';
import companyService from '@/services/companyService';
import bookingService, { CreateBookingRequest } from '@/services/bookingService';
import Swal from 'sweetalert2';

interface BookingModalProps {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ trainer, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CreateBookingRequest>({
        company: '',
        trainer: '',
        bookingDate: '',
        startTime: '',
        duration: 2,
        typeOfTraining: [],
        notes: '',
    });

    const [loading, setLoading] = useState(false);

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Load company info and set trainer when modal opens
    useEffect(() => {
        if (isOpen && trainer) {
            const loadCompanyData = async () => {
                try {
                    const companyProfile = await companyService.getCompanyProfile();
                    setFormData({
                        company: companyProfile._id || companyProfile.id || '',
                        trainer: trainer._id || trainer.id || '',
                        bookingDate: '',
                        startTime: '',
                        duration: 2,
                        typeOfTraining: [],
                        notes: '',
                    });
                } catch (error) {
                    console.error('Error loading company data:', error);
                }
            };
            loadCompanyData();
        }
    }, [isOpen, trainer]);

    const handleTrainingTypeToggle = (type: string) => {
        setFormData(prev => {
            const types = prev.typeOfTraining.includes(type)
                ? prev.typeOfTraining.filter(t => t !== type)
                : [...prev.typeOfTraining, type];
            return { ...prev, typeOfTraining: types };
        });
    };

    const validateForm = (): boolean => {
        if (!formData.bookingDate) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select a date' });
            return false;
        }
        if (!formData.startTime) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select a time' });
            return false;
        }
        if (formData.duration < 0.5 || formData.duration > 24) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Duration must be between 0.5 and 24 hours' });
            return false;
        }
        if (formData.typeOfTraining.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select at least one training type' });
            return false;
        }

        // Validate date is in future
        const bookingDateTime = new Date(`${formData.bookingDate}T${formData.startTime}`);
        if (bookingDateTime <= new Date()) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Booking date and time must be in the future' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            await bookingService.createBooking(formData);

            Swal.fire({
                icon: 'success',
                title: 'Booking Created!',
                text: 'Your booking has been submitted and is waiting for admin approval.',
                confirmButtonText: 'OK',
            });

            // Reset form and close modal
            setFormData(prev => ({
                company: prev.company,
                trainer: '',
                bookingDate: '',
                startTime: '',
                duration: 2,
                typeOfTraining: [],
                notes: '',
            }));

            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error creating booking:', error);
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: error.message || 'Failed to create booking. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Get available training types for selected trainer
    const getAvailableTrainingTypes = (): string[] => {
        if (!trainer) return [];

        const trainerTypes = Array.isArray(trainer.typeOfTraining)
            ? trainer.typeOfTraining
            : [trainer.typeOfTraining];

        return TYPE_OF_TRAINING_OPTIONS.filter(type =>
            trainerTypes.some(tt => tt.toLowerCase().includes(type.toLowerCase()) || type.toLowerCase().includes(tt.toLowerCase()))
        );
    };

    const availableTypes = getAvailableTrainingTypes();

    if (!isOpen || !trainer) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-bodybg rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-bodybg border-b border-defaultborder p-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Book {trainer.name}</h3>
                    <button
                        onClick={onClose}
                        className="ti-btn ti-btn-sm ti-btn-ghost"
                        type="button"
                    >
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Trainer Info */}
                        <div className="mb-4 p-4 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                {trainer.profilePhoto?.path ? (
                                    <img
                                        src={trainer.profilePhoto.path}
                                        alt={trainer.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold text-2xl">
                                            {trainer.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-lg">{trainer.name}</h4>
                                    <p className="text-muted text-sm">{trainer.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="form-label">Booking Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.bookingDate}
                                    min={getMinDate()}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Start Time <span className="text-danger">*</span></label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="mb-4">
                            <label className="form-label">Duration (hours) <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.duration}
                                min="0.5"
                                max="24"
                                step="0.5"
                                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                                required
                            />
                            <small className="text-muted">Enter duration between 0.5 and 24 hours</small>
                        </div>

                        {/* Training Types */}
                        <div className="mb-4">
                            <label className="form-label">Training Types <span className="text-danger">*</span></label>
                            {availableTypes.length === 0 ? (
                                <p className="text-muted">No training types available for this trainer</p>
                            ) : (
                                <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {availableTypes.map((type) => (
                                        <div key={type} className="form-check mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`modal-type-${type}`}
                                                checked={formData.typeOfTraining.includes(type)}
                                                onChange={() => handleTrainingTypeToggle(type)}
                                            />
                                            <label className="form-check-label" htmlFor={`modal-type-${type}`}>
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <small className="text-muted">Selected: {formData.typeOfTraining.length}</small>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="form-label">Notes (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add any special requirements or notes..."
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="ti-btn ti-btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="ti-btn ti-btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Booking'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
