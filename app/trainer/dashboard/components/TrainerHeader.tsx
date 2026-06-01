"use client";
import Link from 'next/link';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { ThemeChanger } from "@/shared/redux/action";
import { connect } from 'react-redux';
import store from '@/shared/redux/store';
import { basePath } from '@/Config/basePath';
import { useRouter } from 'next/navigation';
import ApiService from '@/services/ApiService';
import TrainerService from '@/services/trainerService';
import Swal from 'sweetalert2';
import {
  TRAINER_ACCEPTING_BOOKINGS_EVENT,
  broadcastTrainerAcceptingBookings,
  type TrainerAcceptingBookingsDetail,
} from '@/utils/trainerAvailabilitySync';

const TrainerHeader = ({ local_varaiable, ThemeChanger }: any) => {
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
   * Persists “open for new bookings” and keeps profile page in sync via broadcast.
   *
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
   *
   * @param e - Click event from the logout control.
   */
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Log out?',
      text: 'Are you sure you want to log out of your trainer account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
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

  function menuClose() {
    const theme = store.getState();
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      ThemeChanger({ ...theme, dataToggled: "close" });
    }
    const overlayElement = document.querySelector("#responsive-overlay") as HTMLElement | null;
    if (overlayElement) {
      overlayElement.classList.remove("active");
    }
  }

  const toggleSidebar = () => {
    const theme = store.getState();
    if (window.innerWidth <= 992) {
      if (theme.dataToggled === "close") {
        ThemeChanger({ ...theme, dataToggled: "open" });
        setTimeout(() => {
          const overlay = document.querySelector("#responsive-overlay");
          if (overlay) {
            overlay.classList.add("active");
            overlay.addEventListener("click", () => {
              menuClose();
            });
          }
        }, 100);
      } else {
        ThemeChanger({ ...theme, dataToggled: "close" });
        menuClose();
      }
    }
  };

  useEffect(() => {
    const navbar = document?.querySelector(".header");
    const navbar1 = document?.querySelector(".app-sidebar");
    const sticky: any = navbar?.clientHeight;

    function stickyFn() {
      if (window.pageYOffset >= sticky) {
        navbar?.classList.add("sticky-pin");
        navbar1?.classList.add("sticky-pin");
      } else {
        navbar?.classList.remove("sticky-pin");
        navbar1?.classList.remove("sticky-pin");
      }
    }

    window.addEventListener("scroll", stickyFn);
    window.addEventListener("DOMContentLoaded", stickyFn);

    return () => {
      window.removeEventListener("scroll", stickyFn);
      window.removeEventListener("DOMContentLoaded", stickyFn);
    };
  }, []);

  return (
    <Fragment>
      <div className="app-header">
        <nav className="main-header !h-[3.75rem]" aria-label="Global">
          <div className="main-header-container ps-[0.725rem] pe-[1rem] flex items-center justify-between gap-2">
            <div className="header-content-left flex items-center flex-shrink-0">
              <div className="header-element">
                <div className="horizontal-logo">
                  <Link href="/trainer/dashboard" className="header-logo">
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/logosm.png`} alt="logo" className="desktop-logo" style={{ height: '40px', width: 'auto' }} />
                  </Link>
                </div>
              </div>
              <div className="header-element md:px-[0.325rem] !items-center" onClick={() => toggleSidebar()}>
                <Link
                  aria-label="Toggle Sidebar"
                  className="sidemenu-toggle animated-arrow hor-toggle horizontal-navtoggle inline-flex items-center"
                  href="#!"
                  scroll={false}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSidebar();
                  }}
                >
                  <span></span>
                </Link>
              </div>
            </div>

            <div className="flex-1" aria-hidden="true" />

            <div className="header-content-right flex items-center justify-end gap-3 flex-shrink-0 ms-auto">
              {!availabilityLoading && trainerActive && (
                <div
                  className="header-element !flex !items-center gap-2.5 px-3 py-1.5 rounded-md border border-defaultborder bg-white dark:bg-bodybg"
                  title={
                    acceptingBookings
                      ? 'You are online — companies can book new sessions with you'
                      : 'You are offline — companies cannot create new bookings until you go online'
                  }
                >
                  <span
                    id="trainer-header-booking-label"
                    className="text-[0.8125rem] font-medium text-defaulttextcolor whitespace-nowrap leading-none"
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
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 ${acceptingBookings ? 'bg-success' : 'bg-gray-300 dark:bg-white/20'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${acceptingBookings ? 'translate-x-5' : 'translate-x-0'}`}
                      aria-hidden="true"
                    />
                  </button>
                  <span
                    id="trainer-header-status-label"
                    className={`text-[0.7rem] font-semibold uppercase tracking-wide whitespace-nowrap ${acceptingBookings ? 'text-success' : 'text-warning'}`}
                    aria-live="polite"
                  >
                    {acceptingBookings ? 'Online' : 'Offline'}
                  </span>
                </div>
              )}
              <div className="header-element !flex !items-center">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ti-btn !bg-danger !text-white inline-flex items-center justify-center !p-0 !w-9 !h-9 !rounded-md !leading-none !shadow-none !m-0"
                  title="Logout"
                  aria-label="Logout"
                >
                  <i className="ri-logout-box-line text-[1.05rem]"></i>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(TrainerHeader);
