"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { connect } from 'react-redux';
import { ThemeChanger } from '@/shared/redux/action';
import AdminService from '@/services/adminService';
import { useCompanySession } from '@/hooks/useCompanySession';
import { toggleCompanySidebar } from '../utils/toggleCompanySidebar';
import CompanyRatingAlertsBell from './CompanyRatingAlertsBell';
import './company-trainer-rating-drawer.css';

type CompanyDashboardHeaderProps = {
  local_varaiable?: unknown;
};

type StoredCompanyUser = {
  companyName?: string;
  companyLogo?: string;
  contactPerson1?: { name?: string; designation?: string };
};

/**
 * Reads cached company user from localStorage for header display before profile API returns.
 */
function getStoredCompanyUser(): StoredCompanyUser | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as StoredCompanyUser) : null;
  } catch {
    return null;
  }
}

/**
 * Company dashboard top bar: menu toggle, user avatar, logout (sidebar purple style).
 */
const CompanyDashboardHeader: React.FC<CompanyDashboardHeaderProps> = () => {
  const router = useRouter();
  const { company } = useCompanySession();
  const [stored, setStored] = useState<StoredCompanyUser | null>(null);

  useEffect(() => {
    setStored(getStoredCompanyUser());
  }, []);

  const displayName =
    company?.contactPerson1?.name?.trim() ||
    company?.companyName?.trim() ||
    stored?.contactPerson1?.name?.trim() ||
    stored?.companyName?.trim() ||
    'Company';

  const role =
    company?.contactPerson1?.designation?.trim() ||
    stored?.contactPerson1?.designation?.trim() ||
    'HR Admin';

  const avatarUrl = company?.companyLogo || stored?.companyLogo || '';
  const initials = displayName
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  /**
   * Signs the company user out and returns to login.
   */
  const handleLogout = async () => {
    try {
      await AdminService.logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('Auth');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
      }
      router.push('/company/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/company/login');
    }
  };

  return (
    <header className="company-dashboard-header app-header" role="banner">
      <div className="company-dashboard-header-inner">
        <button
          type="button"
          className="company-dashboard-header-menu"
          onClick={() => toggleCompanySidebar()}
          aria-label="Toggle navigation menu"
        >
          <i className="ri-menu-2-line text-xl" aria-hidden="true"></i>
        </button>

        <div className="company-dashboard-header-spacer" aria-hidden="true" />

        <div className="company-dashboard-header-actions">
          <CompanyRatingAlertsBell />
        </div>

        <div className="company-dashboard-header-user-block">
          <Link
            href="/company/dashboard/profile"
            className="company-dashboard-header-user"
            aria-label={`${displayName}, ${role}. View profile`}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="company-dashboard-header-avatar" />
            ) : (
              <span className="company-dashboard-header-avatar-fallback" aria-hidden="true">
                {initials}
              </span>
            )}
            <span className="company-dashboard-header-user-text hidden sm:flex">
              <span className="company-dashboard-header-user-name">{displayName}</span>
              <span className="company-dashboard-header-user-role">{role}</span>
            </span>
          </Link>

          <button
            type="button"
            className="company-dashboard-header-logout"
            onClick={() => void handleLogout()}
            aria-label="Log out"
          >
            <i className="ri-logout-box-r-line text-base" aria-hidden="true"></i>
            <span className="company-dashboard-header-logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const mapStateToProps = (state: unknown) => ({
  local_varaiable: state,
});

export default connect(mapStateToProps, { ThemeChanger })(CompanyDashboardHeader);
