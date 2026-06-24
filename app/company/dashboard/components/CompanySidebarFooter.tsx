"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCompanySession } from '@/hooks/useCompanySession';
import HelpSupportModal from '@/shared/components/HelpSupportModal';

/**
 * Sidebar footer: help link and signed-in company user card.
 */
const CompanySidebarFooter: React.FC = () => {
  const { company } = useCompanySession();
  const [helpOpen, setHelpOpen] = useState(false);

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
      <button
        type="button"
        className="company-sidebar-help"
        aria-label="Help and support"
        aria-haspopup="dialog"
        onClick={() => setHelpOpen(true)}
      >
        <i className="ri-customer-service-2-line text-lg" aria-hidden="true"></i>
        Help &amp; Support
      </button>

      <HelpSupportModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        description="Need assistance with bookings, trainers, or your company account? Reach out to our team and we'll get back to you as soon as possible."
        email="assist@samsarawellness.in"
      />

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
