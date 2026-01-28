"use client";
import Link from 'next/link';
import React, { Fragment, useEffect } from 'react';
import { ThemeChanger } from "@/shared/redux/action";
import { connect } from 'react-redux';
import store from '@/shared/redux/store';
import { basePath } from '@/Config/basePath';
import { useRouter } from 'next/navigation';
import ApiService from '@/services/ApiService';

const TrainerHeader = ({ local_varaiable, ThemeChanger }: any) => {
  const router = useRouter();

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
            <div className="header-content-right">
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
