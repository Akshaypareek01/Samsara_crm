
import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;
const TrainersIcon = <i className="bx bx-user side-menu__icon"></i>;
const BookingsIcon = <i className="bx bx-calendar side-menu__icon"></i>;
const SettingsIcon = <i className="bx bx-cog side-menu__icon"></i>;
const SpeechIcon = <i className="bx bx-microphone side-menu__icon"></i>;
const CompanyProfileIcon = <i className="bx bx-id-card side-menu__icon"></i>;
const WellnessIcon = <i className="bx bx-heart side-menu__icon"></i>;
const YogaIcon = <i className="bx bx-body side-menu__icon"></i>;
const AyurvedaIcon = <i className="bx bx-leaf side-menu__icon"></i>;
const MeditationIcon = <i className="bx bx-moon side-menu__icon"></i>;
const WorkshopIcon = <i className="bx bx-chalkboard side-menu__icon"></i>;

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
        icon: CompanyProfileIcon,
        title: "Company Profile",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        path: "/company/dashboard/profile",
        permission: "companyProfile",
    },


    {
        icon: WellnessIcon,
        title: "Wellness Program",
        type: "sub",
        active: false,
        selected: false,
        dirchange: false,
        path: "/company/dashboard/wellness-program",
        children: [
            {
                path: "/company/dashboard/wellness-program/yoga",
                icon: YogaIcon,
                type: "link",
                active: false,
                selected: false,
                dirchange: false,
                title: "Yoga",
            },
            {
                path: "/company/dashboard/wellness-program/ayurveda",
                icon: AyurvedaIcon,
                type: "link",
                active: false,
                selected: false,
                dirchange: false,
                title: "Ayurveda",
            },
            {
                path: "/company/dashboard/wellness-program/meditation",
                icon: MeditationIcon,
                type: "link",
                active: false,
                selected: false,
                dirchange: false,
                title: "Meditation",
            },
            {
                path: "/company/dashboard/wellness-program/workshop",
                icon: WorkshopIcon,
                type: "link",
                active: false,
                selected: false,
                dirchange: false,
                title: "Workshop",
            },
        ],
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
