"use client";

import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
    getWomensProgramStats,
    getWomensProgramCards,
    getPatientDistribution,
    getRecentActivities,
    type StatCard,
    type ProgramCard,
    type PatientDistributionItem,
    type RecentActivity,
} from './_data/womens-program.data';

// ─── Sub-components ──────────────────────────────────────────

const StatCardWidget = ({ card }: { card: StatCard }) => (
    <div className="box mb-0">
        <div className="box-body p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs text-muted mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-defaulttextcolor leading-tight">
                        {card.value}
                        {card.unit && (
                            <span className="text-sm font-normal text-muted ml-1">{card.unit}</span>
                        )}
                    </p>
                    {card.change && (
                        <p className={`text-xs font-semibold mt-1 ${card.changePositive ? 'text-success' : 'text-danger'}`}>
                            {card.changePositive ? '↑' : '↓'} {card.change}
                        </p>
                    )}
                </div>
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.iconBg }}
                >
                    <i className="bx bx-user text-base" style={{ color: card.iconColor }}></i>
                </div>
            </div>
        </div>
    </div>
);

const ProgressBar = ({
    label, value, color,
}: {
    label: string; value: number; color: string;
}) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs text-muted mb-1">
            <span>{label}</span>
            <span className="font-semibold text-defaulttextcolor">{value}%</span>
        </div>
        <div className="w-full bg-light rounded-full h-1.5">
            <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${value}%`, backgroundColor: color }}
            />
        </div>
    </div>
);

// ─── Page Component ──────────────────────────────────────────

const WomensProgramPage = () => {
    const router = useRouter();
    const [stats, setStats]           = useState<StatCard[]>([]);
    const [cards, setCards]           = useState<ProgramCard[]>([]);
    const [distribution, setDist]     = useState<PatientDistributionItem[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);

    useEffect(() => {
        // When APIs are ready, these calls automatically switch to real data
        getWomensProgramStats().then(setStats);
        getWomensProgramCards().then(setCards);
        getPatientDistribution().then(setDist);
        getRecentActivities().then(setActivities);
    }, []);

    return (
        <Fragment>
            <Seo title="Women's Program" />
            <Pageheader currentpage="Women's Program" activepage="Dashboard" mainpage="Women's Program" />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {stats.map((card, i) => (
                    <StatCardWidget key={i} card={card} />
                ))}
            </div>

            {/* ── Program Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="box mb-0 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(card.href)}
                    >
                        <div className="box-body p-4">
                            <div className="flex items-start gap-3 mb-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: card.iconBg }}
                                >
                                    <i className="bx bx-heart text-base" style={{ color: card.iconColor }}></i>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-defaulttextcolor leading-tight">{card.title}</p>
                                    <p className="text-xs text-muted">{card.activePatients} Active Patients</p>
                                </div>
                            </div>
                            <ProgressBar label="Treatment Progress" value={card.treatmentProgress} color={card.progressColor} />
                            <ProgressBar label={card.successRateLabel} value={card.successRate} color={card.progressColor} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Bottom Row: Distribution + Activities ── */}
            <div className="grid grid-cols-12 gap-4">
                {/* Patient Distribution Donut */}
                <div className="xl:col-span-7 col-span-12 box mb-0">
                    <div className="box-header">
                        <h6 className="box-title font-bold !mb-0">Patient Distribution</h6>
                        <span className="text-xs text-muted">Active Participants</span>
                    </div>
                    <div className="box-body">
                        <div className="flex items-center gap-6">
                            {/* Legend */}
                            <div className="flex flex-col gap-2 min-w-[120px]">
                                {distribution.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-xs text-muted">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Donut */}
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={95}
                                            dataKey="value"
                                            nameKey="label"
                                            paddingAngle={2}
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [`${value}%`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="xl:col-span-5 col-span-12 box mb-0">
                    <div className="box-header justify-between">
                        <h6 className="box-title font-bold !mb-0">Recent Activities</h6>
                    </div>
                    <div className="box-body flex flex-col gap-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: activity.iconBg }}
                                >
                                    <i className="bx bx-bell text-xs" style={{ color: activity.iconColor }}></i>
                                </div>
                                <div>
                                    <p className="text-sm text-defaulttextcolor font-medium leading-tight">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">{activity.timeAgo}</p>
                                </div>
                            </div>
                        ))}
                        <button className="text-xs text-warning font-semibold hover:underline mt-1 text-left">
                            View All Activities
                        </button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default WomensProgramPage;