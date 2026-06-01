"use client";

import React, { useMemo } from "react";

/** Default page-size options for bookings tables. */
export const BOOKINGS_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type BookingsPageSize = (typeof BOOKINGS_PAGE_SIZE_OPTIONS)[number];

export type BookingsTablePaginationProps = {
    page: number;
    totalPages: number;
    totalResults: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: readonly number[];
    itemLabel?: string;
    idPrefix?: string;
};

/**
 * Builds visible page numbers with ellipsis for long page ranges.
 *
 * @param page - Current page (1-based).
 * @param totalPages - Total number of pages.
 */
export function getBookingsPaginationPages(
    page: number,
    totalPages: number
): (number | "...")[] {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
        return [1, 2, 3, "...", totalPages];
    }
    if (page >= totalPages - 2) {
        return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

/**
 * Shared row range metadata for bookings tables.
 */
function useBookingsPaginationMeta(
    page: number,
    totalPages: number,
    totalResults: number,
    pageSize: number
) {
    return useMemo(() => {
        const safeTotalPages = Math.max(1, totalPages);
        const startRow = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
        const endRow = Math.min(page * pageSize, totalResults);
        const pages = totalResults === 0 ? [] : getBookingsPaginationPages(page, safeTotalPages);

        return { safeTotalPages, startRow, endRow, pages };
    }, [page, totalPages, totalResults, pageSize]);
}

/**
 * Top toolbar: result count + rows-per-page selector (above the table).
 */
export const BookingsTableToolbar: React.FC<BookingsTablePaginationProps> = ({
    page,
    totalPages,
    totalResults,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = BOOKINGS_PAGE_SIZE_OPTIONS,
    itemLabel = "bookings",
    idPrefix = "bookings-pagination",
}) => {
    const { startRow, endRow } = useBookingsPaginationMeta(page, totalPages, totalResults, pageSize);

    return (
        <div
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3 pb-3 border-b border-defaultborder"
            role="region"
            aria-label="Table display options"
        >
            <p className="text-sm text-muted mb-0" aria-live="polite">
                {totalResults === 0 ? (
                    <>No {itemLabel} found</>
                ) : (
                    <>
                        Showing{" "}
                        <span className="font-semibold text-defaulttextcolor">
                            {startRow}–{endRow}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-defaulttextcolor">{totalResults}</span>{" "}
                        {itemLabel}
                    </>
                )}
            </p>

            <div className="flex items-center gap-2 shrink-0">
                <label
                    htmlFor={`${idPrefix}-page-size`}
                    className="text-sm text-muted mb-0 whitespace-nowrap"
                >
                    Rows per page
                </label>
                <select
                    id={`${idPrefix}-page-size`}
                    className="form-select text-sm py-1.5 px-3 w-auto min-w-[5.5rem] rounded-md border-defaultborder bg-white dark:bg-bodybg"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    aria-label={`Rows per page for ${itemLabel}`}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

/**
 * Bottom footer: page navigation using theme pagination styles.
 */
export const BookingsTableFooter: React.FC<BookingsTablePaginationProps> = ({
    page,
    totalPages,
    totalResults,
    pageSize,
    onPageChange,
    pageSizeOptions: _pageSizeOptions,
    itemLabel: _itemLabel,
    idPrefix = "bookings-pagination",
}) => {
    const { safeTotalPages, pages } = useBookingsPaginationMeta(
        page,
        totalPages,
        totalResults,
        pageSize
    );

    if (totalResults === 0) {
        return null;
    }

    const goToPage = (nextPage: number) => {
        onPageChange(Math.min(safeTotalPages, Math.max(1, nextPage)));
    };

    const isFirstPage = page <= 1;
    const isLastPage = page >= safeTotalPages;

    return (
        <div className="mt-4 pt-4 border-t border-defaultborder">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted mb-0 text-center sm:text-left">
                    Page{" "}
                    <span className="font-semibold text-defaulttextcolor">{page}</span> of{" "}
                    <span className="font-semibold text-defaulttextcolor">{safeTotalPages}</span>
                </p>

                <nav
                    aria-label="Bookings table pagination"
                    className="pagination-style-4 flex justify-center sm:justify-end"
                >
                    <ul className="ti-pagination mb-0 flex flex-wrap items-center justify-center gap-1">
                        <li className={`page-item list-none ${isFirstPage ? "opacity-50 pointer-events-none" : ""}`}>
                            <button
                                type="button"
                                className="page-link !px-2.5 !py-2 rounded inline-flex items-center justify-center min-w-[2.25rem]"
                                onClick={() => goToPage(1)}
                                disabled={isFirstPage}
                                aria-label="First page"
                                id={`${idPrefix}-first`}
                            >
                                <i className="ri-skip-back-mini-line" aria-hidden="true"></i>
                            </button>
                        </li>
                        <li className={`page-item list-none ${isFirstPage ? "opacity-50 pointer-events-none" : ""}`}>
                            <button
                                type="button"
                                className="page-link !px-3 !py-2 rounded inline-flex items-center gap-1.5"
                                onClick={() => goToPage(page - 1)}
                                disabled={isFirstPage}
                                aria-label="Previous page"
                                id={`${idPrefix}-prev`}
                            >
                                <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
                                <span>Previous</span>
                            </button>
                        </li>

                        {pages.map((p, index) =>
                            p === "..." ? (
                                <li key={`ellipsis-${index}`} className="page-item list-none px-1">
                                    <span className="text-muted text-sm select-none" aria-hidden="true">
                                        …
                                    </span>
                                </li>
                            ) : (
                                <li key={p} className="page-item list-none">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(p)}
                                        className={`page-link !min-w-[2.25rem] !px-3 !py-2 rounded text-center ${
                                            page === p ? "active" : ""
                                        }`}
                                        aria-label={`Page ${p}`}
                                        aria-current={page === p ? "page" : undefined}
                                    >
                                        {p}
                                    </button>
                                </li>
                            )
                        )}

                        <li className={`page-item list-none ${isLastPage ? "opacity-50 pointer-events-none" : ""}`}>
                            <button
                                type="button"
                                className="page-link !px-3 !py-2 rounded inline-flex items-center gap-1.5"
                                onClick={() => goToPage(page + 1)}
                                disabled={isLastPage}
                                aria-label="Next page"
                                id={`${idPrefix}-next`}
                            >
                                <span>Next</span>
                                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                            </button>
                        </li>
                        <li className={`page-item list-none ${isLastPage ? "opacity-50 pointer-events-none" : ""}`}>
                            <button
                                type="button"
                                className="page-link !px-2.5 !py-2 rounded inline-flex items-center justify-center min-w-[2.25rem]"
                                onClick={() => goToPage(safeTotalPages)}
                                disabled={isLastPage}
                                aria-label="Last page"
                                id={`${idPrefix}-last`}
                            >
                                <i className="ri-skip-forward-mini-line" aria-hidden="true"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

/** @deprecated Use BookingsTableToolbar + BookingsTableFooter instead. */
const BookingsTablePagination: React.FC<BookingsTablePaginationProps> = (props) => (
    <>
        <BookingsTableToolbar {...props} />
        <BookingsTableFooter {...props} />
    </>
);

export default BookingsTablePagination;
