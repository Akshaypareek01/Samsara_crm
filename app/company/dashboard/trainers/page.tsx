"use client";

import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, Suspense, useCallback, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import CompanyTrainerCard from '../components/CompanyTrainerCard';
import '../components/company-trainer-card.css';
import CompanyTrainersFilters from '../components/trainers/CompanyTrainersFilters';
import CompanyTrainersPagination from '../components/trainers/CompanyTrainersPagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HOME_TRAINER_CATEGORY_LABELS } from '../constants/homeTrainerCategories';
import { isValidTrainerCategory, trainersPageUrl } from '../utils/trainersPageUrl';
import '../components/trainers/company-trainers-page.css';

const PAGE_LIMIT = 12;

/**
 * Builds a compact list of page tokens with ellipsis for pagination.
 *
 * @param current - Active page (1-indexed).
 * @param total - Total number of pages.
 */
const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');
    pages.push(total);
    return pages;
};

const TrainersPageInner = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    const nameFromUrl = searchParams.get('name') ?? '';
    const urlCategory = isValidTrainerCategory(categoryFromUrl) ? categoryFromUrl : '';
    const listReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState(nameFromUrl);
    const [searchTerm, setSearchTerm] = useState(nameFromUrl);
    const [filterSpecialist, setFilterSpecialist] = useState('');
    const [filterCategory, setFilterCategory] = useState(urlCategory);
    const [filterTraining, setFilterTraining] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [sortBy, setSortBy] = useState('createdAt:desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const activeCategory = urlCategory || filterCategory;
    const pageTitle = activeCategory
        ? HOME_TRAINER_CATEGORY_LABELS[
              activeCategory as keyof typeof HOME_TRAINER_CATEGORY_LABELS
          ] || activeCategory
        : 'All Trainers';

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setFilterCategory(urlCategory);
        if (urlCategory) setPage(1);
    }, [urlCategory]);

    useEffect(() => {
        if (nameFromUrl) {
            setSearchInput(nameFromUrl);
            setSearchTerm(nameFromUrl);
        }
    }, [nameFromUrl]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterSpecialist, filterCategory, filterTraining, filterCity, sortBy]);

    const handleCategoryChange = (value: string) => {
        setFilterCategory(value);
        setPage(1);
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set('category', value);
        else params.delete('category');
        const qs = params.toString();
        router.replace(qs ? `${trainersPageUrl()}?${qs}` : trainersPageUrl());
    };

    const handleClearFilters = () => {
        setSearchInput('');
        setSearchTerm('');
        setFilterCategory('');
        setFilterSpecialist('');
        setFilterTraining('');
        setFilterCity('');
        setSortBy('createdAt:desc');
        setPage(1);
        router.replace(trainersPageUrl());
    };

    const hasActiveFilters =
        !!searchInput ||
        !!activeCategory ||
        !!filterSpecialist ||
        !!filterTraining ||
        !!filterCity ||
        sortBy !== 'createdAt:desc';

    const fetchTrainers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params: Record<string, string | number | boolean> = {
                status: true,
                acceptingBookings: true,
                excludeCategory: 'EAP Trainer',
                page,
                limit: PAGE_LIMIT,
                sortBy,
            };
            if (searchTerm) params.name = searchTerm;
            if (filterSpecialist) params.specialistIn = filterSpecialist;
            if (activeCategory) params.category = activeCategory;
            if (filterTraining) params.typeOfTraining = filterTraining;
            if (filterCity) params.city = filterCity;

            const response = await TrainerService.getTrainers(params);
            setTrainers(response.results || []);
            setTotalPages(response.totalPages || 1);
            setTotalResults(response.totalResults || 0);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch trainers');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterSpecialist, activeCategory, filterTraining, filterCity, sortBy, page]);

    useEffect(() => {
        void fetchTrainers();
    }, [fetchTrainers]);

    return (
        <Fragment>
            <Seo title="Trainers" />

            <div className="company-trainers-page">
                <header className="company-trainers-page__header">
                    <h1 className="company-trainers-page__title">{pageTitle}</h1>
                    <p className="company-trainers-page__subtitle">
                        Browse certified wellness experts and book sessions for your team.
                    </p>
                </header>

                {activeCategory && (
                    <div className="company-trainers-category-banner" role="status">
                        <p>
                            Filtered by{' '}
                            <strong>
                                {HOME_TRAINER_CATEGORY_LABELS[
                                    activeCategory as keyof typeof HOME_TRAINER_CATEGORY_LABELS
                                ] || activeCategory}
                            </strong>
                        </p>
                        <button
                            type="button"
                            className="company-trainers-btn company-trainers-btn--ghost"
                            onClick={() => handleCategoryChange('')}
                        >
                            View all
                        </button>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                        {error}
                    </div>
                )}

                <CompanyTrainersFilters
                    searchInput={searchInput}
                    activeCategory={activeCategory}
                    filterSpecialist={filterSpecialist}
                    filterTraining={filterTraining}
                    filterCity={filterCity}
                    sortBy={sortBy}
                    loading={loading}
                    totalResults={totalResults}
                    hasActiveFilters={hasActiveFilters}
                    onSearchChange={setSearchInput}
                    onCategoryChange={handleCategoryChange}
                    onSpecialistChange={setFilterSpecialist}
                    onTrainingChange={setFilterTraining}
                    onCityChange={setFilterCity}
                    onSortChange={setSortBy}
                    onClearFilters={handleClearFilters}
                />

                {loading ? (
                    <div className="text-center py-16" role="status">
                        <div className="spinner-border text-violet-600" style={{ color: '#7c3aed' }}>
                            <span className="visually-hidden">Loading trainers</span>
                        </div>
                        <p className="mt-3 text-sm text-gray-500">Loading trainers…</p>
                    </div>
                ) : (
                    <>
                        <div className="company-trainers-grid company-trainers-grid--dashboard">
                            {trainers.length === 0 ? (
                                <div className="company-trainers-empty">
                                    <p className="mb-0">No trainers match your filters.</p>
                                </div>
                            ) : (
                                trainers.map((trainer) => (
                                    <CompanyTrainerCard
                                        key={trainer._id || trainer.id}
                                        trainer={trainer}
                                        returnTo={listReturnTo}
                                    />
                                ))
                            )}
                        </div>

                        {totalResults > 0 && (
                            <CompanyTrainersPagination
                                page={page}
                                totalPages={totalPages}
                                totalResults={totalResults}
                                pageLimit={PAGE_LIMIT}
                                onPageChange={setPage}
                                getPageNumbers={getPageNumbers}
                            />
                        )}
                    </>
                )}
            </div>
        </Fragment>
    );
};

const TrainersPage = () => (
    <Suspense
        fallback={
            <div className="company-trainers-page text-center py-16" role="status">
                <div className="spinner-border" style={{ color: '#7c3aed' }}>
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        }
    >
        <TrainersPageInner />
    </Suspense>
);

export default TrainersPage;
