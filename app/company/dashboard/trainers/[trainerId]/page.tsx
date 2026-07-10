"use client";

import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import TrainerService, { type Trainer, isTrainerAcceptingBookings } from '@/services/trainerService';
import CompanyTrainerProfilePanel from '../../components/CompanyTrainerProfilePanel';
import { bookingNewPageUrl } from '../../utils/bookingPageUrl';
import { safeTrainerProfileReturnTo } from '../../utils/trainerProfilePageUrl';
import '../../components/company-trainer-profile-drawer.css';
import '../../components/company-trainer-profile-page.css';

/**
 * Full-page trainer profile for company users.
 */
const CompanyTrainerProfilePageInner = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const trainerId = typeof params.trainerId === 'string' ? params.trainerId : '';
  const returnTo = safeTrainerProfileReturnTo(searchParams.get('returnTo'));

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bookHref = trainerId
    ? bookingNewPageUrl(trainerId, returnTo)
    : bookingNewPageUrl();

  useEffect(() => {
    if (!trainerId) {
      setError('Invalid trainer id');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await TrainerService.getTrainerById(trainerId);
        if (!cancelled) setTrainer(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load trainer profile');
          setTrainer(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;

  return (
    <Fragment>
      <Seo title={trainer?.name ? `${trainer.name} — Trainer Profile` : 'Trainer Profile'} />

      <div className="company-trainer-profile-page">
        <Link href={returnTo} className="company-trainer-profile-page__back">
          <i className="ri-arrow-left-line" aria-hidden="true" />
          Back
        </Link>

        <header className="company-trainer-profile-page__header">
          <h1 className="company-trainer-profile-page__title">Trainer Profile</h1>
          <p className="company-trainer-profile-page__subtitle">
            Review credentials, specializations, and gallery before booking a session.
          </p>
        </header>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="company-trainer-profile-page__card">
          <CompanyTrainerProfilePanel trainer={trainer} loading={loading} variant="drawer" />
        </div>

        {!loading && trainer && (
          <div className="company-trainer-profile-page__actions">
            {!canBook && (
              <p className="text-xs text-amber-700 mb-2 text-center" role="status">
                This trainer is not accepting new bookings right now.
              </p>
            )}
            <Link
              href={bookHref}
              className={`company-trainer-profile-page__book-btn${!canBook ? ' pointer-events-none opacity-50' : ''}`}
              aria-disabled={!canBook}
              tabIndex={canBook ? 0 : -1}
            >
              <i className="ri-calendar-check-line text-base" aria-hidden="true" />
              Book Session
            </Link>
          </div>
        )}
      </div>
    </Fragment>
  );
};

const CompanyTrainerProfilePage = () => (
  <Suspense
    fallback={
      <div className="company-trainer-profile-page text-center py-16" role="status">
        <div className="spinner-border" style={{ color: '#ed662e' }}>
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    }
  >
    <CompanyTrainerProfilePageInner />
  </Suspense>
);

export default CompanyTrainerProfilePage;
