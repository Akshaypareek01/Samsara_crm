"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment } from 'react';
import CompanyLegalDocument from '@/shared/components/company/CompanyLegalDocument';
import '@/shared/styles/company-legal.css';
import '@/shared/styles/trainer-form.css';

/**
 * Company Terms & Conditions and Privacy Policy for corporate CRM users.
 */
const CompanyLegalPage = () => {
  return (
    <Fragment>
      <Seo title="Company Terms & Privacy" />
      <div className="min-h-dvh bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg text-defaultsize text-defaulttextcolor">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/company/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <i className="ri-arrow-left-line" aria-hidden="true"></i>
              Back to registration
            </Link>
            <Link
              href="/company/login"
              className="text-sm text-[#8c9097] dark:text-white/50 hover:text-primary"
            >
              Company login
            </Link>
          </div>

          <div className="bg-white dark:bg-bodybg rounded-2xl shadow-2xl border border-defaultborder/50 overflow-hidden">
            <div className="border-b border-defaultborder/50 px-6 sm:px-8 py-5 flex items-center gap-4">
              <img
                src="/assets/images/logo.jpeg"
                alt="Samsara"
                className="h-14 sm:h-16 w-auto object-contain"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Samsara Wellness</p>
                <p className="text-sm text-[#8c9097] dark:text-white/50">Corporate legal document</p>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-6 sm:py-8 max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain">
              <CompanyLegalDocument />
            </div>
          </div>

          <p className="text-center text-[0.65rem] text-[#8c9097] dark:text-white/50 mt-4 leading-relaxed">
            Copyright&copy; 2025 Samsaraa Wellness Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </Fragment>
  );
};

export default CompanyLegalPage;
