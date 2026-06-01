"use client";
import React, { useState, useEffect } from 'react';
import bookingService, { Booking } from '@/services/bookingService';
import StatusBadge from '@/shared/components/StatusBadge';
import { formatBookingDate, formatBookingTime, formatDuration, canConfirmBooking, canCompleteBooking, canCancelBooking } from '@/shared/utils/bookingUtils';
import { getBookingCompanyName, getCompanyLogoUrl, getBookingCompany } from '@/shared/utils/companyDisplayUtils';
import TrainerBookingDetailsDrawer from './TrainerBookingDetailsDrawer';
import { BookingsTableToolbar, BookingsTableFooter } from '@/shared/components/BookingsTablePagination';
import Swal from 'sweetalert2';

type TrainerBookingsListProps = {
    refreshTrigger?: number;
};

const TrainerBookingsList: React.FC<TrainerBookingsListProps> = ({ refreshTrigger = 0 }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [trainerNotes, setTrainerNotes] = useState('');

    const loadBookings = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: pageSize,
                sortBy: 'createdAt:desc',
            };

            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await bookingService.getMyBookings(params);
            setBookings(response.results);
            setTotalPages(response.totalPages);
            setTotalResults(response.totalResults);
        } catch (error) {
            console.error('Error loading bookings:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load bookings. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, [currentPage, pageSize, statusFilter, refreshTrigger]);

    const handleConfirmBooking = async () => {
        if (!selectedBooking) return;

        try {
            await bookingService.updateBookingStatus(selectedBooking._id || selectedBooking.id || '', {
                status: 'approved',
                trainerNotes,
            });
            Swal.fire('Accepted!', 'Booking accepted. Awaiting admin approval.', 'success');
            setShowConfirmModal(false);
            setDrawerOpen(false);
            setTrainerNotes('');
            loadBookings();
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Failed to accept booking', 'error');
        }
    };

    const handleCompleteBooking = async () => {
        if (!selectedBooking) return;

        try {
            await bookingService.updateBookingStatus(selectedBooking._id || selectedBooking.id || '', {
                status: 'completed',
                trainerNotes,
            });
            Swal.fire('Completed!', 'Booking has been marked as completed.', 'success');
            setShowCompleteModal(false);
            setDrawerOpen(false);
            setTrainerNotes('');
            loadBookings();
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Failed to complete booking', 'error');
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        const result = await Swal.fire({
            title: 'Cancel Booking?',
            text: 'Are you sure you want to cancel this booking?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it',
        });

        if (result.isConfirmed) {
            try {
                await bookingService.cancelBooking(bookingId);
                Swal.fire('Cancelled!', 'Booking has been cancelled.', 'success');
                setDrawerOpen(false);
                loadBookings();
            } catch (error: any) {
                Swal.fire('Error', error.message || 'Failed to cancel booking', 'error');
            }
        }
    };

    /**
     * Opens the details drawer and loads the full booking with company profile.
     *
     * @param booking - List row booking (may be partially populated).
     */
    const viewDetails = async (booking: Booking) => {
        const id = booking._id || booking.id || '';
        if (!id) return;
        setDrawerOpen(true);
        setDrawerLoading(true);
        setSelectedBooking(booking);
        try {
            const full = await bookingService.getBookingById(id);
            setSelectedBooking(full);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to load booking details';
            void Swal.fire({ icon: 'error', title: 'Error', text: msg });
            setDrawerOpen(false);
        } finally {
            setDrawerLoading(false);
        }
    };

    const openConfirmModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setTrainerNotes('');
        setShowConfirmModal(true);
    };

    const openCompleteModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setTrainerNotes('');
        setShowCompleteModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div className="box">
            <div className="box-body">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="w-full sm:w-64">
                        <label className="form-label" htmlFor="booking-status-filter">Filter by Status</label>
                        <select
                            id="booking-status-filter"
                            className="form-control"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            aria-label="Filter bookings by status"
                        >
                            <option value="">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {!loading && (
                    <BookingsTableToolbar
                        page={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        idPrefix="trainer-bookings"
                    />
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="ri-calendar-line text-muted" style={{ fontSize: '48px' }}></i>
                        <p className="mt-3 text-muted">No bookings found</p>
                        <p className="text-sm text-muted">Bookings will appear here once approved by admin</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                            <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Date & Time</th>
                                        <th>Duration</th>
                                        <th>Training Types</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking._id || booking.id}>
                                            <td>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {(() => {
                                                        const company = getBookingCompany(booking);
                                                        const logo = getCompanyLogoUrl(company);
                                                        return logo ? (
                                                            <img
                                                                src={logo}
                                                                alt=""
                                                                className="w-8 h-8 rounded-md object-contain border border-defaultborder bg-white flex-shrink-0"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                className="w-8 h-8 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0"
                                                                aria-hidden="true"
                                                            >
                                                                {getBookingCompanyName(booking).charAt(0).toUpperCase()}
                                                            </span>
                                                        );
                                                    })()}
                                                    <span className="font-semibold truncate">
                                                        {getBookingCompanyName(booking, 'Company')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{formatDate(booking.bookingDate)}</span>
                                                    <span className="text-sm text-muted">{formatTime(booking.startTime)}</span>
                                                </div>
                                            </td>
                                            <td>{booking.duration} hrs</td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {booking.typeOfTraining.slice(0, 2).map((type, idx) => (
                                                        <span key={idx} className="badge bg-info/10 text-info text-xs">
                                                            {type}
                                                        </span>
                                                    ))}
                                                    {booking.typeOfTraining.length > 2 && (
                                                        <span className="badge bg-secondary/10 text-secondary text-xs">
                                                            +{booking.typeOfTraining.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => void viewDetails(booking)}
                                                        className="ti-btn ti-btn-sm ti-btn-info"
                                                        title="View Details"
                                                    >
                                                        <i className="ri-eye-line"></i>
                                                    </button>
                                                    {canConfirmBooking(booking.status) && (
                                                        <button
                                                            onClick={() => openConfirmModal(booking)}
                                                            className="ti-btn ti-btn-sm ti-btn-success"
                                                            title="Accept Booking"
                                                        >
                                                            <i className="ri-check-line"></i>
                                                        </button>
                                                    )}
                                                    {canCompleteBooking(booking.status) && (
                                                        <button
                                                            onClick={() => openCompleteModal(booking)}
                                                            className="ti-btn ti-btn-sm ti-btn-primary"
                                                            title="Mark as Completed"
                                                        >
                                                            <i className="ri-check-double-line"></i>
                                                        </button>
                                                    )}
                                                    {canCancelBooking(booking.status) && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking._id || booking.id || '')}
                                                            className="ti-btn ti-btn-sm ti-btn-danger"
                                                            title="Cancel Booking"
                                                        >
                                                            <i className="ri-close-line"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                    </div>
                )}

                {!loading && (
                    <BookingsTableFooter
                        page={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        idPrefix="trainer-bookings"
                    />
                )}
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Accept Booking</h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="ti-btn ti-btn-sm ti-btn-ghost"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-success/5 rounded">
                            <p className="text-sm">
                                <strong>Company:</strong> {getBookingCompanyName(selectedBooking)}
                            </p>
                            <p className="text-sm">
                                <strong>Date:</strong> {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.startTime)}
                            </p>
                            <p className="text-sm">
                                <strong>Duration:</strong> {selectedBooking.duration} hours
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Notes (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={trainerNotes}
                                onChange={(e) => setTrainerNotes(e.target.value)}
                                placeholder="Add any notes for the company..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="ti-btn ti-btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="ti-btn ti-btn-success"
                            >
                                Accept Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {showCompleteModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Mark as Completed</h3>
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="ti-btn ti-btn-sm ti-btn-ghost"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-primary/5 rounded">
                            <p className="text-sm">
                                <strong>Company:</strong> {getBookingCompanyName(selectedBooking)}
                            </p>
                            <p className="text-sm">
                                <strong>Date:</strong> {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.startTime)}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Session Notes (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={trainerNotes}
                                onChange={(e) => setTrainerNotes(e.target.value)}
                                placeholder="Add notes about the completed session..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="ti-btn ti-btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteBooking}
                                className="ti-btn ti-btn-primary"
                            >
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TrainerBookingDetailsDrawer
                open={drawerOpen}
                booking={selectedBooking}
                loading={drawerLoading}
                onClose={() => setDrawerOpen(false)}
                onConfirm={(b) => openConfirmModal(b)}
                onComplete={(b) => openCompleteModal(b)}
                onCancel={(id) => void handleCancelBooking(id)}
            />
        </div>
    );
};

export default TrainerBookingsList;
