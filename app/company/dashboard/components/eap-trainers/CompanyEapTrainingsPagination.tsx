"use client";

import React from "react";

type CompanyEapTrainingsPaginationProps = {
  page: number;
  totalPages: number;
  totalResults: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  getPageNumbers: (current: number, total: number) => (number | "...")[];
};

/**
 * Pagination controls for the company EAP training programs catalog.
 */
const CompanyEapTrainingsPagination: React.FC<CompanyEapTrainingsPaginationProps> = ({
  page,
  totalPages,
  totalResults,
  pageLimit,
  onPageChange,
  getPageNumbers,
}) => {
  const rangeStart = totalResults === 0 ? 0 : (page - 1) * pageLimit + 1;
  const rangeEnd = Math.min(page * pageLimit, totalResults);

  return (
    <nav className="company-eap-pagination" aria-label="Training programs pagination">
      <p className="company-eap-filters__count mb-0 company-eap-pagination__summary">
        Showing{" "}
        <strong className="text-gray-900">
          {rangeStart}–{rangeEnd}
        </strong>{" "}
        of <strong className="text-gray-900">{totalResults}</strong>
      </p>

      {totalPages > 1 && (
        <>
          <button
            type="button"
            className="company-eap-btn company-eap-btn--ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-label="Previous page"
          >
            Previous
          </button>

          <div className="company-eap-pagination__pages">
            {getPageNumbers(page, totalPages).map((token, i) =>
              token === "..." ? (
                <span key={`ellipsis-${i}`} className="company-eap-pagination__ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={token}
                  type="button"
                  className={`company-eap-pagination__page ${
                    token === page ? "company-eap-pagination__page--active" : ""
                  }`}
                  onClick={() => onPageChange(token)}
                  aria-current={token === page ? "page" : undefined}
                  aria-label={`Page ${token}`}
                >
                  {token}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="company-eap-btn company-eap-btn--ghost"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            aria-label="Next page"
          >
            Next
          </button>
        </>
      )}
    </nav>
  );
};

export default CompanyEapTrainingsPagination;
