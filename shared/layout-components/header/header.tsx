"use client"
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react';
import { ThemeChanger } from "../../redux/action";
import { connect } from 'react-redux';
import store from '@/shared/redux/store';
import { basePath } from '@/Config/basePath';
import { useRouter } from 'next/navigation';
import AdminService from '@/services/adminService';
import ApiService from '@/services/ApiService';

type AccountType = 'trainer' | 'company' | 'admin';

interface HeaderIdentity {
  type: AccountType;
  displayName: string;
  roleLabel: string;
  avatarUrl: string;
  loginPath: string;
}

/**
 * Derives the first uppercase character to use as an avatar fallback.
 * @param name - The display name of the logged-in account.
 * @returns A single uppercase initial, or 'U' when unavailable.
 */
const getInitial = (name: string): string =>
  name?.trim()?.charAt(0)?.toUpperCase() || 'U';

const Header = ({ local_varaiable, ThemeChanger }: any) => {
  const router = useRouter();

  // ── Logged-in identity (company logo / trainer profile / admin) ──
  const [identity, setIdentity] = useState<HeaderIdentity>({
    type: 'admin',
    displayName: 'Admin',
    roleLabel: 'Administrator',
    avatarUrl: '',
    loginPath: '/',
  });

  useEffect(() => {
    let cancelled = false;

    const loadIdentity = async () => {
      try {
        const user = await ApiService.getUser();
        const userType =
          typeof window !== 'undefined' ? localStorage.getItem('userType') : null;

        let next: HeaderIdentity;

        if (userType === 'trainer') {
          next = {
            type: 'trainer',
            displayName: user?.name || 'Trainer',
            roleLabel: 'Trainer',
            avatarUrl: user?.profilePhoto?.path || '',
            loginPath: '/trainer/login',
          };
        } else if (user?.companyName || user?.companyLogo || user?.companyId) {
          next = {
            type: 'company',
            displayName: user?.companyName || 'Company',
            roleLabel: 'Company',
            avatarUrl: user?.companyLogo || '',
            loginPath: '/company/login',
          };
        } else {
          next = {
            type: 'admin',
            displayName: user?.name || 'Admin',
            roleLabel: 'Administrator',
            avatarUrl: '',
            loginPath: '/',
          };
        }

        if (!cancelled) setIdentity(next);
      } catch (error) {
        console.error('Header: failed to load identity', error);
      }
    };

    void loadIdentity();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const redirectTo = identity.loginPath;
    try {
      await AdminService.logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('Auth');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
      }
      router.push(redirectTo);
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      router.push(redirectTo);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const windowObject = window;
      if (windowObject.innerWidth <= 991) {
      } else {
      }
    };
    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  function menuClose() {
    const theme = store.getState();
    if (window.innerWidth <= 992) {
      ThemeChanger({ ...theme, dataToggled: "close" });
    }
    if (window.innerWidth >= 992) {
      ThemeChanger({ ...theme, dataToggled: local_varaiable.dataToggled ? local_varaiable.dataToggled : '' });
    }
  }

  const toggleSidebar = () => {
    const theme = store.getState();
    let sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        let verticalStyle = theme.dataVerticalStyle;
        const navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          // closed
          case "closed":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "close-menu-close") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "close-menu-close" });
            }
            break;
          // icon-overlay
          case "overlay":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "icon-overlay-close") {
              ThemeChanger({ ...theme, "dataToggled": "", "iconOverlay": '' });
            } else {
              if (window.innerWidth >= 992) {
                ThemeChanger({ ...theme, "dataToggled": "icon-overlay-close", "iconOverlay": '' });
              }
            }
            break;
          // icon-text
          case "icontext":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "icon-text-close") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "icon-text-close" });
            }
            break;
          // doublemenu
          case "doublemenu":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "double-menu-open") {
              ThemeChanger({ ...theme, "dataToggled": "double-menu-close" });
            } else {
              let sidemenu = document.querySelector(".side-menu__item.active");
              if (sidemenu) {
                ThemeChanger({ ...theme, "dataToggled": "double-menu-open" });
                if (sidemenu.nextElementSibling) {
                  sidemenu.nextElementSibling.classList.add("double-menu-active");
                } else {

                  ThemeChanger({ ...theme, "dataToggled": "double-menu-close" });
                }
              }
            }
            break;
          // detached
          case "detached":
            if (theme.dataToggled === "detached-close") {
              ThemeChanger({ ...theme, "dataToggled": "", "iconOverlay": '' });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "detached-close", "iconOverlay": '' });
            }

            break;

          // default
          case "default":
            ThemeChanger({ ...theme, "dataToggled": "" });
        }
        switch (navStyle) {
          case "menu-click":
            if (theme.dataToggled === "menu-click-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            }
            else {
              ThemeChanger({ ...theme, "dataToggled": "menu-click-closed" });
            }
            break;
          // icon-overlay
          case "menu-hover":
            if (theme.dataToggled === "menu-hover-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "menu-hover-closed" });

            }
            break;
          case "icon-click":
            if (theme.dataToggled === "icon-click-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "icon-click-closed" });

            }
            break;
          case "icon-hover":
            if (theme.dataToggled === "icon-hover-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "icon-hover-closed" });

            }
            break;

        }
      }
    }
    else {
      if (theme.dataToggled === "close") {
        ThemeChanger({ ...theme, "dataToggled": "open" });

        setTimeout(() => {
          if (theme.dataToggled == "open") {
            const overlay = document.querySelector("#responsive-overlay");

            if (overlay) {
              overlay.classList.add("active");
              overlay.addEventListener("click", () => {
                const overlay = document.querySelector("#responsive-overlay");

                if (overlay) {
                  overlay.classList.remove("active");
                  menuClose();
                }
              });
            }
          }

          window.addEventListener("resize", () => {
            if (window.screen.width >= 992) {
              const overlay = document.querySelector("#responsive-overlay");

              if (overlay) {
                overlay.classList.remove("active");
              }
            }
          });
        }, 100);
      } else {
        ThemeChanger({ ...theme, "dataToggled": "close" });
      }
    }



  };

  useEffect(() => {
    const navbar = document?.querySelector(".header");
    const navbar1 = document?.querySelector(".app-sidebar");
    const sticky: any = navbar?.clientHeight;
    // const sticky1 = navbar1.clientHeight;

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

    // Cleanup event listeners when the component unmounts
    return () => {
      window.removeEventListener("scroll", stickyFn);
      window.removeEventListener("DOMContentLoaded", stickyFn);
    };
  }, []);

  return (
    <Fragment>
      <div className="app-header">
        <nav className="main-header !h-[3.75rem]" aria-label="Global">
          <div className="main-header-container ps-[0.725rem] pe-[1rem] ">

            <div className="header-content-left">
              <div className="header-element">
                <div className="horizontal-logo">
                  <Link href="/dashboards/crm/" className="header-logo">
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/desktop-logo.png`} alt="logo" className="desktop-logo" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/toggle-logo.png`} alt="logo" className="toggle-logo" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/desktop-dark.png`} alt="logo" className="desktop-dark" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/toggle-dark.png`} alt="logo" className="toggle-dark" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/desktop-white.png`} alt="logo" className="desktop-white" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/toggle-white.png`} alt="logo" className="toggle-white" />
                  </Link>
                </div>
              </div>
              <div className="header-element md:px-[0.325rem] !items-center" onClick={() => toggleSidebar()}>
                <Link aria-label="Hide Sidebar"
                  className="sidemenu-toggle animated-arrow  hor-toggle horizontal-navtoggle inline-flex items-center" href="#!" scroll={false}><span></span></Link>
              </div>
            </div>
            <div className="header-content-right flex items-center gap-3">

              <div className="header-element !items-center flex" aria-label={`${identity.roleLabel} account`}>
                {identity.avatarUrl ? (
                  <img
                    className="inline-block rounded-full border border-defaultborder object-cover"
                    src={identity.avatarUrl}
                    width="36"
                    height="36"
                    alt={identity.displayName}
                  />
                ) : (
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm"
                    aria-hidden="true"
                  >
                    {getInitial(identity.displayName)}
                  </span>
                )}
                <div className="ms-2 md:block hidden leading-tight">
                  <p className="font-semibold mb-0 text-defaulttextcolor text-[0.85rem]">
                    {identity.displayName}
                  </p>
                  <p className="mb-0 text-[#536485] text-[0.7rem]">{identity.roleLabel}</p>
                </div>
              </div>

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
  )
}

const mapStateToProps = (state: any) => ({
  local_varaiable: state
});
export default connect(mapStateToProps, { ThemeChanger })(Header);
