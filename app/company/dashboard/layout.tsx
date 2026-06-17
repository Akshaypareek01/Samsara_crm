"use client";
import React, { Fragment, useEffect } from 'react';
import CompanySidebar from './components/CompanySidebar';
import CompanyDashboardHeader from './components/CompanyDashboardHeader';
import '@/shared/styles/portal-brand.css';
import './components/company-dashboard.css';
import './company-mobile-fix.css';
import Footer from '@/shared/layout-components/footer/footer';
import Backtotop from '@/shared/layout-components/backtotop/backtotop';
import { connect } from "react-redux";
import { ThemeChanger } from "@/shared/redux/action";

import Switcher from "@/shared/layout-components/switcher/switcher";
import store from "@/shared/redux/store";
import CompanyDashboardAuthGate from "./components/CompanyDashboardAuthGate";
import { CompanyRatingProvider } from "./context/CompanyRatingContext";
import { applyLightModeToDocument } from "@/shared/utils/forceLightMode";

const CompanyLayout = ({ children, local_varaiable, ThemeChanger }: any) => {

    useEffect(() => {
        applyLightModeToDocument();
        document.documentElement.removeAttribute("data-icon-overlay");
        document.querySelectorAll("#responsive-overlay").forEach((el) => {
            el.classList.remove("active");
        });
    }, []);

    const Bodyclickk = () => {
        const theme = store.getState();
        if (localStorage.getItem("ynexverticalstyles") == "icontext") {
            // setMyClass(""); // state not used in simplified layout but kept for consistency if needed
        }
        if (window.innerWidth > 992) {
            if (theme.iconOverlay === 'open') {
                ThemeChanger({ ...theme, iconOverlay: "" });
            }
        }
    }

    return (
        <Fragment>
            <CompanyRatingProvider>
                <Switcher />
                <div className="page company-dashboard-shell">
                    <CompanyDashboardHeader />
                    <CompanySidebar />
                    <div className="content">
                        <div className="main-content" onClick={Bodyclickk}>
                            <div className="container-fluid">
                                <CompanyDashboardAuthGate>
                                    {children}
                                </CompanyDashboardAuthGate>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
                <Backtotop />
            </CompanyRatingProvider>
        </Fragment>
    )
}

const mapStateToProps = (state: any) => ({
    local_varaiable: state
});

const ConnectedCompanyLayout = connect(mapStateToProps, { ThemeChanger })(CompanyLayout);

/**
 * Next.js App Router layout wrapper — connect() HOC cannot be the default export.
 */
export default function CompanyDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ConnectedCompanyLayout>{children}</ConnectedCompanyLayout>;
}
