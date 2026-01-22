
import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;
const TrainersIcon = <i className="bx bx-user side-menu__icon"></i>;
const BookingsIcon = <i className="bx bx-calendar side-menu__icon"></i>;
const SettingsIcon = <i className="bx bx-cog side-menu__icon"></i>;
const SpeechIcon = <i className="bx bx-microphone side-menu__icon"></i>;

export const MenuItems: any = [
    {
        menutitle: "MAIN",
    },
    {
        path: "/company/dashboard",
        icon: DashboardIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Dashboard",
    },
    {
        path: "/company/dashboard/trainers",
        icon: TrainersIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Trainers",
    },
    {
        path: "/company/dashboard/bookings",
        icon: BookingsIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Bookings",
    },
    {
        path: "/company/dashboard/settings",
        icon: SettingsIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Settings",
    },
];
