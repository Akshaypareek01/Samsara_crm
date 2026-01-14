import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;
const ProfileIcon = <i className="bx bx-user side-menu__icon"></i>;

export const MenuItems: any = [
    {
        menutitle: "MAIN",
    },
    {
        path: "/trainer/dashboard",
        icon: DashboardIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Dashboard",
    },
    {
        path: "/trainer/dashboard/profile",
        icon: ProfileIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Profile",
    },
];
