"use client";

import React from 'react';
import {
  TRAINER_CATEGORY_OPTIONS,
  TRAINER_CITY_OPTIONS,
  SPECIALIST_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
} from '@/services/trainerService';

type CompanyTrainersFiltersProps = {
  searchInput: string;
  activeCategory: string;
  filterSpecialist: string;
  filterTraining: string;
  filterCity: string;
  sortBy: string;
  loading: boolean;
  totalResults: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSpecialistChange: (value: string) => void;
  onTrainingChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
};

/**
 * Filter panel for the company trainers listing page.
 */
const CompanyTrainersFilters: React.FC<CompanyTrainersFiltersProps> = ({
  searchInput,
  activeCategory,
  filterSpecialist,
  filterTraining,
  filterCity,
  sortBy,
  loading,
  totalResults,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onSpecialistChange,
  onTrainingChange,
  onCityChange,
  onSortChange,
  onClearFilters,
}) => (
  <section className="company-trainers-filters" aria-label="Filter trainers">
    <div className="company-trainers-filters__grid">
      <div>
        <label className="company-trainers-filters__label" htmlFor="trainer-search">
          Search
        </label>
        <input
          id="trainer-search"
          type="search"
          className="company-trainers-filters__input"
          placeholder="Name or specialty..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search trainers by name or specialty"
        />
      </div>
      <div>
        <label className="company-trainers-filters__label" htmlFor="trainer-category">
          Category
        </label>
        <select
          id="trainer-category"
          className="company-trainers-filters__select"
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {TRAINER_CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="company-trainers-filters__label" htmlFor="trainer-specialist">
          Specialist
        </label>
        <select
          id="trainer-specialist"
          className="company-trainers-filters__select"
          value={filterSpecialist}
          onChange={(e) => onSpecialistChange(e.target.value)}
          aria-label="Filter by specialist"
        >
          <option value="">All</option>
          {SPECIALIST_OPTIONS.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="company-trainers-filters__label" htmlFor="trainer-training">
          Program
        </label>
        <select
          id="trainer-training"
          className="company-trainers-filters__select"
          value={filterTraining}
          onChange={(e) => onTrainingChange(e.target.value)}
          aria-label="Filter by training program"
        >
          <option value="">All Programs</option>
          {TYPE_OF_TRAINING_OPTIONS.map((training) => (
            <option key={training} value={training}>
              {training}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="company-trainers-filters__label" htmlFor="trainer-city-filter">
          City
        </label>
        <select
          id="trainer-city-filter"
          className="company-trainers-filters__select"
          value={filterCity}
          onChange={(e) => onCityChange(e.target.value)}
          aria-label="Filter by city"
        >
          <option value="">All Cities</option>
          {TRAINER_CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="company-trainers-filters__label" htmlFor="trainer-sort">
          Sort
        </label>
        <select
          id="trainer-sort"
          className="company-trainers-filters__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort trainers"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
        </select>
      </div>
    </div>

    <div className="company-trainers-filters__footer">
      <p className="company-trainers-filters__count">
        {loading
          ? 'Loading trainers…'
          : `${totalResults} trainer${totalResults === 1 ? '' : 's'} found`}
      </p>
      <button
        type="button"
        className="company-trainers-btn company-trainers-btn--ghost"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
        aria-label="Clear all filters"
      >
        <i className="ri-refresh-line" aria-hidden="true"></i>
        Clear filters
      </button>
    </div>
  </section>
);

export default CompanyTrainersFilters;
