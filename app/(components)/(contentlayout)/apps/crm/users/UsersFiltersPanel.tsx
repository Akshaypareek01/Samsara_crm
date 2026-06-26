"use client";

import React from "react";
import type { UserCategoryTab, UsersListFilters } from "./usersFilterTypes";
import { hasActiveUsersFilters } from "./usersFilterTypes";

type UsersFiltersPanelProps = {
  categoryTab: UserCategoryTab;
  filters: UsersListFilters;
  onChange: (next: UsersListFilters) => void;
  onClear: () => void;
};

/**
 * Search and filter controls for the admin users list.
 */
export default function UsersFiltersPanel({
  categoryTab,
  filters,
  onChange,
  onClear,
}: UsersFiltersPanelProps) {
  const showCorporateFilters = categoryTab === "Corporate" || categoryTab === "all";
  const inputClass = "form-control text-sm py-1.5";

  const patch = (partial: Partial<UsersListFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="box mb-4">
      <div className="box-body">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="form-label text-xs" htmlFor="users-filter-search">
              Search name / email
            </label>
            <input
              id="users-filter-search"
              type="text"
              className={inputClass}
              placeholder="Search users…"
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label text-xs" htmlFor="users-filter-mobile">
              Mobile
            </label>
            <input
              id="users-filter-mobile"
              type="text"
              className={inputClass}
              placeholder="Filter by mobile"
              value={filters.mobile}
              onChange={(e) => patch({ mobile: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label text-xs" htmlFor="users-filter-city">
              City
            </label>
            <input
              id="users-filter-city"
              type="text"
              className={inputClass}
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label text-xs" htmlFor="users-filter-status">
              Status
            </label>
            <select
              id="users-filter-status"
              className={inputClass}
              value={filters.status}
              onChange={(e) => patch({ status: e.target.value as UsersListFilters["status"] })}
              aria-label="Filter by account status"
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {showCorporateFilters && (
            <>
              <div>
                <label className="form-label text-xs" htmlFor="users-filter-company-id">
                  Company ID
                </label>
                <input
                  id="users-filter-company-id"
                  type="text"
                  className={inputClass}
                  placeholder="e.g. SW-12345"
                  value={filters.companyId}
                  onChange={(e) => patch({ companyId: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label text-xs" htmlFor="users-filter-company-name">
                  Company name
                </label>
                <input
                  id="users-filter-company-name"
                  type="text"
                  className={inputClass}
                  placeholder="Search by company name"
                  value={filters.companyName}
                  onChange={(e) => patch({ companyName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label text-xs" htmlFor="users-filter-corporate-id">
                  Corporate ID
                </label>
                <input
                  id="users-filter-corporate-id"
                  type="text"
                  className={inputClass}
                  placeholder="Employee / corporate ID"
                  value={filters.corporateId}
                  onChange={(e) => patch({ corporateId: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        {hasActiveUsersFilters(filters) && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="ti-btn ti-btn-sm ti-btn-light !text-xs"
              onClick={onClear}
              aria-label="Clear all filters"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
