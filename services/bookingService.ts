import ApiService from './ApiService';

// ==================== INTERFACES ====================

export interface Booking {
    id?: string;
    _id?: string;
    company: string | any; // Can be populated with company object
    trainer: string | any; // Can be populated with trainer object
    bookingDate: string; // "2026-01-30"
    startTime: string; // "14:00"
    duration: number; // Hours (0.5 to 24)
    typeOfTraining: string[]; // Array of training types
    notes?: string; // Company notes
    trainerNotes?: string;
    adminNotes?: string;
    status: 'pending_approval' | 'approved' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
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

export interface CreateBookingRequest {
    company: string; // Company MongoDB ID
    trainer: string; // Trainer MongoDB ID
    bookingDate: string; // "2026-01-30"
    startTime: string; // "14:00" (24-hour format)
    duration: number; // 0.5 to 24 hours
    typeOfTraining: string[]; // Array of training types
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
    status: 'confirmed' | 'completed';
    trainerNotes?: string;
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
            console.log('🔄 Updating booking status:', bookingId, statusData);
            const response = await ApiService.patch(`/bookings/${bookingId}/status`, statusData);

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
     * Can only cancel if status is pending_approval, approved, or confirmed
     */
    async cancelBooking(bookingId: string): Promise<Booking> {
        try {
            console.log('🚫 Cancelling booking:', bookingId);
            const response = await ApiService.patch(`/bookings/${bookingId}/cancel`, {});

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
}

export default new BookingService();
