"use client";
import React, { Fragment } from 'react';
import TrainerSidebar from './components/TrainerSidebar';
import TrainerHeader from './components/TrainerHeader';
import Footer from '@/shared/layout-components/footer/footer';
import Backtotop from '@/shared/layout-components/backtotop/backtotop';
import { connect } from "react-redux";
import { ThemeChanger } from "@/shared/redux/action";
import Switcher from "@/shared/layout-components/switcher/switcher";
import store from "@/shared/redux/store";
import './components/trainer-dashboard.css';
import './trainer-mobile-fix.css';

const TrainerLayout = ({ children, local_varaiable, ThemeChanger }: any) => {

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
            <Switcher />
            <div className="page trainer-dashboard-shell">
                <TrainerHeader />
                <TrainerSidebar />
                <div className="content">
                    <div className="main-content" onClick={Bodyclickk}>
                        <div className="container-fluid">
                            {children}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
            <Backtotop />
        </Fragment>
    )
}

const mapStateToProps = (state: any) => ({
    local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(TrainerLayout);
