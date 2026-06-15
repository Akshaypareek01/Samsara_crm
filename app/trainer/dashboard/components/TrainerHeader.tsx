"use client";
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ThemeChanger } from "@/shared/redux/action";
import ApiService from '@/services/ApiService';
import TrainerService from '@/services/trainerService';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import {
  TRAINER_ACCEPTING_BOOKINGS_EVENT,
  broadcastTrainerAcceptingBookings,
  type TrainerAcceptingBookingsDetail,
} from '@/utils/trainerAvailabilitySync';
import { toggleTrainerSidebar } from '../utils/toggleTrainerSidebar';

type TrainerHeaderProps = {
  local_varaiable?: unknown;
};

/**
 * Trainer dashboard top bar: menu toggle, booking availability, logout.
 */
const TrainerHeader: React.FC<TrainerHeaderProps> = () => {
  const router = useRouter();
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  const [trainerActive, setTrainerActive] = useState(true);

  const loadAvailability = useCallback(async () => {
    try {
      const t = await TrainerService.getMyProfile();
      setTrainerActive(t.status !== false);
      setAcceptingBookings(t.acceptingBookings !== false);
    } catch (err) {
      console.error('Trainer header: could not load booking availability', err);
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    const onBookingSync = (ev: Event) => {
      const ce = ev as CustomEvent<TrainerAcceptingBookingsDetail>;
      if (typeof ce.detail?.acceptingBookings === 'boolean') {
        setAcceptingBookings(ce.detail.acceptingBookings);
      }
    };
    window.addEventListener(TRAINER_ACCEPTING_BOOKINGS_EVENT, onBookingSync as EventListener);
    return () => {
      window.removeEventListener(TRAINER_ACCEPTING_BOOKINGS_EVENT, onBookingSync as EventListener);
    };
  }, []);

  /**
   * Persists booking availability and syncs profile page.
   * @param next - Target availability flag.
   */
  const handleHeaderAvailabilityToggle = async (next: boolean) => {
    if (!trainerActive || availabilitySaving) return;
    try {
      setAvailabilitySaving(true);
      await TrainerService.updateMyProfile({ acceptingBookings: next });
      setAcceptingBookings(next);
      broadcastTrainerAcceptingBookings(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not update booking availability';
      void Swal.fire({ icon: 'error', title: 'Update failed', text: msg });
    } finally {
      setAvailabilitySaving(false);
    }
  };

  /**
   * Signs the trainer out after confirmation.
   */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Log out?',
      text: 'Are you sure you want to log out of your trainer account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ed662e',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await ApiService.removeAuthToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('Auth');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
      }
      router.push('/trainer/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/trainer/login');
    }
  };

  return (
    <Fragment>
      <header className="trainer-dashboard-header app-header" role="banner">
        <div className="trainer-dashboard-header-inner">
          <button
            type="button"
            className="trainer-dashboard-header-menu"
            onClick={() => toggleTrainerSidebar()}
            aria-label="Toggle navigation menu"
          >
            <i className="ri-menu-2-line text-xl" aria-hidden="true"></i>
          </button>

          <div className="trainer-dashboard-header-spacer" aria-hidden="true" />

          <div className="trainer-dashboard-header-actions">
            {!availabilityLoading && trainerActive && (
              <div
                className="trainer-dashboard-header-availability"
                title={
                  acceptingBookings
                    ? 'You are online — companies can book new sessions'
                    : 'You are offline — new bookings are paused'
                }
              >
                <span
                  id="trainer-header-booking-label"
                  className="trainer-dashboard-header-availability-label hidden sm:inline"
                >
                  New bookings
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={acceptingBookings}
                  aria-labelledby="trainer-header-booking-label trainer-header-status-label"
                  disabled={availabilitySaving}
                  onClick={() => {
                    void handleHeaderAvailabilityToggle(!acceptingBookings);
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e] disabled:cursor-not-allowed disabled:opacity-60 ${acceptingBookings ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${acceptingBookings ? 'translate-x-5' : 'translate-x-0'}`}
                    aria-hidden="true"
                  />
                </button>
                <span
                  id="trainer-header-status-label"
                  className={`text-[0.7rem] font-semibold uppercase tracking-wide whitespace-nowrap ${acceptingBookings ? 'text-emerald-600' : 'text-amber-600'}`}
                  aria-live="polite"
                >
                  {acceptingBookings ? 'Online' : 'Offline'}
                </span>
              </div>
            )}

            <button
              type="button"
              className="trainer-dashboard-header-logout"
              onClick={() => void handleLogout()}
              aria-label="Log out"
            >
              <i className="ri-logout-box-r-line text-base" aria-hidden="true"></i>
              <span className="trainer-dashboard-header-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

const mapStateToProps = (state: unknown) => ({
  local_varaiable: state,
});

export default connect(mapStateToProps, { ThemeChanger })(TrainerHeader);
