"use client";

import React from "react";
import { TRAINER_CITY_OPTIONS } from "@/services/trainerService";

type CompanyEapTrainersBrowseFiltersProps = {
  searchInput: string;
  filterCity: string;
  sortBy: string;
  loading: boolean;
  totalResults: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
};

/**
 * Filter panel for the company EAP trainers browse page.
 */
const CompanyEapTrainersBrowseFilters: React.FC<CompanyEapTrainersBrowseFiltersProps> = ({
  searchInput,
  filterCity,
  sortBy,
  loading,
  totalResults,
  hasActiveFilters,
  onSearchChange,
  onCityChange,
  onSortChange,
  onClearFilters,
}) => (
  <section className="company-eap-filters" aria-label="Filter EAP trainers">
    <div className="company-eap-filters__grid company-eap-filters__grid--trainers">
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-trainer-browse-search">
          Search
        </label>
        <input
          id="eap-trainer-browse-search"
          type="search"
          className="company-eap-filters__input"
          placeholder="Search by name or title…"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search EAP trainers by name or title"
        />
      </div>
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-trainer-browse-city">
          City
        </label>
        <select
          id="eap-trainer-browse-city"
          className="company-eap-filters__select"
          value={filterCity}
          onChange={(e) => onCityChange(e.target.value)}
          aria-label="Filter by city"
        >
          <option value="">All cities</option>
          {TRAINER_CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="company-eap-filters__label" htmlFor="eap-trainer-browse-sort">
          Sort
        </label>
        <select
          id="eap-trainer-browse-sort"
          className="company-eap-filters__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort trainers"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
        </select>
      </div>
    </div>

    <div className="company-eap-filters__footer">
      <p className="company-eap-filters__count" aria-live="polite">
        {loading ? "Loading…" : `${totalResults} trainer${totalResults === 1 ? "" : "s"} found`}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          className="company-eap-btn company-eap-btn--ghost"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      )}
    </div>
  </section>
);

export default CompanyEapTrainersBrowseFilters;
