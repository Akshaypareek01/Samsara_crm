"use client";

import React from 'react';

type CompanyTrainersPaginationProps = {
  page: number;
  totalPages: number;
  totalResults: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  getPageNumbers: (current: number, total: number) => (number | '...')[];
};

/**
 * Pagination controls for the company trainers listing.
 */
const CompanyTrainersPagination: React.FC<CompanyTrainersPaginationProps> = ({
  page,
  totalPages,
  totalResults,
  pageLimit,
  onPageChange,
  getPageNumbers,
}) => (
  <nav className="company-trainers-pagination" aria-label="Trainers pagination">
    <p className="company-trainers-filters__count mb-0">
      Showing{' '}
      <strong className="text-gray-900">
        {(page - 1) * pageLimit + 1}–{Math.min(page * pageLimit, totalResults)}
      </strong>{' '}
      of <strong className="text-gray-900">{totalResults}</strong>
    </p>

    <ul className="company-trainers-pagination__pages">
      <li>
        <button
          type="button"
          className="company-trainers-pagination__page"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
        </button>
      </li>

      {getPageNumbers(page, totalPages).map((item, idx) =>
        item === '...' ? (
          <li key={`ellipsis-${idx}`} className="px-1 text-gray-400 select-none">
            …
          </li>
        ) : (
          <li key={item}>
            <button
              type="button"
              className={`company-trainers-pagination__page ${
                item === page ? 'company-trainers-pagination__page--active' : ''
              }`}
              onClick={() => onPageChange(item as number)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          </li>
        )
      )}

      <li>
        <button
          type="button"
          className="company-trainers-pagination__page"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
        </button>
      </li>
    </ul>
  </nav>
);

export default CompanyTrainersPagination;
