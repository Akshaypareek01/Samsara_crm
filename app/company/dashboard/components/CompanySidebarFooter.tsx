"use client";

import React from 'react';
import Link from 'next/link';
import { useCompanySession } from '@/hooks/useCompanySession';

/**
 * Sidebar footer: help link and signed-in company user card.
 */
const CompanySidebarFooter: React.FC = () => {
  const { company } = useCompanySession();

  const displayName =
    company?.contactPerson1?.name?.trim() ||
    company?.companyName?.trim() ||
    'Company Admin';

  const role =
    company?.contactPerson1?.designation?.trim() || 'HR Admin';

  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <footer className="company-sidebar-footer" aria-label="Sidebar footer">
      <Link
        href="/company/dashboard/settings"
        className="company-sidebar-help"
        aria-label="Help and support"
      >
        <i className="ri-customer-service-2-line text-lg" aria-hidden="true"></i>
        Help &amp; Support
      </Link>

      <Link
        href="/company/dashboard/profile"
        className="company-sidebar-user"
        aria-label={`${displayName}, ${role}. Open profile`}
      >
        {company?.companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.companyLogo}
            alt=""
            className="company-sidebar-user-avatar"
          />
        ) : (
          <span className="company-sidebar-user-initials" aria-hidden="true">
            {initials}
          </span>
        )}
        <span className="company-sidebar-user-meta">
          <span className="company-sidebar-user-name">{displayName}</span>
          <span className="company-sidebar-user-role">{role}</span>
        </span>
        <i
          className="ri-arrow-right-s-line company-sidebar-user-chevron"
          aria-hidden="true"
        ></i>
      </Link>
    </footer>
  );
};

export default CompanySidebarFooter;
