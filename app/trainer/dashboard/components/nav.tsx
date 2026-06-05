import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;
const BookingsIcon = <i className="bx bx-calendar side-menu__icon"></i>;
const MyTrainingIcon = <i className="bx bx-book-open side-menu__icon"></i>;
const ProfileIcon = <i className="bx bx-user side-menu__icon"></i>;

const BASE_MENU_ITEMS: any[] = [
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
        path: "/trainer/dashboard/bookings",
        icon: BookingsIcon,
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Bookings",
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

export const MY_TRAINING_MENU_ITEM = {
    path: "/trainer/dashboard/my-trainings",
    icon: MyTrainingIcon,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    title: "My Training",
};

/**
 * Build trainer sidebar menu items, optionally including My Training for EAP trainers.
 *
 * @param isEapTrainer - When true, inserts My Training between Bookings and Profile.
 */
export function getTrainerMenuItems(isEapTrainer = false): any[] {
    if (!isEapTrainer) {
        return BASE_MENU_ITEMS.map((item) => ({ ...item }));
    }
    const items = BASE_MENU_ITEMS.map((item) => ({ ...item }));
    items.splice(3, 0, { ...MY_TRAINING_MENU_ITEM });
    return items;
}

/** Default menu without My Training (legacy export). */
export const MenuItems: any = getTrainerMenuItems(false);
