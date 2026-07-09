"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import bookingService, { Booking, RejectBookingRequest } from '@/services/bookingService';
import CompanyService, { Company } from '@/services/companyService';
import TrainerService, { Trainer } from '@/services/trainerService';
import Swal from 'sweetalert2';
import StatusBadge from '@/shared/components/StatusBadge';
import { canAdminCancelBooking } from '@/shared/utils/bookingUtils';
import { hasPermission } from '@/shared/utils/permissionUtils';
import AdminBookingDetailsDrawer from './AdminBookingDetailsDrawer';
import AdminBookingApprovalModal from './AdminBookingApprovalModal';
import AdminCompanyProfileDrawer from './AdminCompanyProfileDrawer';
import AdminTrainerProfileDrawer from './AdminTrainerProfileDrawer';
import { BookingsTableToolbar, BookingsTableFooter } from '@/shared/components/BookingsTablePagination';
import {
    getBookingCompanyId,
    getBookingCompanyName,
    getBookingTrainerId,
    getBookingTrainerName,
} from './adminBookingUtils';

const BookingsManagement = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminUser, setAdminUser] = useState<any>(null);

    // Approval/Rejection modals
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
    const [bookingDrawerLoading, setBookingDrawerLoading] = useState(false);
    const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
    const [companyDrawerLoading, setCompanyDrawerLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [trainerDrawerOpen, setTrainerDrawerOpen] = useState(false);
    const [trainerDrawerLoading, setTrainerDrawerLoading] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [profileStacked, setProfileStacked] = useState(false);

    // Approval form handled in AdminBookingApprovalModal

    // Rejection form data
    const [rejectionReason, setRejectionReason] = useState('');
    const [cancelRemark, setCancelRemark] = useState('');

    // Filters for all bookings
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingPageSize, setPendingPageSize] = useState(10);
    const [pendingTotalPages, setPendingTotalPages] = useState(1);
    const [pendingTotalResults, setPendingTotalResults] = useState(0);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setAdminUser(JSON.parse(userStr));
        }
        if (activeTab === 'pending') {
            fetchPendingBookings();
        } else {
            fetchAllBookings();
        }
    }, [activeTab, statusFilter, searchTerm, page, pageSize, pendingPage, pendingPageSize]);

    const fetchPendingBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getPendingApprovals({
                page: pendingPage,
                limit: pendingPageSize,
                sortBy: 'createdAt:desc',
            });
            setPendingBookings(response.results || []);
            setPendingTotalPages(response.totalPages || 1);
            setPendingTotalResults(response.totalResults || 0);
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
                limit: pageSize,
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

    /**
     * Opens company profile drawer and loads full company record.
     */
    const openCompanyProfile = async (booking: Booking, stacked = false) => {
        const id = getBookingCompanyId(booking);
        if (!id) return;
        setProfileStacked(stacked);
        setCompanyDrawerOpen(true);
        setCompanyDrawerLoading(true);
        if (typeof booking.company === 'object' && booking.company) {
            setSelectedCompany(booking.company as Company);
        }
        try {
            const full = await CompanyService.getCompanyById(id);
            setSelectedCompany(full);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load company profile';
            void Swal.fire({ icon: 'error', title: 'Error', text: msg });
            setCompanyDrawerOpen(false);
        } finally {
            setCompanyDrawerLoading(false);
        }
    };

    /**
     * Opens trainer profile drawer and loads full trainer record.
     */
    const openTrainerProfile = async (booking: Booking, stacked = false) => {
        const id = getBookingTrainerId(booking);
        if (!id) return;
        setProfileStacked(stacked);
        setTrainerDrawerOpen(true);
        setTrainerDrawerLoading(true);
        if (typeof booking.trainer === 'object' && booking.trainer) {
            setSelectedTrainer(booking.trainer as Trainer);
        }
        try {
            const full = await TrainerService.getTrainerById(id);
            setSelectedTrainer(full);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load trainer profile';
            void Swal.fire({ icon: 'error', title: 'Error', text: msg });
            setTrainerDrawerOpen(false);
        } finally {
            setTrainerDrawerLoading(false);
        }
    };

    /**
     * Opens booking details drawer with fresh booking payload.
     */
    const handleViewDetails = async (booking: Booking) => {
        const id = booking._id || booking.id;
        if (!id) return;
        setBookingDrawerOpen(true);
        setBookingDrawerLoading(true);
        setSelectedBooking(booking);
        try {
            const full = await bookingService.getBookingById(id);
            setSelectedBooking(full);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load booking details';
            void Swal.fire({ icon: 'error', title: 'Error', text: msg });
            setBookingDrawerOpen(false);
        } finally {
            setBookingDrawerLoading(false);
        }
    };

    const handleApprove = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowApprovalModal(true);
    };

    const handleReject = (booking: Booking) => {
        setSelectedBooking(booking);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    const handleCancel = (booking: Booking) => {
        setSelectedBooking(booking);
        setCancelRemark('');
        setShowCancelModal(true);
    };

    const handleApprovalSuccess = () => {
        setBookingDrawerOpen(false);
        setSelectedBooking(null);
        fetchPendingBookings();
        if (activeTab === 'all') fetchAllBookings();
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
            setBookingDrawerOpen(false);
            setSelectedBooking(null);
            fetchPendingBookings();
            if (activeTab === 'all') fetchAllBookings();
        } catch (err: any) {
            Swal.fire('Error!', err.message || 'Failed to reject booking', 'error');
        }
    };

    const submitCancel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking || !cancelRemark.trim()) {
            Swal.fire('Error!', 'Please provide a cancellation remark', 'warning');
            return;
        }

        try {
            const bookingId = selectedBooking._id || selectedBooking.id;
            if (!bookingId) {
                Swal.fire('Error!', 'Booking ID not found', 'error');
                return;
            }

            await bookingService.adminCancelBooking(bookingId, { adminNotes: cancelRemark.trim() });
            Swal.fire('Success!', 'Meeting cancelled successfully', 'success');
            setShowCancelModal(false);
            setBookingDrawerOpen(false);
            setSelectedBooking(null);
            fetchPendingBookings();
            if (activeTab === 'all') fetchAllBookings();
        } catch (err: any) {
            Swal.fire('Error!', err.message || 'Failed to cancel booking', 'error');
        }
    };

    const getCompanyName = (booking: Booking): string => getBookingCompanyName(booking);

    const getTrainerName = (booking: Booking): string => getBookingTrainerName(booking);

    const canManageBookings = hasPermission(adminUser, 'bookingManagement', 'update');

    const tablePage = activeTab === 'pending' ? pendingPage : page;
    const tablePageSize = activeTab === 'pending' ? pendingPageSize : pageSize;
    const tableTotalPages = activeTab === 'pending' ? pendingTotalPages : totalPages;
    const tableTotalResults = activeTab === 'pending' ? pendingTotalResults : totalResults;
    const tableIdPrefix = activeTab === 'pending' ? 'admin-pending-bookings' : 'admin-all-bookings';

    const handleTablePageChange = (nextPage: number) => {
        if (activeTab === 'pending') {
            setPendingPage(nextPage);
        } else {
            setPage(nextPage);
        }
    };

    const handleTablePageSizeChange = (size: number) => {
        if (activeTab === 'pending') {
            setPendingPageSize(size);
            setPendingPage(1);
        } else {
            setPageSize(size);
            setPage(1);
        }
    };

    const tablePaginationProps = {
        page: tablePage,
        totalPages: tableTotalPages,
        totalResults: tableTotalResults,
        pageSize: tablePageSize,
        onPageChange: handleTablePageChange,
        onPageSizeChange: handleTablePageSizeChange,
        idPrefix: tableIdPrefix,
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
                                Pending Admin Approval
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
                        <div className="mb-4">
                            <select
                                className="form-control max-w-xs"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                aria-label="Filter bookings by status"
                            >
                                <option value="">All Status</option>
                                <option value="pending_approval">Pending Trainer Approval</option>
                                <option value="approved">Pending Admin Approval</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {!loading && <BookingsTableToolbar {...tablePaginationProps} />}

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
                                                    <button
                                                        type="button"
                                                        onClick={() => void openCompanyProfile(booking)}
                                                        className="font-semibold text-primary hover:underline p-0 bg-transparent border-0 text-left"
                                                        aria-label={`View company profile for ${getCompanyName(booking)}`}
                                                    >
                                                        {getCompanyName(booking)}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => void openTrainerProfile(booking)}
                                                        className="font-semibold text-primary hover:underline p-0 bg-transparent border-0 text-left"
                                                        aria-label={`View trainer profile for ${getTrainerName(booking)}`}
                                                    >
                                                        {getTrainerName(booking)}
                                                    </button>
                                                </td>
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
                                                            type="button"
                                                            onClick={() => void handleViewDetails(booking)}
                                                            className="ti-btn ti-btn-sm ti-btn-info"
                                                            title="View Details"
                                                            aria-label="View booking details"
                                                        >
                                                            <i className="ri-eye-line" aria-hidden="true"></i>
                                                        </button>
                                                        {booking.status === 'approved' && (
                                                            <>
                                                                {canManageBookings && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleApprove(booking)}
                                                                        className="ti-btn ti-btn-sm ti-btn-success"
                                                                        title="Confirm booking"
                                                                        aria-label="Confirm booking"
                                                                    >
                                                                        <i className="ri-check-line" aria-hidden="true"></i>
                                                                    </button>
                                                                )}
                                                                {canManageBookings && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleReject(booking)}
                                                                        className="ti-btn ti-btn-sm ti-btn-danger"
                                                                        title="Reject"
                                                                        aria-label="Reject booking"
                                                                    >
                                                                        <i className="ri-close-line" aria-hidden="true"></i>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {canManageBookings && canAdminCancelBooking(booking.status) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancel(booking)}
                                                                className="ti-btn ti-btn-sm ti-btn-warning"
                                                                title="Cancel meeting"
                                                                aria-label="Cancel meeting"
                                                            >
                                                                <i className="ri-close-circle-line" aria-hidden="true"></i>
                                                            </button>
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

                    {!loading && <BookingsTableFooter {...tablePaginationProps} />}
                </div>
            </div>

            <AdminBookingApprovalModal
                open={showApprovalModal}
                booking={selectedBooking}
                onClose={() => setShowApprovalModal(false)}
                onSuccess={handleApprovalSuccess}
            />

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

            {showCancelModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Cancel Meeting</h3>
                        <div className="mb-4 p-3 bg-light rounded">
                            <p className="text-sm mb-1">
                                <strong>Company:</strong> {getCompanyName(selectedBooking)}
                            </p>
                            <p className="text-sm mb-1">
                                <strong>Trainer:</strong> {getTrainerName(selectedBooking)}
                            </p>
                            <p className="text-sm mb-0">
                                <strong>Date:</strong> {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.startTime)}
                            </p>
                        </div>

                        <form onSubmit={submitCancel}>
                            <div className="mb-4">
                                <label className="form-label" htmlFor="admin-cancel-remark">
                                    Cancellation remark <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    id="admin-cancel-remark"
                                    className="form-control"
                                    rows={4}
                                    value={cancelRemark}
                                    onChange={(e) => setCancelRemark(e.target.value)}
                                    placeholder="Reason for cancelling this meeting..."
                                    required
                                    aria-required="true"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    className="ti-btn ti-btn-secondary"
                                >
                                    Close
                                </button>
                                <button type="submit" className="ti-btn ti-btn-warning">
                                    Cancel meeting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AdminBookingDetailsDrawer
                open={bookingDrawerOpen}
                booking={selectedBooking}
                loading={bookingDrawerLoading}
                onClose={() => {
                    setBookingDrawerOpen(false);
                    setSelectedBooking(null);
                }}
                onViewCompany={
                    selectedBooking
                        ? () => void openCompanyProfile(selectedBooking, true)
                        : undefined
                }
                onViewTrainer={
                    selectedBooking
                        ? () => void openTrainerProfile(selectedBooking, true)
                        : undefined
                }
                onConfirm={canManageBookings ? handleApprove : undefined}
                onReject={canManageBookings ? handleReject : undefined}
                onCancel={canManageBookings ? handleCancel : undefined}
                canManage={canManageBookings}
            />

            <AdminCompanyProfileDrawer
                open={companyDrawerOpen}
                company={selectedCompany}
                loading={companyDrawerLoading}
                stacked={profileStacked}
                onClose={() => {
                    setCompanyDrawerOpen(false);
                    setSelectedCompany(null);
                    setProfileStacked(false);
                }}
            />

            <AdminTrainerProfileDrawer
                open={trainerDrawerOpen}
                trainer={selectedTrainer}
                loading={trainerDrawerLoading}
                stacked={profileStacked}
                onClose={() => {
                    setTrainerDrawerOpen(false);
                    setSelectedTrainer(null);
                    setProfileStacked(false);
                }}
            />
        </Fragment>
    );
};

export default BookingsManagement;
