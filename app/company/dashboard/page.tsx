"use client";

import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment } from 'react';
import { useCompanySession } from '@/hooks/useCompanySession';
import { useCompanyHomeTrainers } from '@/hooks/useCompanyHomeTrainers';
import { HOME_TRAINER_CATEGORIES } from './constants/homeTrainerCategories';
import CompanyHomeWelcomeBanner from './components/home/CompanyHomeWelcomeBanner';
import CompanyHomeFeedbackFormLink from './components/home/CompanyHomeFeedbackFormLink';
import CompanyHomeCategorySection from './components/home/CompanyHomeCategorySection';
import CompanyHomeCtaBanner from './components/home/CompanyHomeCtaBanner';
import './components/company-trainer-card.css';

/**
 * Company home dashboard — welcome banner and trainers grouped by category.
 */
const CompanyDashboard = () => {
  const { company } = useCompanySession();
  const { byCategory, loading, error } = useCompanyHomeTrainers();

  const welcomeName =
    company?.contactPerson1?.name?.split(' ')[0] ||
    company?.companyName?.split(' ')[0] ||
    'there';

  return (
    <Fragment>
      <Seo title="Dashboard" />

      <div className="company-home-page flex flex-col gap-8 pb-6">
        <CompanyHomeWelcomeBanner userName={welcomeName} />

        <CompanyHomeFeedbackFormLink />

        {error && (
          <div className="alert alert-warning mb-0" role="alert">
            {error}
          </div>
        )}

        {HOME_TRAINER_CATEGORIES.map(({ category, title }) => (
          <CompanyHomeCategorySection
            key={category}
            title={title}
            category={category}
            trainers={byCategory[category]}
            loading={loading}
          />
        ))}

        <CompanyHomeCtaBanner />
      </div>
    </Fragment>
  );
};

export default CompanyDashboard;
