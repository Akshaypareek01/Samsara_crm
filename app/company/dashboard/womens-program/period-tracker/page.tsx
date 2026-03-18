"use client";

import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    getPeriodTrackerStats,
    getPeriodTrackerEngagement,
    PERIOD_TRACKER_ENGAGEMENT_LEGEND,
    type StatCard,
    type EngagementDataPoint,
} from '../_data/womens-program.data';

// ─── Sub-components ──────────────────────────────────────────

const StatCardWidget = ({ card }: { card: StatCard }) => (
    <div className="box mb-0">
        <div className="box-body p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs text-muted mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-defaulttextcolor leading-tight">
                        {card.value}
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
                    <i className="bx bx-calendar-check text-base" style={{ color: card.iconColor }}></i>
                </div>
            </div>
        </div>
    </div>
);

// ─── Page Component ──────────────────────────────────────────

const PeriodTrackerPage = () => {
    const [stats, setStats]         = useState<StatCard[]>([]);
    const [chartData, setChartData] = useState<EngagementDataPoint[]>([]);
    const [timeFilter, setTimeFilter] = useState('Last 7 days');

    useEffect(() => {
        // When APIs are ready, these switch to real data automatically
        getPeriodTrackerStats().then(setStats);
        getPeriodTrackerEngagement().then(setChartData);
    }, []);

    return (
        <Fragment>
            <Seo title="Period Tracker" />
            <Pageheader currentpage="Period Tracker" activepage="Women's Program" mainpage="Period Tracker" />

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {stats.map((card, i) => (
                    <StatCardWidget key={i} card={card} />
                ))}
            </div>

            {/* ── Engagement Chart ── */}
            <div className="box mb-0">
                <div className="box-header justify-between items-center">
                    <h6 className="box-title font-bold !mb-0">User Engagement &amp; App Usage</h6>
                    {/* TODO: wire timeFilter to API query param when available */}
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="form-select text-sm w-auto"
                    >
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                    </select>
                </div>
                <div className="box-body">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip />
                            <Legend
                                iconSize={10}
                                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                                formatter={(value) => {
                                    const found = PERIOD_TRACKER_ENGAGEMENT_LEGEND.find((l) => l.label === value);
                                    return found ? found.label : value;
                                }}
                            />
                            {PERIOD_TRACKER_ENGAGEMENT_LEGEND.map((legend) => (
                                <Bar
                                    key={legend.key}
                                    dataKey={legend.key}
                                    name={legend.label}
                                    fill={legend.color}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Fragment>
    );
};

export default PeriodTrackerPage;