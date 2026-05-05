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
    const onSync = (ev: Event) => {
      const ce = ev as CustomEvent<TrainerAcceptingBookingsDetail>;
      if (typeof ce.detail?.acceptingBookings === 'boolean') {
        setAcceptingBookings(ce.detail.acceptingBookings);
      }
    };
    window.addEventListener(TRAINER_ACCEPTING_BOOKINGS_EVENT, onSync as EventListener);
    return () => window.removeEventListener(TRAINER_ACCEPTING_BOOKINGS_EVENT, onSync as EventListener);
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

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      // Clear trainer auth tokens
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
      // Still redirect even if logout fails
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
          <div className="main-header-container ps-[0.725rem] pe-[1rem]">
            <div className="header-content-left">
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
            <div className="header-content-right flex flex-wrap items-center gap-2">
              {!availabilityLoading && trainerActive && (
                <div
                  className="header-element py-[1rem] md:px-[0.65rem] px-2 flex items-center gap-2 sm:gap-3 rounded-md border border-defaultborder bg-white/80 dark:bg-bodybg"
                  title={
                    acceptingBookings
                      ? 'Companies can book new sessions with you'
                      : 'Companies cannot create new bookings until you turn this on'
                  }
                >
                  <span
                    id="trainer-header-booking-label"
                    className="hidden md:inline text-[0.8125rem] font-medium text-defaulttextcolor whitespace-nowrap"
                  >
                    New bookings
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      role="switch"
                      checked={acceptingBookings}
                      disabled={availabilitySaving}
                      onChange={(e) => {
                        void handleHeaderAvailabilityToggle(e.target.checked);
                      }}
                      aria-labelledby="trainer-header-booking-label"
                      aria-label="Accept new bookings from companies"
                    />
                  </div>
                  <span
                    className={`text-[0.7rem] font-semibold uppercase tracking-wide hidden sm:inline ${acceptingBookings ? 'text-success' : 'text-warning'}`}
                    aria-live="polite"
                  >
                    {acceptingBookings ? 'Open' : 'Closed'}
                  </span>
                </div>
              )}
              <div className="header-element py-[1rem] md:px-[0.65rem] px-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ti-btn ti-btn ti-btn-primary !bg-primary !text-white !font-medium"
                  title="Logout"
                >
                  <i className="ri-logout-box-line me-1"></i>
                  <span className="hidden sm:inline">Logout</span>
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
