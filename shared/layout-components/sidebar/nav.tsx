import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;

const UserManagementIcon = <i className="bx bx-user side-menu__icon"></i>;

const ClassManagementIcon = <i className="bx bx-book side-menu__icon"></i>;

export const MenuItems: any = [
  {
    menutitle: "MAIN",
  },

  {
    icon: DashboardIcon,
    title: "Dashboard",
    type: "sub",
    active: false,
    selected: false,
    children: [
      {
        path: "/dashboards/analytics",
        type: "link",
        active: false,
        selected: false,
        dirchange: false, 
        title: "Analytics",
      },
    ],
  },

  {
    icon: UserManagementIcon,
    title: "User Management",
    type: "sub",
    active: false,
    selected: false,
    children: [
      {
        path: "/apps/crm/users",
        type: "link",
        active: false,
        selected: false,
        dirchange: false, 
        title: "Users",
      },
      {
        path: "/apps/crm/teachers",
        type: "link",
        active: false,
        selected: false,
        dirchange: false, 
        title: "Teachers",
      },
    ],
  },

  {
    icon: ClassManagementIcon,
    title: "Class Management",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/apps/crm/classes",
  },
];
