import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;

const UserManagementIcon = <i className="bx bx-user side-menu__icon"></i>;

const ClassManagementIcon = <i className="bx bx-book side-menu__icon"></i>;

const MembershipIcon = <i className="bx bx-crown side-menu__icon"></i>;

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
    icon: MembershipIcon,
    title: "Membership Management",
    type: "sub",
    active: false,
    selected: false,
    children: [
      {
        path: "/apps/crm/membership-plans",
        type: "link",
        active: false,
        selected: false,
        dirchange: false, 
        title: "Membership Plans",
      },
      {
        path: "/apps/crm/coupons",
        type: "link",
        active: false,
        selected: false,
        dirchange: false, 
        title: "Coupons",
      },
      {
        path: "/apps/crm/transactions",
        type: "link",
        active: false,
        selected: false,
        dirchange: false, 
        title: "Transactions",
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
