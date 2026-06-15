"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import React, { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TrainerService, { type Trainer } from "@/services/trainerService";
import CompanyTrainerCard from "../../components/CompanyTrainerCard";
import CompanyEapTrainersBrowseFilters from "../../components/eap-trainers/CompanyEapTrainersBrowseFilters";
import CompanyTrainersPagination from "../../components/trainers/CompanyTrainersPagination";
import "../../components/company-trainer-card.css";
import "../../components/eap-trainers/company-eap-trainers-page.css";
import "../../components/trainers/company-trainers-page.css";

const PAGE_LIMIT = 12;
const EAP_CATEGORY = "EAP Trainer";

/**
 * Builds pagination tokens with ellipsis.
 *
 * @param current - Active page (1-indexed).
 * @param total - Total page count.
 */
const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

const EapTrainersBrowsePageInner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [filterCity, setFilterCity] = useState(searchParams.get("city") ?? "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "createdAt:desc");

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterCity, sortBy]);

  /**
   * Sync browse filters to the URL for shareable links and back navigation.
   */
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filterCity) params.set("city", filterCity);
    if (sortBy !== "createdAt:desc") params.set("sortBy", sortBy);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(
      qs ? `/company/dashboard/eap-trainers/trainers?${qs}` : "/company/dashboard/eap-trainers/trainers",
      { scroll: false }
    );
  }, [searchTerm, filterCity, sortBy, page, router]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string | number | boolean> = {
        category: EAP_CATEGORY,
        status: true,
        acceptingBookings: true,
        page,
        limit: PAGE_LIMIT,
        sortBy,
      };
      if (searchTerm) params.name = searchTerm;
      if (filterCity) params.city = filterCity;

      const response = await TrainerService.getTrainers(params);
      setTrainers(response.results || []);
      setTotalPages(response.totalPages || 1);
      setTotalResults(response.totalResults || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load EAP trainers");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filterCity, sortBy]);

  useEffect(() => {
    void fetchTrainers();
  }, [fetchTrainers]);

  const hasActiveFilters = !!searchInput || !!filterCity || sortBy !== "createdAt:desc";

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilterCity("");
    setSortBy("createdAt:desc");
    setPage(1);
  };

  return (
    <div className="company-eap-trainers-page">
      <Link href="/company/dashboard/eap-trainers" className="company-eap-trainers-page__back">
        <i className="ri-arrow-left-line" aria-hidden="true" />
        Back to EAP Programs
      </Link>

      <header className="company-eap-trainers-page__header">
        <h1 className="company-eap-trainers-page__title">All EAP Trainers</h1>
        <p className="company-eap-trainers-page__subtitle">
          Browse certified EAP professionals and view their profiles.
        </p>
      </header>

      <CompanyEapTrainersBrowseFilters
        searchInput={searchInput}
        filterCity={filterCity}
        sortBy={sortBy}
        loading={loading}
        totalResults={totalResults}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchInput}
        onCityChange={setFilterCity}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16" role="status">
          <div className="spinner-border text-primary">
            <span className="visually-hidden">Loading trainers…</span>
          </div>
        </div>
      ) : trainers.length === 0 ? (
        <p className="text-muted text-center py-12">No EAP trainers match your filters.</p>
      ) : (
        <>
          <div className="company-trainers-grid company-trainers-grid--dashboard">
            {trainers.map((trainer) => (
              <CompanyTrainerCard
                key={trainer._id || trainer.id}
                trainer={trainer}
                returnTo={listReturnTo}
              />
            ))}
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
  );
};

/**
 * Company page listing all EAP trainers with search and pagination.
 */
const EapTrainersBrowsePage = () => (
  <Fragment>
    <Seo title="All EAP Trainers" />
    <Suspense
      fallback={
        <div className="text-center py-16">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      }
    >
      <EapTrainersBrowsePageInner />
    </Suspense>
  </Fragment>
);

export default EapTrainersBrowsePage;
