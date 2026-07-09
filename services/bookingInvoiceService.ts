import ApiService from './ApiService';
import { Base_url } from '../Config/BaseUrl';
import type { TrainerFeeLineInput } from '@/shared/utils/invoiceCalculationUtils';

export interface BookingInvoiceTrainerLine {
    _id?: string;
    trainer: string | { _id?: string; id?: string; name?: string };
    sessionIndex?: number;
    startTime?: string;
    duration?: number;
    typeOfTraining?: string[];
    baseFee: number;
    gstRate: number;
    gstAmount: number;
    otherTaxes: Array<{ name: string; rate: number; type: string; amount: number }>;
    totalOtherTaxes: number;
    deductions: Array<{ name: string; amount: number }>;
    totalDeductions: number;
    grossAmount: number;
    netPayable: number;
    trainerName?: string;
    trainerGstNumber?: string;
    trainerPanNumber?: string;
}

export interface BookingInvoice {
    id?: string;
    _id?: string;
    invoiceNumber: string;
    booking: string | Record<string, unknown>;
    company: string | Record<string, unknown>;
    bookingDate: string;
    status: 'confirmed' | 'cancelled';
    companyPayment: {
        paymentMode?: string;
        transactionId?: string;
        paymentType?: string;
        paymentAmount?: number;
        adminNotes?: string;
    };
    trainerLines: BookingInvoiceTrainerLine[];
    totals: {
        baseFee: number;
        gstAmount: number;
        totalOtherTaxes: number;
        totalDeductions: number;
        grossAmount: number;
        netPayable: number;
    };
    currency?: string;
    approvedAt?: string;
    createdAt?: string;
}

export interface BookingInvoicesResponse {
    results: BookingInvoice[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface GetBookingInvoicesParams {
    page?: number;
    limit?: number;
    company?: string;
    trainer?: string;
    booking?: string;
    sortBy?: string;
}

class BookingInvoiceService {
    /**
     * List booking invoices (admin).
     */
    async getBookingInvoices(params: GetBookingInvoicesParams = {}): Promise<BookingInvoicesResponse> {
        const response = await ApiService.get('/booking-invoices', params);
        return {
            results: (response.results || []).map(this.normalizeInvoice),
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            totalResults: response.totalResults || 0,
        };
    }

    /**
     * Get invoice by id.
     */
    async getBookingInvoiceById(id: string): Promise<BookingInvoice> {
        const response = await ApiService.get(`/booking-invoices/${id}`);
        return this.normalizeInvoice(response);
    }

    /**
     * Get invoice for a booking.
     */
    async getBookingInvoiceByBookingId(bookingId: string): Promise<BookingInvoice> {
        const response = await ApiService.get(`/booking-invoices/booking/${bookingId}`);
        return this.normalizeInvoice(response);
    }

    /**
     * Default trainer fee lines for approval form.
     */
    async getDefaultTrainerFeeLines(bookingId: string): Promise<TrainerFeeLineInput[]> {
        const response = await ApiService.get(`/booking-invoices/defaults/${bookingId}`);
        return response.trainerFeeLines || [];
    }

    /**
     * Download invoice HTML file (print to PDF from browser).
     */
    async downloadInvoiceHtml(invoiceId: string, invoiceNumber: string): Promise<void> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const res = await fetch(`${Base_url}/booking-invoices/${invoiceId}/download`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Failed to download invoice');
        }

        const html = await res.text();
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoiceNumber}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    /**
     * Normalize invoice id fields.
     */
    private normalizeInvoice = (invoice: BookingInvoice): BookingInvoice => {
        if (invoice.id && !invoice._id) {
            return { ...invoice, _id: invoice.id };
        }
        return invoice;
    };
}

export default new BookingInvoiceService();
