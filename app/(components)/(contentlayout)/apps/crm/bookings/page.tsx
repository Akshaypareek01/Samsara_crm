"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import bookingService, { Booking, ApproveBookingRequest, RejectBookingRequest } from '@/services/bookingService';
import Swal from 'sweetalert2';
import StatusBadge from '@/shared/components/StatusBadge';

const BookingsManagement = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Approval/Rejection modals
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Approval form data
    const [approvalData, setApprovalData] = useState<ApproveBookingRequest>({
        paymentMode: 'cash',
        transactionId: '',
        paymentType: 'full',
        paymentAmount: 0,
        adminNotes: '',
    });

    // Rejection form data
    const [rejectionReason, setRejectionReason] = useState('');

    // Filters for all bookings
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingBookings();
        } else {
            fetchAllBookings();
        }
    }, [activeTab, statusFilter, searchTerm, page]);

    const fetchPendingBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getPendingApprovals({
                page: 1,
                limit: 50,
                sortBy: 'createdAt:desc',
            });
            setPendingBookings(response.results || []);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to fetch pending bookings');
            console.error('Error fetching pending bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: 10,
                sortBy: 'createdAt:desc',
            };

            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await bookingService.getAllBookings(params);
            setAllBookings(response.results || []);
            setTotalPages(response.totalPages || 1);
            setTotalResults(response.totalResults || 0);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (booking: Booking) => {
        setSelectedBooking(booking);
        setApprovalData({
            paymentMode: 'cash',
            transactionId: '',
            paymentType: 'full',
            paymentAmount: 0,
            adminNotes: '',
        });
        setShowApprovalModal(true);
    };

    const handleReject = (booking: Booking) => {
        setSelectedBooking(booking);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const submitApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;

        try {
            const bookingId = selectedBooking._id || selectedBooking.id;
            if (!bookingId) {
                Swal.fire('Error!', 'Booking ID not found', 'error');
                return;
            }

            await bookingService.approveBooking(bookingId, approvalData);
            Swal.fire('Success!', 'Booking approved successfully', 'success');
            setShowApprovalModal(false);
            setSelectedBooking(null);
            fetchPendingBookings();
            if (activeTab === 'all') fetchAllBookings();
        } catch (err: any) {
            Swal.fire('Error!', err.message || 'Failed to approve booking', 'error');
        }
    };

    const submitRejection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking || !rejectionReason.trim()) {
            Swal.fire('Error!', 'Please provide a rejection reason', 'warning');
            return;
        }

        try {
            const bookingId = selectedBooking._id || selectedBooking.id;
            if (!bookingId) {
                Swal.fire('Error!', 'Booking ID not found', 'error');
                return;
            }

            await bookingService.rejectBooking(bookingId, { adminNotes: rejectionReason });
            Swal.fire('Success!', 'Booking rejected', 'success');
            setShowRejectionModal(false);
            setSelectedBooking(null);
            fetchPendingBookings();
            if (activeTab === 'all') fetchAllBookings();
        } catch (err: any) {
            Swal.fire('Error!', err.message || 'Failed to reject booking', 'error');
        }
    };

    const getCompanyName = (booking: Booking): string => {
        if (typeof booking.company === 'object' && booking.company) {
            return booking.company.companyName || 'Unknown Company';
        }
        return 'Unknown Company';
    };

    const getTrainerName = (booking: Booking): string => {
        if (typeof booking.trainer === 'object' && booking.trainer) {
            return booking.trainer.name || 'Unknown Trainer';
        }
        return 'Unknown Trainer';
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
        <Fragment>
            <Seo title="Bookings Management" />

            <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
                <div>
                    <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
                        Bookings Management
                    </p>
                    <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
                        Manage and approve booking requests
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="box">
                <div className="box-body">
                    <div className="border-b border-defaultborder mb-4">
                        <nav className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted hover:text-defaulttextcolor'
                                    }`}
                            >
                                Pending Approvals
                                {pendingBookings.length > 0 && (
                                    <span className="ml-2 badge bg-primary/10 text-primary">
                                        {pendingBookings.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'all'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted hover:text-defaulttextcolor'
                                    }`}
                            >
                                All Bookings
                            </button>
                        </nav>
                    </div>

                    {/* Filters for All Bookings */}
                    {activeTab === 'all' && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="form-control"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
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
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Trainer</th>
                                        <th>Date & Time</th>
                                        <th>Duration</th>
                                        <th>Training Types</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'pending' ? pendingBookings : allBookings).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                No bookings found
                                            </td>
                                        </tr>
                                    ) : (
                                        (activeTab === 'pending' ? pendingBookings : allBookings).map((booking) => (
                                            <tr key={booking._id || booking.id}>
                                                <td>
                                                    <span className="font-semibold">
                                                        {getCompanyName(booking)}
                                                    </span>
                                                </td>
                                                <td>{getTrainerName(booking)}</td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">
                                                            {formatDate(booking.bookingDate)}
                                                        </span>
                                                        <span className="text-sm text-muted">
                                                            {formatTime(booking.startTime)}
                                                        </span>
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
                                                            onClick={() => handleViewDetails(booking)}
                                                            className="ti-btn ti-btn-sm ti-btn-info"
                                                            title="View Details"
                                                        >
                                                            <i className="ri-eye-line"></i>
                                                        </button>
                                                        {booking.status === 'pending_approval' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(booking)}
                                                                    className="ti-btn ti-btn-sm ti-btn-success"
                                                                    title="Approve"
                                                                >
                                                                    <i className="ri-check-line"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(booking)}
                                                                    className="ti-btn ti-btn-sm ti-btn-danger"
                                                                    title="Reject"
                                                                >
                                                                    <i className="ri-close-line"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination for All Bookings */}
                    {activeTab === 'all' && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="ti-btn ti-btn-sm"
                            >
                                Previous
                            </button>
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="ti-btn ti-btn-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Approve Booking</h3>
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="ti-btn ti-btn-sm ti-btn-ghost"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-primary/5 rounded">
                            <p className="text-sm">
                                <strong>Company:</strong> {getCompanyName(selectedBooking)}
                            </p>
                            <p className="text-sm">
                                <strong>Trainer:</strong> {getTrainerName(selectedBooking)}
                            </p>
                            <p className="text-sm">
                                <strong>Date:</strong> {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.startTime)}
                            </p>
                        </div>

                        <form onSubmit={submitApproval}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="form-label">Payment Mode <span className="text-danger">*</span></label>
                                    <select
                                        className="form-control"
                                        value={approvalData.paymentMode}
                                        onChange={(e) => setApprovalData({ ...approvalData, paymentMode: e.target.value as any })}
                                        required
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="upi">UPI</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="online">Online</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Transaction ID <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={approvalData.transactionId}
                                        onChange={(e) => setApprovalData({ ...approvalData, transactionId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Payment Type <span className="text-danger">*</span></label>
                                    <select
                                        className="form-control"
                                        value={approvalData.paymentType}
                                        onChange={(e) => setApprovalData({ ...approvalData, paymentType: e.target.value as any })}
                                        required
                                    >
                                        <option value="full">Full Payment</option>
                                        <option value="partial">Partial Payment</option>
                                        <option value="advance">Advance Payment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Payment Amount <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={approvalData.paymentAmount}
                                        onChange={(e) => setApprovalData({ ...approvalData, paymentAmount: parseFloat(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Admin Notes (Optional)</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={approvalData.adminNotes}
                                    onChange={(e) => setApprovalData({ ...approvalData, adminNotes: e.target.value })}
                                    placeholder="Add any notes about this approval..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowApprovalModal(false)}
                                    className="ti-btn ti-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="ti-btn ti-btn-success">
                                    Approve Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Reject Booking</h3>
                            <button
                                onClick={() => setShowRejectionModal(false)}
                                className="ti-btn ti-btn-sm ti-btn-ghost"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-danger/5 rounded">
                            <p className="text-sm">
                                <strong>Company:</strong> {getCompanyName(selectedBooking)}
                            </p>
                            <p className="text-sm">
                                <strong>Trainer:</strong> {getTrainerName(selectedBooking)}
                            </p>
                            <p className="text-sm">
                                <strong>Date:</strong> {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.startTime)}
                            </p>
                        </div>

                        <form onSubmit={submitRejection}>
                            <div className="mb-4">
                                <label className="form-label">Rejection Reason <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this booking..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectionModal(false)}
                                    className="ti-btn ti-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="ti-btn ti-btn-danger">
                                    Reject Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                    <label className="text-sm font-semibold text-muted">Company</label>
                                    <p className="text-defaulttextcolor">{getCompanyName(selectedBooking)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted">Trainer</label>
                                    <p className="text-defaulttextcolor">{getTrainerName(selectedBooking)}</p>
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
                                    <label className="text-sm font-semibold text-muted">Status</label>
                                    <p className="text-defaulttextcolor">
                                        <StatusBadge status={selectedBooking.status} />
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
                                    <label className="text-sm font-semibold text-muted">Company Notes</label>
                                    <p className="text-defaulttextcolor">{selectedBooking.notes}</p>
                                </div>
                            )}

                            {selectedBooking.paymentStatus && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Payment Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-muted">Payment Status</label>
                                            <p className="text-defaulttextcolor">
                                                {selectedBooking.paymentStatus.isPaid ? (
                                                    <span className="badge bg-success/10 text-success">Paid</span>
                                                ) : (
                                                    <span className="badge bg-warning/10 text-warning">Unpaid</span>
                                                )}
                                            </p>
                                        </div>
                                        {selectedBooking.paymentStatus.paymentMode && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Payment Mode</label>
                                                <p className="text-defaulttextcolor capitalize">
                                                    {selectedBooking.paymentStatus.paymentMode.replace('_', ' ')}
                                                </p>
                                            </div>
                                        )}
                                        {selectedBooking.paymentStatus.transactionId && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Transaction ID</label>
                                                <p className="text-defaulttextcolor">{selectedBooking.paymentStatus.transactionId}</p>
                                            </div>
                                        )}
                                        {selectedBooking.paymentStatus.paymentAmount && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">Amount</label>
                                                <p className="text-defaulttextcolor">₹{selectedBooking.paymentStatus.paymentAmount}</p>
                                            </div>
                                        )}
                                    </div>
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
        </Fragment>
    );
};

export default BookingsManagement;
