"use client";

import React, { Fragment, useEffect, useState } from "react";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import bookingInvoiceService, { type BookingInvoice } from "@/services/bookingInvoiceService";
import { formatInr } from "@/shared/utils/invoiceCalculationUtils";
import { formatBookingDate } from "@/shared/utils/bookingUtils";
import Swal from "sweetalert2";

/**
 * Resolve display name from populated or string company ref.
 */
function getCompanyLabel(company: BookingInvoice["company"]): string {
    if (!company) return "—";
    if (typeof company === "string") return company;
    const c = company as Record<string, unknown>;
    return String(c.companyName || c.name || "Company");
}

/**
 * Count trainers on an invoice.
 */
function getTrainerCount(invoice: BookingInvoice): number {
    return invoice.trainerLines?.length ?? 0;
}

const BookingTransactionsPage = () => {
    const [invoices, setInvoices] = useState<BookingInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchInvoices();
    }, [page]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await bookingInvoiceService.getBookingInvoices({
                page,
                limit,
                sortBy: "createdAt:desc",
            });
            setInvoices(response.results);
            setTotalPages(response.totalPages);
            setTotalResults(response.totalResults);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load booking transactions";
            void Swal.fire("Error", msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoice: BookingInvoice) => {
        const id = invoice._id || invoice.id;
        if (!id) return;

        try {
            setDownloadingId(id);
            await bookingInvoiceService.downloadInvoiceHtml(id, invoice.invoiceNumber);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to download invoice";
            void Swal.fire("Error", msg, "error");
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (value?: string) => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <Fragment>
            <Seo title="Booking Transactions" />
            <Pageheader
                currentpage="Booking Transactions"
                activepage="Bookings Management"
                mainpage="Booking Transactions"
            />

            <div className="box">
                <div className="box-header flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h5 className="box-title mb-1">Trainer fee invoices</h5>
                        <p className="text-sm text-muted mb-0">
                            All confirmed booking payments with per-trainer GST, taxes, and deductions.
                        </p>
                    </div>
                    <span className="badge bg-primary/10 text-primary">
                        {totalResults} transaction{totalResults === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="box-body p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading…</span>
                            </div>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <i className="ri-file-list-3-line text-4xl text-muted mb-3 block" aria-hidden="true"></i>
                            <p className="text-muted mb-0">No booking transactions yet.</p>
                            <p className="text-xs text-muted mt-1 mb-0">
                                Invoices are created when admin confirms an approved booking.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table whitespace-nowrap min-w-full mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col">Invoice</th>
                                        <th scope="col">Company</th>
                                        <th scope="col">Session date</th>
                                        <th scope="col">Trainers</th>
                                        <th scope="col">Company paid</th>
                                        <th scope="col">Trainer payout</th>
                                        <th scope="col">Confirmed</th>
                                        <th scope="col" className="text-end">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => {
                                        const id = invoice._id || invoice.id || invoice.invoiceNumber;
                                        return (
                                            <tr key={id}>
                                                <td>
                                                    <span className="font-semibold text-sm">
                                                        {invoice.invoiceNumber}
                                                    </span>
                                                </td>
                                                <td>{getCompanyLabel(invoice.company)}</td>
                                                <td>{formatBookingDate(invoice.bookingDate)}</td>
                                                <td>{getTrainerCount(invoice)}</td>
                                                <td>
                                                    {formatInr(invoice.companyPayment?.paymentAmount ?? 0)}
                                                </td>
                                                <td className="text-success font-medium">
                                                    {formatInr(invoice.totals?.netPayable ?? 0)}
                                                </td>
                                                <td>{formatDate(invoice.approvedAt || invoice.createdAt)}</td>
                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="ti-btn ti-btn-sm ti-btn-primary"
                                                        onClick={() => handleDownload(invoice)}
                                                        disabled={downloadingId === (invoice._id || invoice.id)}
                                                        aria-label={`Download invoice ${invoice.invoiceNumber}`}
                                                    >
                                                        <i className="ri-download-line" aria-hidden="true"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!loading && totalPages > 1 && (
                    <div className="box-footer flex items-center justify-between flex-wrap gap-3">
                        <p className="text-sm text-muted mb-0">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="ti-btn ti-btn-sm ti-btn-light"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                className="ti-btn ti-btn-sm ti-btn-light"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default BookingTransactionsPage;
