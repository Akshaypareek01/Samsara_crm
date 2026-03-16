"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─────────────────────────────────────────────
// HARDCODED DATA — replace with API calls later
// ─────────────────────────────────────────────

const OVERVIEW_STATS = [
    {
        label: 'Total Active Users',
        value: '2,847',
        change: '+12.5%',
        changePositive: true,
        icon: 'ri-user-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Ongoing Sessions',
        value: '342',
        change: '+12.1%',
        changePositive: true,
        icon: 'ri-pulse-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
    },
    {
        label: 'Program Completion Rate',
        value: '87%',
        change: '+5.3%',
        changePositive: true,
        icon: 'ri-checkbox-circle-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
    },
    {
        label: 'Overall Satisfaction',
        value: '4.8',
        change: '+0.2',
        changePositive: true,
        icon: 'ri-star-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
    },
];

const PROGRAM_CARDS = [
    {
        title: 'Yoga Programs',
        subtitle: '18 Active Sessions',
        participants: 456,
        completionRate: 92,
        icon: 'ri-mental-health-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
        href: '/company/wellness-program/yoga',
    },
    {
        title: 'Ayurveda Sessions',
        subtitle: '12 Active Sessions',
        participants: 298,
        completionRate: 85,
        icon: 'ri-heart-pulse-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
        href: '/company/wellness-program/ayurveda',
    },
    {
        title: 'Meditation Classes',
        subtitle: '24 Active Sessions',
        participants: 742,
        completionRate: 89,
        icon: 'ri-map-pin-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        href: '/company/wellness-program/meditation',
    },
    {
        title: 'Workshops',
        subtitle: '8 Active Sessions',
        participants: 186,
        completionRate: 94,
        icon: 'ri-group-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
        href: '/company/wellness-program/workshop',
    },
];

const PROGRAM_DISTRIBUTION = [
    { name: 'Meditation', value: 38, color: '#3B82F6' },
    { name: 'Yoga', value: 28, color: '#10B981' },
    { name: 'Ayurveda', value: 22, color: '#F97316' },
    { name: 'Workshops', value: 12, color: '#EF4444' },
];

const ACTIVE_PARTICIPANTS = [
    { name: 'Yoga Programs', value: 456 },
    { name: 'Meditation', value: 742 },
    { name: 'Ayurveda', value: 298 },
    { name: 'Workshops', value: 186 },
];

const RECENT_ACTIVITY = [
    {
        text: 'New registration for Morning Yoga',
        time: '2 minutes ago',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
        icon: 'ri-user-add-line',
    },
    {
        text: 'Meditation session completed',
        time: '15 minutes ago',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        icon: 'ri-calendar-check-line',
    },
    {
        text: '5-star rating received',
        time: '32 minutes ago',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
        icon: 'ri-star-line',
    },
    {
        text: 'Workshop reminder sent',
        time: '1 hour ago',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
        icon: 'ri-notification-line',
    },
];

// ─────────────────────────────────────────────

const WellnessProgramPage = () => {
    return (
        <Fragment>
            <Seo title={"Wellness Program"} />
            <Pageheader
                currentpage="Wellness Program"
                activepage="Company"
                mainpage="Wellness Program"
            />

            {/* ── Overview Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {OVERVIEW_STATS.map((stat) => (
                    <div key={stat.label} className="box mb-0">
                        <div className="box-body flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[#8c9097] dark:text-white/50 text-[0.8rem] mb-1">{stat.label}</p>
                                <p className="text-[1.75rem] font-bold text-defaulttextcolor mb-1">{stat.value}</p>
                                <p className={`text-[0.75rem] font-medium ${stat.changePositive ? 'text-success' : 'text-danger'}`}>
                                    {stat.changePositive ? '↑' : '↓'} {stat.change}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                                <i className={`${stat.icon} text-[1.25rem] ${stat.iconColor}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Program Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {PROGRAM_CARDS.map((program) => (
                    <Link key={program.title} href={program.href} className="box mb-0 hover:shadow-lg transition-shadow cursor-pointer block">
                        <div className="box-body">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full ${program.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <i className={`${program.icon} text-[1.125rem] ${program.iconColor}`}></i>
                                </div>
                                <div>
                                    <p className="font-semibold text-[0.9375rem] text-defaulttextcolor mb-0">{program.title}</p>
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">{program.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex justify-between text-[0.8125rem] mb-1">
                                <span className="text-[#8c9097]">Participants</span>
                                <span className="font-semibold text-defaulttextcolor">{program.participants}</span>
                            </div>
                            <div className="flex justify-between text-[0.8125rem]">
                                <span className="text-[#8c9097]">Completion Rate</span>
                                <span className="font-semibold text-defaulttextcolor">{program.completionRate}%</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Bottom Row: Chart + Recent Activity ── */}
            <div className="grid grid-cols-12 gap-4">
                {/* Program Distribution Chart */}
                <div className="col-span-12 xl:col-span-7 box mb-0">
                    <div className="box-header justify-between items-center flex-wrap gap-2">
                        <div>
                            <h6 className="box-title font-bold !mb-0">Program Distribution</h6>
                        </div>
                        <div className="text-[0.8125rem] text-[#8c9097]">Active Participants</div>
                    </div>
                    <div className="box-body">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={PROGRAM_DISTRIBUTION}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {PROGRAM_DISTRIBUTION.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Active Participants List */}
                            <div className="flex flex-col gap-3">
                                {ACTIVE_PARTICIPANTS.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[0.8125rem] mb-1">
                                            <span className="text-[#8c9097]">{item.name}</span>
                                            <span className="font-semibold text-defaulttextcolor">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-light rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full"
                                                style={{
                                                    width: `${(item.value / 1682) * 100}%`,
                                                    backgroundColor: PROGRAM_DISTRIBUTION[idx]?.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-12 xl:col-span-5 box mb-0">
                    <div className="box-header justify-between items-center">
                        <h6 className="box-title font-bold !mb-0">Recent Activity</h6>
                    </div>
                    <div className="box-body flex flex-col gap-4">
                        {RECENT_ACTIVITY.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-full ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <i className={`${activity.icon} text-[1rem] ${activity.iconColor}`}></i>
                                </div>
                                <div>
                                    <p className="font-semibold text-[0.875rem] text-defaulttextcolor mb-0">{activity.text}</p>
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="text-orange-500 text-[0.875rem] font-medium mt-2 hover:underline text-center w-full"
                        >
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default WellnessProgramPage;