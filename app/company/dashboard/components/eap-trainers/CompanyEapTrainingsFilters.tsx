"use client";

import React from "react";
import { EAP_DURATION_OPTIONS, formatEapDurationLabel } from "@/shared/utils/eapTrainingUtils";

type CompanyEapTrainingsFiltersProps = {
  searchInput: string;
  trainerNameInput: string;
  durationFilter: string;
  sortBy: string;
  loading: boolean;
  totalResults: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onTrainerNameChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
};

/**
 * Filter panel for the company EAP training programs catalog.
 */
const CompanyEapTrainingsFilters: React.FC<CompanyEapTrainingsFiltersProps> = ({
  searchInput,
  trainerNameInput,
  durationFilter,
  sortBy,
  loading,
  totalResults,
  hasActiveFilters,
  onSearchChange,
  onTrainerNameChange,
  onDurationChange,
  onSortChange,
  onClearFilters,
}) => (
  <section className="company-eap-filters" aria-label="Filter EAP training programs">
    <div className="company-eap-filters__grid">
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-program-search">
          Program
        </label>
        <input
          id="eap-program-search"
          type="search"
          className="company-eap-filters__input"
          placeholder="Search by program title…"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search training programs by title"
        />
      </div>
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-trainer-search">
          Trainer
        </label>
        <input
          id="eap-trainer-search"
          type="search"
          className="company-eap-filters__input"
          placeholder="Search by trainer name…"
          value={trainerNameInput}
          onChange={(e) => onTrainerNameChange(e.target.value)}
          aria-label="Search by trainer name"
        />
      </div>
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-duration-filter">
          Duration
        </label>
        <select
          id="eap-duration-filter"
          className="company-eap-filters__select"
          value={durationFilter}
          onChange={(e) => onDurationChange(e.target.value)}
          aria-label="Filter by session duration"
        >
          <option value="">All durations</option>
          {EAP_DURATION_OPTIONS.map((hours) => (
            <option key={hours} value={String(hours)}>
              {formatEapDurationLabel(hours)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-sort">
          Sort
        </label>
        <select
          id="eap-sort"
          className="company-eap-filters__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort training programs"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="title:asc">Title A–Z</option>
          <option value="title:desc">Title Z–A</option>
        </select>
      </div>
    </div>

    <div className="company-eap-filters__footer">
      <p className="company-eap-filters__count">
        {loading
          ? "Loading programs…"
          : `${totalResults} program${totalResults === 1 ? "" : "s"} found`}
      </p>
      <button
        type="button"
        className="company-eap-btn company-eap-btn--ghost"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
        aria-label="Clear all filters"
      >
        <i className="ri-refresh-line" aria-hidden="true" />
        Clear filters
      </button>
    </div>
  </section>
);

export default CompanyEapTrainingsFilters;
