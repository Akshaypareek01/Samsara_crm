"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getCompanyInsightsBundle, COMPANY_DATA_BUST_EVENT } from '@/services/companyInsightsClient';
import {
    mapWellnessLandingFromInsights,
    maxParticipantValue,
    isHexColor,
    type WellnessOverviewStat,
    type WellnessProgramCard,
    type NamedSlice,
    type RecentActivityItem,
} from './wellnessLandingFromInsights';

// ── Fallbacks when insights are unavailable (offline / error) ──
const FALLBACK_OVERVIEW: WellnessOverviewStat[] = [
    {
        label: 'Total Active Users',
        value: '0',
        change: 'Sign in and load data',
        changePositive: true,
        icon: 'ri-user-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        label: 'Ongoing Sessions',
        value: '0',
        change: '—',
        changePositive: true,
        icon: 'ri-pulse-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
    },
    {
        label: 'Program Completion Rate',
        value: '0%',
        change: '—',
        changePositive: true,
        icon: 'ri-checkbox-circle-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
    },
    {
        label: 'Overall Satisfaction',
        value: '—',
        change: '—',
        changePositive: true,
        icon: 'ri-star-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
    },
];

const FALLBACK_CARDS: WellnessProgramCard[] = [
    {
        title: 'Yoga Programs',
        subtitle: '0 bookings',
        participants: 0,
        completionRate: 0,
        icon: 'ri-mental-health-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
        href: '/company/dashboard/wellness-program/yoga',
    },
    {
        title: 'Ayurveda Sessions',
        subtitle: '0 bookings',
        participants: 0,
        completionRate: 0,
        icon: 'ri-heart-pulse-line',
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
        href: '/company/dashboard/wellness-program/ayurveda',
    },
    {
        title: 'Meditation Classes',
        subtitle: '0 bookings',
        participants: 0,
        completionRate: 0,
        icon: 'ri-map-pin-line',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        href: '/company/dashboard/wellness-program/meditation',
    },
    {
        title: 'Workshops',
        subtitle: '0 bookings',
        participants: 0,
        completionRate: 0,
        icon: 'ri-group-line',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
        href: '/company/dashboard/wellness-program/workshop',
    },
];

const FALLBACK_DIST: NamedSlice[] = [
    { name: 'Meditation', value: 25, color: '#3B82F6' },
    { name: 'Yoga', value: 25, color: '#10B981' },
    { name: 'Ayurveda', value: 25, color: '#F97316' },
    { name: 'Workshops', value: 25, color: '#EF4444' },
];

/**
 * Company wellness hub: stats, program links, distribution, and recent activity from GET /companies/insights.
 */
const WellnessProgramPage = () => {
    const [overviewStats, setOverviewStats] = useState<WellnessOverviewStat[]>(FALLBACK_OVERVIEW);
    const [programCards, setProgramCards] = useState<WellnessProgramCard[]>(FALLBACK_CARDS);
    const [programDistribution, setProgramDistribution] = useState<NamedSlice[]>(FALLBACK_DIST);
    const [activeParticipants, setActiveParticipants] = useState<{ name: string; value: number }[]>(
        FALLBACK_CARDS.map((c) => ({ name: c.title, value: 0 }))
    );
    const [barMax, setBarMax] = useState(1);
    const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
    const [fetchComplete, setFetchComplete] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const apply = (bundle: Record<string, unknown> | null) => {
            if (!bundle) return;
            const hasWellness = Boolean((bundle as { wellness?: unknown }).wellness);
            if (!hasWellness) return;
            const m = mapWellnessLandingFromInsights(bundle);
            if (m.overviewStats.length) setOverviewStats(m.overviewStats);
            setProgramCards(m.programCards);
            setProgramDistribution(m.programDistribution.length ? m.programDistribution : FALLBACK_DIST);
            setActiveParticipants(m.activeParticipants);
            setBarMax(maxParticipantValue(m.activeParticipants));
            setRecentActivity(m.recentActivity);
        };

        const load = async () => {
            try {
                const bundle = await getCompanyInsightsBundle();
                if (cancelled) return;
                apply(bundle as Record<string, unknown> | null);
            } catch (err) {
                console.error('Wellness landing insights:', err);
            } finally {
                if (!cancelled) setFetchComplete(true);
            }
        };

        void load();
        const onBust = () => {
            void load();
        };
        if (typeof window !== 'undefined') {
            window.addEventListener(COMPANY_DATA_BUST_EVENT, onBust);
        }
        return () => {
            cancelled = true;
            if (typeof window !== 'undefined') {
                window.removeEventListener(COMPANY_DATA_BUST_EVENT, onBust);
            }
        };
    }, []);

    return (
        <Fragment>
            <Seo title={"Wellness Program"} />
            <Pageheader
                currentpage="Wellness Program"
                activepage="Company"
                mainpage="Wellness Program"
            />

            {!fetchComplete && (
                <p className="text-xs text-muted mb-4" role="status">
                    Loading program analytics…
                </p>
            )}

            {/* ── Overview Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {overviewStats.map((stat) => (
                    <div key={stat.label} className="box mb-0">
                        <div className="box-body flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[#8c9097] dark:text-white/50 text-[0.8rem] mb-1">{stat.label}</p>
                                <p className="text-[1.75rem] font-bold text-defaulttextcolor mb-1">{stat.value}</p>
                                <p className={`text-[0.75rem] font-medium ${stat.changePositive ? 'text-success' : 'text-danger'}`}>
                                    {stat.changePositive ? '↑' : '↓'} {stat.change}
                                </p>
                            </div>
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isHexColor(stat.iconBg) ? '' : stat.iconBg
                                }`}
                                style={
                                    isHexColor(stat.iconBg) ? { backgroundColor: stat.iconBg } : undefined
                                }
                            >
                                <i
                                    className={`${stat.icon} text-[1.25rem] ${
                                        isHexColor(stat.iconColor) ? '' : stat.iconColor
                                    }`}
                                    style={
                                        isHexColor(stat.iconColor)
                                            ? { color: stat.iconColor }
                                            : undefined
                                    }
                                ></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Program Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {programCards.map((program) => (
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
                <div className="col-span-12 xl:col-span-7 box mb-0">
                    <div className="box-header justify-between items-center flex-wrap gap-2">
                        <div>
                            <h6 className="box-title font-bold !mb-0">Program Distribution</h6>
                        </div>
                        <div className="text-[0.8125rem] text-[#8c9097]">Share of tagged bookings</div>
                    </div>
                    <div className="box-body">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={programDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {programDistribution.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'share']} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="flex flex-col gap-3">
                                {activeParticipants.map((item, idx) => (
                                    <div key={item.name}>
                                        <div className="flex justify-between text-[0.8125rem] mb-1">
                                            <span className="text-[#8c9097]">{item.name}</span>
                                            <span className="font-semibold text-defaulttextcolor">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-light rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full"
                                                style={{
                                                    width: `${(item.value / barMax) * 100}%`,
                                                    backgroundColor: programDistribution[idx]?.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 xl:col-span-5 box mb-0">
                    <div className="box-header justify-between items-center">
                        <h6 className="box-title font-bold !mb-0">Recent Activity</h6>
                    </div>
                    <div className="box-body flex flex-col gap-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted mb-0">No recent booking activity yet.</p>
                        ) : (
                            recentActivity.map((activity, idx) => (
                                <div key={`${activity.text}-${idx}`} className="flex items-start gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isHexColor(activity.iconBg) ? '' : activity.iconBg
                                        }`}
                                        style={
                                            isHexColor(activity.iconBg)
                                                ? { backgroundColor: activity.iconBg }
                                                : undefined
                                        }
                                    >
                                        <i
                                            className={`${activity.icon} text-[1rem] ${
                                                isHexColor(activity.iconColor) ? '' : activity.iconColor
                                            }`}
                                            style={
                                                isHexColor(activity.iconColor)
                                                    ? { color: activity.iconColor }
                                                    : undefined
                                            }
                                        ></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[0.875rem] text-defaulttextcolor mb-0">{activity.text}</p>
                                        <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default WellnessProgramPage;
