import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;

const UserManagementIcon = <i className="bx bx-user side-menu__icon"></i>;

const ClassManagementIcon = <i className="bx bx-book side-menu__icon"></i>;

const MembershipIcon = <i className="bx bx-crown side-menu__icon"></i>;

const CompanyIcon = <i className="bx bx-building side-menu__icon"></i>;

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
    permission: "dashboard",
    children: [
      {
        path: "/dashboards/analytics",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Analytics",
        permission: "dashboard",
      },
    ],
  },

  {
    icon: UserManagementIcon,
    title: "User Management",
    type: "sub",
    active: false,
    selected: false,
    permission: "userManagement",
    children: [
      {
        path: "/apps/crm/users",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Users",
        permission: "userManagement.users",
      },
      {
        path: "/apps/crm/teachers",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Teachers",
        permission: "userManagement.teachers",
      },
      {
        path: "/apps/crm/trainers",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Trainers",
        permission: "userManagement.trainers",
      },
    ],
  },

  {
    icon: CompanyIcon,
    title: "Company Management",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/apps/crm/companies",
    permission: "companyManagement",
  },

  {
    icon: <i className="bx bx-calendar-check side-menu__icon"></i>,
    title: "Bookings Management",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/apps/crm/bookings",
    permission: "bookingManagement",
  },

  {
    icon: <i className="bx bx-wallet side-menu__icon"></i>,
    title: "Account Details",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/apps/crm/account-details",
    permission: "companyManagement",
  },

  {
    icon: MembershipIcon,
    title: "Membership Management",
    type: "sub",
    active: false,
    selected: false,
    permission: "membershipManagement",
    children: [
      {
        path: "/apps/crm/membership-plans",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Membership Plans",
        permission: "membershipManagement",
      },
      {
        path: "/apps/crm/add-membership",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Add Membership",
        permission: "membershipManagement",
      },
      {
        path: "/apps/crm/coupons",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Coupons",
        permission: "membershipManagement",
      },
      {
        path: "/apps/crm/transactions",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Transactions",
        permission: "membershipManagement",
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
    permission: "classManagement",
  },

  {
    menutitle: "TEAM MANAGEMENT",
    permission: "teamManagement",
  },

  {
    icon: <i className="bx bx-shield-quarter side-menu__icon"></i>,
    title: "Role Management",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/apps/crm/roles",
    permission: "roleManagement",
  },

  {
    icon: <i className="bx bx-group side-menu__icon"></i>,
    title: "Team Members",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/apps/crm/team",
    permission: "teamManagement",
  },
];
