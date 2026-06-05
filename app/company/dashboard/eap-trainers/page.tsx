"use client";

import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EapTrainingService, { type EapTraining, type EapDurationHours } from "@/services/eapTrainingService";
import CompanyEapTrainingsFilters from "../components/eap-trainers/CompanyEapTrainingsFilters";
import CompanyEapTrainingBrowseCard from "../components/eap-trainers/CompanyEapTrainingBrowseCard";
import "@/shared/styles/eap-training-page.css";
import "../components/eap-trainers/company-eap-trainers-page.css";

const PAGE_LIMIT = 12;

/**
 * Builds pagination tokens with ellipsis.
 */
const getPageNumbers = (current: number, total: number): (number | "..." )[] => {
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

const EapTrainersPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [trainings, setTrainings] = useState<EapTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [trainerNameInput, setTrainerNameInput] = useState(searchParams.get("trainerName") ?? "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [trainerNameTerm, setTrainerNameTerm] = useState(searchParams.get("trainerName") ?? "");
  const [durationFilter, setDurationFilter] = useState(searchParams.get("duration") ?? "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "createdAt:desc");

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => setTrainerNameTerm(trainerNameInput), 300);
    return () => clearTimeout(t);
  }, [trainerNameInput]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, trainerNameTerm, durationFilter, sortBy]);

  /**
   * Sync filters to URL for back-navigation from detail page.
   */
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (trainerNameTerm) params.set("trainerName", trainerNameTerm);
    if (durationFilter) params.set("duration", durationFilter);
    if (sortBy !== "createdAt:desc") params.set("sortBy", sortBy);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/company/dashboard/eap-trainers?${qs}` : "/company/dashboard/eap-trainers", {
      scroll: false,
    });
  }, [searchTerm, trainerNameTerm, durationFilter, sortBy, page, router]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const fetchTrainings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_LIMIT,
        sortBy,
      };
      if (searchTerm) params.search = searchTerm;
      if (trainerNameTerm) params.trainerName = trainerNameTerm;
      if (durationFilter) params.duration = Number(durationFilter) as EapDurationHours;

      const response = await EapTrainingService.listTrainings(params);
      setTrainings(response.results || []);
      setTotalPages(response.totalPages || 1);
      setTotalResults(response.totalResults || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load training programs");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, trainerNameTerm, durationFilter, sortBy]);

  useEffect(() => {
    void fetchTrainings();
  }, [fetchTrainings]);

  const hasActiveFilters =
    !!searchInput ||
    !!trainerNameInput ||
    !!durationFilter ||
    sortBy !== "createdAt:desc";

  const handleClearFilters = () => {
    setSearchInput("");
    setTrainerNameInput("");
    setDurationFilter("");
    setSortBy("createdAt:desc");
    setPage(1);
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="company-eap-trainers-page">
      <header className="company-eap-trainers-page__header">
        <h1 className="company-eap-trainers-page__title">EAP Training Programs</h1>
        <p className="company-eap-trainers-page__subtitle">
          Browse structured EAP programs, view session outlines, and book by duration.
        </p>
      </header>

      <CompanyEapTrainingsFilters
        searchInput={searchInput}
        trainerNameInput={trainerNameInput}
        durationFilter={durationFilter}
        sortBy={sortBy}
        loading={loading}
        totalResults={totalResults}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchInput}
        onTrainerNameChange={setTrainerNameInput}
        onDurationChange={setDurationFilter}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="spinner-border text-violet-600" role="status">
            <span className="visually-hidden">Loading programs…</span>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <p className="text-muted text-center py-12">No training programs match your filters.</p>
      ) : (
        <>
          <div className="company-eap-browse-grid">
            {trainings.map((training) => (
              <CompanyEapTrainingBrowseCard
                key={training._id || training.id}
                training={training}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="company-eap-pagination" aria-label="Pagination">
              <button
                type="button"
                className="company-eap-btn company-eap-btn--ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div className="company-eap-pagination__pages">
                {pageNumbers.map((token, i) =>
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
                      onClick={() => setPage(token)}
                      aria-current={token === page ? "page" : undefined}
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
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Company EAP training programs catalog page.
 */
const EapTrainersPage = () => (
  <Fragment>
    <Seo title="EAP Training Programs" />
    <Suspense
      fallback={
        <div className="text-center py-16">
          <div className="spinner-border text-violet-600" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      }
    >
      <EapTrainersPageInner />
    </Suspense>
  </Fragment>
);

export default EapTrainersPage;
