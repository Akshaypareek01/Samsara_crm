"use client";
import React, { useState, useEffect } from 'react';
import trainerService, { Trainer, isTrainerAcceptingBookings } from '@/services/trainerService';
import { getTrainerBookableTrainingTypes } from './companyTrainerProfileUtils';
import companyService from '@/services/companyService';
import bookingService, { CreateBookingRequest } from '@/services/bookingService';
import Swal from 'sweetalert2';
import BookingStartTimeField, { isWithinWeeklyAvailability } from '@/shared/components/booking/BookingStartTimeField';
import { AVAILABILITY_ERROR_MESSAGE, mapBookingAvailabilityError } from '@/shared/utils/trainerAvailabilityUtils';

const CreateBookingForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<CreateBookingRequest>({
        company: '',
        trainer: '',
        bookingDate: '',
        startTime: '',
        duration: 2,
        employeeCount: 0,
        typeOfTraining: [],
        notes: '',
    });

    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingTrainers, setLoadingTrainers] = useState(true);

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Load trainers and company info
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingTrainers(true);

                // Get company profile to set company ID
                const companyProfile = await companyService.getCompanyProfile();
                setFormData(prev => ({ ...prev, company: companyProfile._id || companyProfile.id || '' }));

                // Get all active trainers
                const trainersResponse = await trainerService.getTrainers({
                    status: true,
                    acceptingBookings: true,
                    limit: 100,
                });
                setTrainers(trainersResponse.results);
            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load trainers. Please refresh the page.',
                });
            } finally {
                setLoadingTrainers(false);
            }
        };

        loadData();
    }, []);

    // Update available training types when trainer changes
    useEffect(() => {
        if (selectedTrainer) {
            setFormData(prev => ({ ...prev, typeOfTraining: [] }));
        }
    }, [selectedTrainer]);

    const handleTrainerChange = async (trainerId: string) => {
        const trainer = trainers.find(t => (t._id || t.id) === trainerId);
        setSelectedTrainer(trainer || null);
        setFormData(prev => ({ ...prev, trainer: trainerId, startTime: '' }));
        if (trainerId) {
            try {
                const full = await trainerService.getTrainerById(trainerId);
                setSelectedTrainer(full);
            } catch {
                // keep list row if detail fetch fails
            }
        }
    };

    const handleTrainingTypeToggle = (type: string) => {
        setFormData(prev => {
            const types = prev.typeOfTraining.includes(type)
                ? prev.typeOfTraining.filter(t => t !== type)
                : [...prev.typeOfTraining, type];
            return { ...prev, typeOfTraining: types };
        });
    };

    const validateForm = (): boolean => {
        if (!formData.trainer) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select a trainer' });
            return false;
        }
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
        if (!Number.isInteger(formData.employeeCount) || formData.employeeCount < 1) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Enter how many employees will attend (minimum 1)' });
            return false;
        }
        if (formData.typeOfTraining.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select at least one training type' });
            return false;
        }
        if (selectedTrainer && !isTrainerAcceptingBookings(selectedTrainer)) {
            Swal.fire({
                icon: 'info',
                title: 'Trainer unavailable',
                text: 'This trainer is not accepting new bookings at the moment.',
            });
            return false;
        }

        // Validate date is in future
        const bookingDateTime = new Date(`${formData.bookingDate}T${formData.startTime}`);
        if (bookingDateTime <= new Date()) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Booking date and time must be in the future' });
            return false;
        }
        if (
            selectedTrainer?.weeklyAvailability?.length &&
            !isWithinWeeklyAvailability(
                selectedTrainer.weeklyAvailability,
                formData.bookingDate,
                formData.startTime,
                formData.duration
            )
        ) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: AVAILABILITY_ERROR_MESSAGE });
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
                text: 'Your booking has been submitted and is waiting for trainer approval.',
                confirmButtonText: 'OK',
            });

            // Reset form
            setFormData(prev => ({
                company: prev.company,
                trainer: '',
                bookingDate: '',
                startTime: '',
                duration: 2,
                employeeCount: 0,
                typeOfTraining: [],
                notes: '',
            }));
            setSelectedTrainer(null);

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error creating booking:', error);
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: mapBookingAvailabilityError(error) || error.message || 'Failed to create booking. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const availableTypes = getTrainerBookableTrainingTypes(selectedTrainer);

    return (
        <div className="box">
            <div className="box-header">
                <h5 className="box-title">Create New Booking</h5>
            </div>
            <div className="box-body">
                <form onSubmit={handleSubmit}>
                    {/* Trainer Selection */}
                    <div className="mb-4">
                        <label className="form-label">Select Trainer <span className="text-danger">*</span></label>
                        {loadingTrainers ? (
                            <div className="text-center py-3">Loading trainers...</div>
                        ) : (
                            <select
                                className="form-control"
                                value={formData.trainer}
                                onChange={(e) => handleTrainerChange(e.target.value)}
                                required
                            >
                                <option value="">Choose a trainer...</option>
                                {trainers.map((trainer) => {
                                    const bookable = isTrainerAcceptingBookings(trainer);
                                    return (
                                    <option
                                        key={trainer._id || trainer.id}
                                        value={trainer._id || trainer.id}
                                        disabled={!bookable}
                                    >
                                        {trainer.name} - {trainer.title}
                                        {!bookable ? ' (not accepting bookings)' : ''}
                                    </option>
                                );})}
                            </select>
                        )}
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
                        <BookingStartTimeField
                            id="create-booking-time"
                            bookingDate={formData.bookingDate}
                            startTime={formData.startTime}
                            durationHours={formData.duration}
                            weeklyAvailability={selectedTrainer?.weeklyAvailability}
                            onChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
                        />
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

                    {/* Employees attending */}
                    <div className="mb-4">
                        <label className="form-label" htmlFor="create-booking-employees">
                            Employees attending <span className="text-danger">*</span>
                        </label>
                        <input
                            id="create-booking-employees"
                            type="number"
                            className="form-control"
                            value={formData.employeeCount || ""}
                            min={1}
                            step={1}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    employeeCount: parseInt(e.target.value, 10) || 0,
                                }))
                            }
                            placeholder="e.g. 25"
                            required
                            aria-describedby="create-booking-employees-hint"
                        />
                        <small id="create-booking-employees-hint" className="text-muted">
                            How many employees will join this session?
                        </small>
                    </div>

                    {/* Training Types */}
                    <div className="mb-4">
                        <label className="form-label">Training Types <span className="text-danger">*</span></label>
                        {!selectedTrainer ? (
                            <p className="text-muted">Please select a trainer first</p>
                        ) : availableTypes.length === 0 ? (
                            <p className="text-muted">No training types available for this trainer</p>
                        ) : (
                            <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {availableTypes.map((type) => (
                                    <div key={type} className="form-check mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`type-${type}`}
                                                    checked={formData.typeOfTraining.includes(type)}
                                                    onChange={() => handleTrainingTypeToggle(type)}
                                                    disabled={!selectedTrainer || !isTrainerAcceptingBookings(selectedTrainer)}
                                                />
                                        <label className="form-check-label" htmlFor={`type-${type}`}>
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
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Add any special requirements or notes..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="text-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || loadingTrainers || (selectedTrainer !== null && !isTrainerAcceptingBookings(selectedTrainer))}
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
    );
};

export default CreateBookingForm;
