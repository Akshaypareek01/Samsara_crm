"use client";
import React, { useState, useEffect } from 'react';
import bookingService, { Booking } from '@/services/bookingService';
import StatusBadge from '@/shared/components/StatusBadge';
import { formatBookingDate, formatBookingTime, formatDuration, canCancelBooking } from '@/shared/utils/bookingUtils';
import Swal from 'sweetalert2';

const CompanyBookingsList: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: 10,
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
    }, [currentPage, statusFilter, refreshTrigger]);

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
                Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
                loadBookings();
            } catch (error: any) {
                Swal.fire('Error', error.message || 'Failed to cancel booking', 'error');
            }
        }
    };

    const viewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const getTrainerName = (booking: Booking): string => {
        return typeof booking.trainer === 'string' ? 'Trainer' : booking.trainer?.name || 'Unknown';
    };

    const getTrainerTitle = (booking: Booking): string => {
        return typeof booking.trainer === 'string' ? '' : booking.trainer?.title || '';
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
                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="form-control"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="text-sm text-muted flex items-center">
                        Total: {totalResults} bookings
                    </div>
                </div>

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
                        <p className="text-sm text-muted">Your bookings will appear here</p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                                <thead>
                                    <tr>
                                        <th>Trainer</th>
                                        <th>Date & Time</th>
                                        <th>Duration</th>
                                        <th>Training Types</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking._id || booking.id}>
                                            <td>
                                                <div>
                                                    <span className="font-semibold">{getTrainerName(booking)}</span>
                                                    {getTrainerTitle(booking) && (
                                                        <div className="text-sm text-muted">{getTrainerTitle(booking)}</div>
                                                    )}
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
                                                {booking.paymentStatus?.isPaid ? (
                                                    <span className="badge bg-success/10 text-success">Paid</span>
                                                ) : (
                                                    <span className="badge bg-warning/10 text-warning">Pending</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => viewDetails(booking)}
                                                        className="ti-btn ti-btn-sm ti-btn-info"
                                                        title="View Details"
                                                    >
                                                        <i className="ri-eye-line"></i>
                                                    </button>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="ti-btn ti-btn-sm"
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="ti-btn ti-btn-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Booking Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="ti-btn ti-btn-sm ti-btn-ghost"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-muted">Trainer</label>
                                    <p className="text-defaulttextcolor">{getTrainerName(selectedBooking)}</p>
                                    {getTrainerTitle(selectedBooking) && (
                                        <p className="text-sm text-muted">{getTrainerTitle(selectedBooking)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted">Status</label>
                                    <p className="text-defaulttextcolor">
                                        <StatusBadge status={selectedBooking.status} />
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted">Booking Date</label>
                                    <p className="text-defaulttextcolor">{formatDate(selectedBooking.bookingDate)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted">Start Time</label>
                                    <p className="text-defaulttextcolor">{formatTime(selectedBooking.startTime)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted">Duration</label>
                                    <p className="text-defaulttextcolor">{selectedBooking.duration} hours</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted">Payment Status</label>
                                    <p className="text-defaulttextcolor">
                                        {selectedBooking.paymentStatus?.isPaid ? (
                                            <span className="badge bg-success/10 text-success">Paid</span>
                                        ) : (
                                            <span className="badge bg-warning/10 text-warning">Pending</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-muted">Training Types</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedBooking.typeOfTraining.map((type, idx) => (
                                        <span key={idx} className="badge bg-info/10 text-info">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div>
                                    <label className="text-sm font-semibold text-muted">Your Notes</label>
                                    <p className="text-defaulttextcolor">{selectedBooking.notes}</p>
                                </div>
                            )}

                            {selectedBooking.adminNotes && (
                                <div>
                                    <label className="text-sm font-semibold text-muted">Admin Notes</label>
                                    <p className="text-defaulttextcolor">{selectedBooking.adminNotes}</p>
                                </div>
                            )}

                            {selectedBooking.trainerNotes && (
                                <div>
                                    <label className="text-sm font-semibold text-muted">Trainer Notes</label>
                                    <p className="text-defaulttextcolor">{selectedBooking.trainerNotes}</p>
                                </div>
                            )}

                            {selectedBooking.paymentStatus?.isPaid && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Payment Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedBooking.paymentStatus.paymentMode && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Payment Mode</label>
                                                <p className="text-defaulttextcolor capitalize">
                                                    {selectedBooking.paymentStatus.paymentMode.replace('_', ' ')}
                                                </p>
                                            </div>
                                        )}
                                        {selectedBooking.paymentStatus.paymentType && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Payment Type</label>
                                                <p className="text-defaulttextcolor capitalize">
                                                    {selectedBooking.paymentStatus.paymentType}
                                                </p>
                                            </div>
                                        )}
                                        {selectedBooking.paymentStatus.paymentAmount && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Amount</label>
                                                <p className="text-defaulttextcolor">₹{selectedBooking.paymentStatus.paymentAmount}</p>
                                            </div>
                                        )}
                                        {selectedBooking.paymentStatus.transactionId && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Transaction ID</label>
                                                <p className="text-defaulttextcolor">{selectedBooking.paymentStatus.transactionId}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="ti-btn ti-btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyBookingsList;
