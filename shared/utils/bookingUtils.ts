import { Booking } from '@/services/bookingService';
import { getBookingTrainersLabel } from '@/shared/utils/bookingSessionUtils';

// ==================== STATUS UTILITIES ====================

export interface StatusConfig {
    bg: string;
    text: string;
    label: string;
    icon?: string;
}

export const STATUS_COLORS: Record<string, StatusConfig> = {
    pending_approval: {
        bg: '#FEF3C7',
        text: '#92400E',
        label: 'Pending Trainer Approval',
        icon: '⏳',
    },
    approved: {
        bg: '#DBEAFE',
        text: '#1E40AF',
        label: 'Trainer Accepted — Awaiting Admin',
        icon: '✓',
    },
    confirmed: {
        bg: '#D1FAE5',
        text: '#065F46',
        label: 'Confirmed',
        icon: '✓✓',
    },
    completed: {
        bg: '#F3F4F6',
        text: '#374151',
        label: 'Completed',
        icon: '✓✓✓',
    },
    rejected: {
        bg: '#FEE2E2',
        text: '#991B1B',
        label: 'Rejected',
        icon: '✗',
    },
    cancelled: {
        bg: '#F3F4F6',
        text: '#6B7280',
        label: 'Cancelled',
        icon: '⊘',
    },
};

export function getStatusColor(status: string): StatusConfig {
    return STATUS_COLORS[status] || STATUS_COLORS.pending_approval;
}

export function getStatusLabel(status: string): string {
    return STATUS_COLORS[status]?.label || status;
}

// ==================== PAYMENT UTILITIES ====================

export const PAYMENT_MODE_ICONS: Record<string, string> = {
    cash: '💵',
    card: '💳',
    upi: '📱',
    bank_transfer: '🏦',
    cheque: '📝',
    online: '💻',
    other: '💰',
};

export function getPaymentModeIcon(mode: string): string {
    return PAYMENT_MODE_ICONS[mode] || '💰';
}

export function getPaymentModeLabel(mode: string): string {
    const labels: Record<string, string> = {
        cash: 'Cash',
        card: 'Card',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer',
        cheque: 'Cheque',
        online: 'Online',
        other: 'Other',
    };
    return labels[mode] || mode;
}

// ==================== DATE/TIME UTILITIES ====================

export function formatBookingDate(date: string): string {
    try {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        return date;
    }
}

export function formatBookingTime(time: string): string {
    try {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
        return time;
    }
}

export function formatBookingDateTime(date: string, time: string): string {
    return `${formatBookingDate(date)} at ${formatBookingTime(time)}`;
}

export function formatDuration(hours: number): string {
    if (hours === 1) return '1 hour';
    if (hours < 1) return `${hours * 60} minutes`;
    if (hours % 1 === 0) return `${hours} hours`;
    const wholeHours = Math.floor(hours);
    const minutes = (hours - wholeHours) * 60;
    return `${wholeHours}h ${minutes}m`;
}

/**
 * Earliest selectable booking date (tomorrow) in local timezone as YYYY-MM-DD.
 */
export function getMinBookingDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Returns true when the date is tomorrow or later (YYYY-MM-DD).
 */
export function isBookingDateAllowed(date: string): boolean {
    return Boolean(date) && date >= getMinBookingDate();
}

// ==================== VALIDATION UTILITIES ====================

export function validateBookingTime(date: string, time: string): boolean {
    try {
        const bookingDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        return bookingDateTime > now;
    } catch (error) {
        return false;
    }
}

export function validateDuration(duration: number): boolean {
    return duration >= 0.5 && duration <= 24;
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidTime(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}

// ==================== PERMISSION UTILITIES ====================

export function canCancelBooking(status: string): boolean {
    return ['pending_approval', 'approved'].includes(status);
}

/**
 * @deprecated Use {@link canCancelBooking} — same rule for company and trainer.
 */
export function canCompanyCancelBooking(status: string): boolean {
    return canCancelBooking(status);
}

export function canConfirmBooking(status: string): boolean {
    return status === 'pending_approval';
}

export function canCompleteBooking(status: string): boolean {
    return status === 'confirmed';
}

export function canApproveBooking(status: string): boolean {
    return status === 'approved';
}

/** Admin may cancel any booking except already cancelled or rejected. */
export function canAdminCancelBooking(status: string): boolean {
    return !['cancelled', 'rejected'].includes(status);
}

export function canRejectBooking(status: string): boolean {
    return status === 'approved' || status === 'pending_approval';
}

// ==================== DISPLAY UTILITIES ====================

export function getBookingTitle(booking: Booking): string {
    const trainerName = getBookingTrainersLabel(booking, 'Trainer');
    const companyName = typeof booking.company === 'string'
        ? 'Company'
        : booking.company?.companyName || 'Unknown Company';

    return `${companyName} - ${trainerName}`;
}

export function getBookingSummary(booking: Booking): string {
    const date = formatBookingDate(booking.bookingDate);
    const time = formatBookingTime(booking.startTime);
    const duration = formatDuration(booking.duration);
    return `${date} at ${time} (${duration})`;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// ==================== FILTER UTILITIES ====================

export function filterBookingsByStatus(bookings: Booking[], status: string): Booking[] {
    if (!status || status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
}

export function filterBookingsByDate(bookings: Booking[], date: string): Booking[] {
    if (!date) return bookings;
    return bookings.filter(booking => booking.bookingDate === date);
}

export function sortBookingsByDate(bookings: Booking[], ascending: boolean = false): Booking[] {
    return [...bookings].sort((a, b) => {
        const dateA = new Date(`${a.bookingDate}T${a.startTime}`);
        const dateB = new Date(`${b.bookingDate}T${b.startTime}`);
        return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
}

// ==================== ERROR HANDLING ====================

export function getBookingErrorMessage(error: any): string {
    const serverMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : null);

    if (typeof serverMessage === 'string' && serverMessage.includes("trainer's availability")) {
        return "Please select the time according to the trainer's availability";
    }

    if (serverMessage) {
        return serverMessage;
    }

    if (error?.message) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
}

export function isConflictError(error: any): boolean {
    return error.response?.status === 409;
}

export function isValidationError(error: any): boolean {
    return error.response?.status === 400 || error.response?.status === 422;
}
