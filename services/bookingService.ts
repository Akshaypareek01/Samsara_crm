import ApiService from './ApiService';
import { normalizeBookingNotes } from '@/shared/utils/bookingFormUtils';

// ==================== INTERFACES ====================

export type BookingStatus =
    | 'pending_approval'
    | 'approved'
    | 'confirmed'
    | 'completed'
    | 'rejected'
    | 'cancelled';

export interface Booking {
    id?: string;
    _id?: string;
    company: string | any; // Can be populated with company object
    trainer: string | any; // Can be populated with trainer object
    eapTraining?: string | EapTrainingRef | null;
    bookingDate: string; // "2026-01-30"
    startTime: string; // "14:00"
    duration: number; // Hours (0.5 to 24)
    typeOfTraining: string[]; // Array of training types
    notes?: string; // Company notes
    trainerNotes?: string;
    adminNotes?: string;
    cancellationReason?: string;
    status: BookingStatus;
    paymentStatus?: {
        isPaid: boolean;
        paymentMode?: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'online' | 'other';
        transactionId?: string;
        paymentType?: 'full' | 'partial' | 'advance';
        paymentAmount?: number;
        paymentDate?: string;
    };
    approvedBy?: string | any; // Admin who approved
    approvedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** Populated EAP training on a booking. */
export interface EapTrainingRef {
    _id?: string;
    id?: string;
    title?: string;
    coverImage?: string;
    durationOptions?: number[];
    syllabus?: { durationHours: number; points: string[] }[];
}

export interface CreateBookingRequest {
    company: string; // Company MongoDB ID
    trainer: string; // Trainer MongoDB ID
    bookingDate: string; // "2026-01-30"
    startTime: string; // "14:00" (24-hour format)
    duration: number; // 0.5 to 24 hours
    typeOfTraining: string[]; // Array of training types
    eapTraining?: string; // EAP training id when booking an EAP program
    notes?: string; // Optional company notes
}

export interface ApproveBookingRequest {
    paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'online' | 'other';
    transactionId: string;
    paymentType: 'full' | 'partial' | 'advance';
    paymentAmount: number;
    adminNotes?: string;
}

export interface RejectBookingRequest {
    adminNotes: string; // Reason for rejection
}

export interface UpdateStatusRequest {
    status: 'approved' | 'completed';
    trainerNotes?: string;
}

export interface CancelBookingRequest {
    cancellationReason?: string;
}

export interface AdminCancelBookingRequest {
    adminNotes: string;
}

export interface GetBookingsParams {
    page?: number;
    limit?: number;
    status?: string;
    bookingDate?: string;
    company?: string;
    trainer?: string;
    sortBy?: string;
}

export interface BookingsResponse {
    results: Booking[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface MyBookingsSummaryTotals {
    totalBookings: number;
    activeReservations: number;
    waitingList: number;
    occupancyRate: string;
    statusCounts?: Record<string, number>;
}

export interface MyBookingsSummaryActivity {
    color: string;
    title: string;
    sub: string;
    time: string;
}

export interface MyBookingsSummaryClassRow {
    dateLabel: string;
    dateSubLabel: string;
    dotColor: string;
    classType: string;
    trainerInitials: string;
    trainerBg: string;
    trainerName: string;
    trainerId?: string;
    bookingId?: string;
    capacity: number;
    booked: number;
    waitingList: number;
    status: string;
}

export interface MyBookingsSummaryTrainerAvail {
    initials: string;
    avatarBg: string;
    name: string;
    speciality: string;
    status: string;
}

export interface MyBookingsSummaryWaitingGroup {
    title: string;
    count: number;
    people: string[];
}

/** Booking snippet for a calendar day (summary API). */
export interface MyBookingsSummaryDayBooking {
    id: string;
    trainerId?: string;
    status: BookingStatus;
    startTime: string;
    companyName?: string;
    trainerName?: string;
    isPaid: boolean;
    duration: number;
    typeOfTraining: string[];
}

/** Response from GET /v1/bookings/my-bookings/summary */
export interface MyBookingsSummary {
    month: string;
    totals: MyBookingsSummaryTotals;
    calendarDots: Record<number, string[]>;
    calendarDays: Record<number, MyBookingsSummaryDayBooking[]>;
    recentActivities: MyBookingsSummaryActivity[];
    classSchedule: MyBookingsSummaryClassRow[];
    trainerAvailability: MyBookingsSummaryTrainerAvail[];
    waitingListGroups: MyBookingsSummaryWaitingGroup[];
}

// ==================== SERVICE CLASS ====================

class BookingService {
    /**
     * Create a new booking (Company only)
     * POST /v1/bookings
     */
    async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
        try {
            console.log('📅 Creating booking:', bookingData);
            const response = await ApiService.post('/bookings', bookingData);

            // Normalize id field
            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Create booking error:', error);
            throw error;
        }
    }

    /**
     * Get bookings for authenticated user (Company or Trainer)
     * GET /v1/bookings/my-bookings
     * - Company: sees all their bookings
     * - Trainer: sees only approved/confirmed/completed bookings
     */
    async getMyBookings(params: GetBookingsParams = {}): Promise<BookingsResponse> {
        try {
            console.log('📋 Getting my bookings with params:', params);
            const response = await ApiService.get('/bookings/my-bookings', params);

            // Normalize id field
            if (response.results && Array.isArray(response.results)) {
                response.results = response.results.map((booking: Booking) => {
                    if (booking.id && !booking._id) {
                        return { ...booking, _id: booking.id };
                    }
                    return booking;
                });
            }

            return {
                results: response.results || [],
                page: response.page || params.page || 1,
                limit: response.limit || params.limit || 10,
                totalPages: response.totalPages || 1,
                totalResults: response.totalResults || 0,
            };
        } catch (error) {
            console.error('❌ Get my bookings error:', error);
            throw error;
        }
    }

    /**
     * Month dashboard summary for company or trainer.
     * GET /v1/bookings/my-bookings/summary?month=YYYY-MM
     *
     * @param month - YYYY-MM
     */
    async getMyBookingsSummary(month: string): Promise<MyBookingsSummary> {
        try {
            const response = await ApiService.get('/bookings/my-bookings/summary', { month });
            const dots = response.calendarDots || {};
            const calendarDots: Record<number, string[]> = {};
            Object.keys(dots).forEach((k) => {
                calendarDots[Number(k)] = dots[k];
            });
            const daysRaw = response.calendarDays || {};
            const calendarDays: Record<number, MyBookingsSummaryDayBooking[]> = {};
            Object.keys(daysRaw).forEach((k) => {
                calendarDays[Number(k)] = daysRaw[k];
            });
            return {
                month: response.month,
                totals: response.totals,
                calendarDots,
                calendarDays,
                recentActivities: response.recentActivities || [],
                classSchedule: response.classSchedule || [],
                trainerAvailability: response.trainerAvailability || [],
                waitingListGroups: response.waitingListGroups || [],
            };
        } catch (error) {
            console.error('❌ Get my bookings summary error:', error);
            throw error;
        }
    }

    /**
     * Get booking by ID
     * GET /v1/bookings/:id
     */
    async getBookingById(bookingId: string): Promise<Booking> {
        try {
            console.log('🔍 Getting booking by ID:', bookingId);
            const response = await ApiService.get(`/bookings/${bookingId}`);

            // Normalize id field
            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Get booking by ID error:', error);
            throw error;
        }
    }

    /**
     * Get pending approvals (Admin only)
     * GET /v1/bookings/pending-approvals
     */
    async getPendingApprovals(params: GetBookingsParams = {}): Promise<BookingsResponse> {
        try {
            console.log('⏳ Getting pending approvals with params:', params);
            const response = await ApiService.get('/bookings/pending-approvals', params);

            // Normalize id field
            if (response.results && Array.isArray(response.results)) {
                response.results = response.results.map((booking: Booking) => {
                    if (booking.id && !booking._id) {
                        return { ...booking, _id: booking.id };
                    }
                    return booking;
                });
            }

            return {
                results: response.results || [],
                page: response.page || params.page || 1,
                limit: response.limit || params.limit || 10,
                totalPages: response.totalPages || 1,
                totalResults: response.totalResults || 0,
            };
        } catch (error) {
            console.error('❌ Get pending approvals error:', error);
            throw error;
        }
    }

    /**
     * Get all bookings (Admin only)
     * GET /v1/bookings
     */
    async getAllBookings(params: GetBookingsParams = {}): Promise<BookingsResponse> {
        try {
            console.log('📚 Getting all bookings with params:', params);
            const response = await ApiService.get('/bookings', params);

            // Normalize id field
            if (response.results && Array.isArray(response.results)) {
                response.results = response.results.map((booking: Booking) => {
                    if (booking.id && !booking._id) {
                        return { ...booking, _id: booking.id };
                    }
                    return booking;
                });
            }

            return {
                results: response.results || [],
                page: response.page || params.page || 1,
                limit: response.limit || params.limit || 10,
                totalPages: response.totalPages || 1,
                totalResults: response.totalResults || 0,
            };
        } catch (error) {
            console.error('❌ Get all bookings error:', error);
            throw error;
        }
    }

    /**
     * Approve booking with payment details (Admin only)
     * PATCH /v1/bookings/:id/approve
     */
    async approveBooking(bookingId: string, approvalData: ApproveBookingRequest): Promise<Booking> {
        try {
            console.log('✅ Approving booking:', bookingId, approvalData);
            const response = await ApiService.patch(`/bookings/${bookingId}/approve`, approvalData);

            // Normalize id field
            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Approve booking error:', error);
            throw error;
        }
    }

    /**
     * Reject booking (Admin only)
     * PATCH /v1/bookings/:id/reject
     */
    async rejectBooking(bookingId: string, rejectData: RejectBookingRequest): Promise<Booking> {
        try {
            console.log('❌ Rejecting booking:', bookingId, rejectData);
            const response = await ApiService.patch(`/bookings/${bookingId}/reject`, rejectData);

            // Normalize id field
            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Reject booking error:', error);
            throw error;
        }
    }

    /**
     * Update booking status (Trainer only)
     * PATCH /v1/bookings/:id/status
     * Used to confirm or complete bookings
     */
    async updateBookingStatus(bookingId: string, statusData: UpdateStatusRequest): Promise<Booking> {
        try {
            const payload: UpdateStatusRequest = { status: statusData.status };
            const normalizedNotes = normalizeBookingNotes(statusData.trainerNotes);
            if (normalizedNotes) {
                payload.trainerNotes = normalizedNotes;
            }

            console.log('🔄 Updating booking status:', bookingId, payload);
            const response = await ApiService.patch(`/bookings/${bookingId}/status`, payload);

            // Normalize id field
            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Update booking status error:', error);
            throw error;
        }
    }

    /**
     * Cancel booking (Company or Trainer)
     * PATCH /v1/bookings/:id/cancel
     * Can only cancel if status is pending_approval or approved (not after admin confirmation)
     */
    async cancelBooking(bookingId: string, payload: CancelBookingRequest = {}): Promise<Booking> {
        try {
            console.log('🚫 Cancelling booking:', bookingId);
            const response = await ApiService.patch(`/bookings/${bookingId}/cancel`, payload);

            // Normalize id field
            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Cancel booking error:', error);
            throw error;
        }
    }

    /**
     * Admin cancel booking with required remark
     * PATCH /v1/bookings/:id/admin-cancel
     */
    async adminCancelBooking(bookingId: string, payload: AdminCancelBookingRequest): Promise<Booking> {
        try {
            console.log('🚫 Admin cancelling booking:', bookingId);
            const response = await ApiService.patch(`/bookings/${bookingId}/admin-cancel`, payload);

            if (response.id && !response._id) {
                return { ...response, _id: response.id };
            }
            return response;
        } catch (error) {
            console.error('❌ Admin cancel booking error:', error);
            throw error;
        }
    }
}

export default new BookingService();
