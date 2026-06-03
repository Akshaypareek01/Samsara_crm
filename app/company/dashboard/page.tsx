"use client";

import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useCallback, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import { useCompanySession } from '@/hooks/useCompanySession';
import { useCompanyHomeTrainers } from '@/hooks/useCompanyHomeTrainers';
import { HOME_TRAINER_CATEGORIES } from './constants/homeTrainerCategories';
import CompanyHomeWelcomeBanner from './components/home/CompanyHomeWelcomeBanner';
import CompanyHomeCategorySection from './components/home/CompanyHomeCategorySection';
import CompanyHomeCtaBanner from './components/home/CompanyHomeCtaBanner';
import './components/company-trainer-card.css';
import CompanyTrainerProfileDrawer from './components/CompanyTrainerProfileDrawer';
import CompanyBookingDrawer from './components/CompanyBookingDrawer';

/**
 * Company home dashboard — welcome banner and trainers grouped by category.
 */
const CompanyDashboard = () => {
  const { company } = useCompanySession();
  const { byCategory, loading, error } = useCompanyHomeTrainers();

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [trainerToBook, setTrainerToBook] = useState<Trainer | null>(null);

  const welcomeName =
    company?.contactPerson1?.name?.split(' ')[0] ||
    company?.companyName?.split(' ')[0] ||
    'there';

  /**
   * Opens the profile drawer and loads the full trainer record.
   *
   * @param trainer - Trainer from a category card.
   */
  const openProfileDrawer = useCallback(async (trainer: Trainer) => {
    const id = trainer._id || trainer.id;
    setSelectedTrainer(trainer);
    setProfileDrawerOpen(true);
    if (!id) return;
    try {
      setProfileLoading(true);
      const full = await TrainerService.getTrainerById(id);
      setSelectedTrainer(full);
    } catch (err: unknown) {
      console.error('Error loading trainer profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const handleBookSessionFromProfile = (trainer: Trainer) => {
    setProfileDrawerOpen(false);
    setSelectedTrainer(null);
    setTrainerToBook(trainer);
    setBookingDrawerOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingDrawerOpen(false);
    setTrainerToBook(null);
  };

  return (
    <Fragment>
      <Seo title="Dashboard" />

      <div className="company-home-page flex flex-col gap-8 pb-6">
        <CompanyHomeWelcomeBanner userName={welcomeName} />

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
            onViewProfile={(trainer) => void openProfileDrawer(trainer)}
          />
        ))}

        <CompanyHomeCtaBanner />
      </div>

      <CompanyTrainerProfileDrawer
        open={profileDrawerOpen}
        trainer={selectedTrainer}
        loading={profileLoading}
        onClose={() => {
          setProfileDrawerOpen(false);
          setSelectedTrainer(null);
        }}
        onBookSession={handleBookSessionFromProfile}
      />

      <CompanyBookingDrawer
        trainer={trainerToBook}
        isOpen={bookingDrawerOpen}
        onClose={() => {
          setBookingDrawerOpen(false);
          setTrainerToBook(null);
        }}
        onSuccess={handleBookingSuccess}
      />
    </Fragment>
  );
};

export default CompanyDashboard;
