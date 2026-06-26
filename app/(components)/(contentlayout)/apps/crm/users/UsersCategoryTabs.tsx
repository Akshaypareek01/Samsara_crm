"use client";

import React from "react";
import type { UserCategoryTab } from "./usersFilterTypes";

type UsersCategoryTabsProps = {
  activeTab: UserCategoryTab;
  onChange: (tab: UserCategoryTab) => void;
};

const TABS: { id: UserCategoryTab; label: string; icon: string }[] = [
  { id: "all", label: "All users", icon: "ri-group-line" },
  { id: "Personal", label: "Personal", icon: "ri-user-line" },
  { id: "Corporate", label: "Corporate", icon: "ri-building-line" },
];

/**
 * Category tabs for filtering personal vs corporate users.
 */
export default function UsersCategoryTabs({ activeTab, onChange }: UsersCategoryTabsProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-defaultborder p-1 bg-light/40 mb-4"
      role="tablist"
      aria-label="User category"
    >
      {TABS.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors inline-flex items-center gap-1.5 ${
              selected
                ? "bg-white dark:bg-bodybg text-primary shadow-sm"
                : "text-muted hover:text-defaulttextcolor"
            }`}
            onClick={() => onChange(tab.id)}
          >
            <i className={`${tab.icon} text-base`} aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
