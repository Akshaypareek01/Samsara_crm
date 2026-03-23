"use client";
import React, { useState } from 'react';
import CompanyBookingsList from '../components/CompanyBookingsList';

// ─────────────────────────────────────────────────────────────
// STATIC DATA — replace each block with an API call when ready
// e.g. const stats = await fetch('/api/bookings/stats').then(r => r.json())
// ─────────────────────────────────────────────────────────────

const BOOKING_STATS = {
    totalBookings: 245,
    activeReservations: 87,
    waitingList: 23,
    occupancyRate: '78%',
};

// Days that have booking dots on the calendar
// key = day number, value = array of dot colors
const CALENDAR_DOTS: Record<number, string[]> = {
    3: ['#F97316'],
    5: ['#EF4444', '#3B82F6', '#F97316'],
    7: ['#F59E0B'],
    10: ['#F97316', '#EF4444'],
    12: ['#3B82F6', '#F97316'],
    14: ['#F59E0B'],
    17: ['#EF4444', '#3B82F6', '#F97316'],
    19: ['#EF4444'],
    21: ['#3B82F6', '#F97316'],
    24: ['#F59E0B'],
    26: ['#EF4444', '#F97316'],
    28: ['#22C55E', '#3B82F6'],
    31: ['#3B82F6'],
};

// Days highlighted in yellow (have bookings)
const HIGHLIGHTED_DAYS = [3, 7, 10, 14, 17, 21, 24, 28, 31];

const QUICK_ACTIONS = [
    { icon: 'bx-calendar-check', iconBg: '#EEF2FF', iconColor: '#6366F1', title: "Today's Schedule", sub: 'View all bookings' },
    { icon: 'bx-time-five', iconBg: '#FEF9C3', iconColor: '#CA8A04', title: 'Waiting Lists', sub: 'Manage queues' },
    { icon: 'bx-envelope', iconBg: '#D1FAE5', iconColor: '#059669', title: 'Send Confirmations', sub: 'Email & SMS' },
    { icon: 'bx-user-check', iconBg: '#FCE7F3', iconColor: '#EC4899', title: 'Trainer Availability', sub: 'Check schedules' },
];

const RECENT_ACTIVITIES = [
    { color: '#22C55E', title: 'New booking confirmed', sub: 'Jennifer Walsh - Hatha Yoga', time: '2 minutes ago' },
    { color: '#EF4444', title: 'Booking cancelled', sub: 'Robert Kim - Private Session', time: '15 minutes ago' },
    { color: '#F59E0B', title: 'Added to waiting list', sub: 'Sarah Johnson - Vinyasa Flow', time: '1 hour ago' },
];

type ClassStatus = 'Active' | 'Nearly Full' | 'Full';

interface ClassRow {
    dateLabel: string;
    dateSubLabel: string;
    dotColor: string;
    classType: string;
    trainerInitials: string;
    trainerBg: string;
    trainerName: string;
    capacity: number;
    booked: number;
    waitingList: number;
    status: ClassStatus;
}

const CLASS_SCHEDULE: ClassRow[] = [
    { dateLabel: 'Today, 8:00 AM', dateSubLabel: 'March 5, 2026', dotColor: '#22C55E', classType: 'Hatha Yoga', trainerInitials: 'PS', trainerBg: '#DBEAFE', trainerName: 'Priya Sharma', capacity: 15, booked: 12, waitingList: 3, status: 'Active' },
    { dateLabel: 'Today, 12:00 PM', dateSubLabel: 'March 5, 2026', dotColor: '#3B82F6', classType: 'Vinyasa Flow', trainerInitials: 'AT', trainerBg: '#FCE7F3', trainerName: 'Aria Thompson', capacity: 10, booked: 8, waitingList: 0, status: 'Active' },
    { dateLabel: 'Today, 6:00 PM', dateSubLabel: 'March 5, 2026', dotColor: '#EF4444', classType: 'Restorative Yin', trainerInitials: 'LR', trainerBg: '#D1FAE5', trainerName: 'Luna Rodriguez', capacity: 8, booked: 6, waitingList: 2, status: 'Active' },
    { dateLabel: 'Tomorrow, 7:00 AM', dateSubLabel: 'March 6, 2026', dotColor: '#F97316', classType: 'Hot Yoga', trainerInitials: 'MC', trainerBg: '#FEF9C3', trainerName: 'Marcus Chen', capacity: 18, booked: 15, waitingList: 5, status: 'Nearly Full' },
    { dateLabel: 'Tomorrow, 2:00 PM', dateSubLabel: 'March 6, 2026', dotColor: '#3B82F6', classType: 'Private Session', trainerInitials: 'IM', trainerBg: '#EDE9FE', trainerName: 'Isabella Martinez', capacity: 1, booked: 1, waitingList: 0, status: 'Full' },
];

interface TrainerAvailRow {
    initials: string;
    avatarBg: string;
    name: string;
    speciality: string;
    status: 'Available' | 'In Session' | 'On Leave';
}

const TRAINER_AVAILABILITY: TrainerAvailRow[] = [
    { initials: 'PS', avatarBg: '#DBEAFE', name: 'Priya Sharma', speciality: 'Hatha & Vinyasa', status: 'Available' },
    { initials: 'MC', avatarBg: '#FEF9C3', name: 'Marcus Chen', speciality: 'Ashtanga & Hot Yoga', status: 'In Session' },
    { initials: 'LR', avatarBg: '#D1FAE5', name: 'Luna Rodriguez', speciality: 'Yin & Restorative', status: 'Available' },
    { initials: 'AT', avatarBg: '#FCE7F3', name: 'Aria Thompson', speciality: 'Vinyasa & Prenatal', status: 'On Leave' },
];

interface WaitingGroup {
    title: string;
    count: number;
    people: string[];
}

const WAITING_LIST: WaitingGroup[] = [
    { title: 'Hot Yoga - Tomorrow 7:00 AM', count: 5, people: ['Sarah Johnson', 'David Wilson', 'Emma Davis'] },
    { title: 'Restorative Yin - Today 6:00 PM', count: 2, people: ['Michael Chen', 'Lisa Park'] },
];

// ─────────────────────────────────────────────────────────────
// Calendar helpers
// ─────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// March 2026 starts on Sunday (0), has 31 days
const MARCH_2026_START_DOW = 0; // Sunday
const MARCH_2026_DAYS = 31;
const CALENDAR_MONTH_LABEL = 'March 2026';

// ─────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<ClassStatus, string> = {
    Active: 'bg-success/15 text-success',
    'Nearly Full': 'bg-warning/15 text-warning',
    Full: 'bg-danger/15 text-danger',
};

const AVAIL_STYLE: Record<TrainerAvailRow['status'], string> = {
    Available: 'bg-success/15 text-success',
    'In Session': 'bg-warning/15 text-warning',
    'On Leave': 'text-muted',
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const BookingsPage: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [classSearch, setClassSearch] = useState('');

    const TODAY = 5; // static "today" for the calendar highlight

    // Build calendar grid: leading blanks + day cells + trailing blanks
    const leadingBlanks = MARCH_2026_START_DOW;
    const totalCells = Math.ceil((leadingBlanks + MARCH_2026_DAYS) / 7) * 7;

    const filteredClasses = CLASS_SCHEDULE.filter(
        (c) =>
            classSearch === '' ||
            c.classType.toLowerCase().includes(classSearch.toLowerCase()) ||
            c.trainerName.toLowerCase().includes(classSearch.toLowerCase())
    );

    return (
        <div>
            {/* ══════════════════════════════════════════════════
                NEW STATIC UI
            ══════════════════════════════════════════════════ */}

            {/* Heading */}
            <h5 className="font-bold text-xl text-defaulttextcolor mb-5">Booking Management</h5>

            {/* ── Stat Cards ── */}
            {/* TODO: replace BOOKING_STATS with fetch('/api/bookings/stats') */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Total Bookings</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">{BOOKING_STATS.totalBookings}</p>
                        </div>
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                            <i className="bx bx-calendar text-xl" style={{ color: '#6366F1' }}></i>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Active Reservations</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">{BOOKING_STATS.activeReservations}</p>
                        </div>
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                            <i className="bx bx-check-circle text-xl" style={{ color: '#10B981' }}></i>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Waiting List</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">{BOOKING_STATS.waitingList}</p>
                        </div>
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF9C3' }}>
                            <i className="bx bx-time-five text-xl" style={{ color: '#CA8A04' }}></i>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Occupancy Rate</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">{BOOKING_STATS.occupancyRate}</p>
                        </div>
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
                            <i className="bx bx-pie-chart-alt-2 text-xl" style={{ color: '#9B59B6' }}></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Calendar + Quick Actions / Recent Activities ── */}
            <div className="grid grid-cols-12 gap-4 mb-6">
                {/* Calendar */}
                {/* TODO: replace CALENDAR_DOTS with fetch('/api/bookings/calendar?month=2026-03') */}
                <div className="xl:col-span-8 col-span-12 box mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h6 className="box-title font-bold !mb-0">Booking Calendar</h6>
                        <div className="flex items-center gap-3">
                            <button className="w-7 h-7 rounded-full hover:bg-light flex items-center justify-center text-muted">
                                <i className="bx bx-chevron-left text-lg"></i>
                            </button>
                            <span className="text-sm font-semibold text-defaulttextcolor">{CALENDAR_MONTH_LABEL}</span>
                            <button className="w-7 h-7 rounded-full hover:bg-light flex items-center justify-center text-muted">
                                <i className="bx bx-chevron-right text-lg"></i>
                            </button>
                        </div>
                    </div>
                    <div className="box-body pt-0">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS_OF_WEEK.map((d) => (
                                <div key={d} className="text-center text-xs font-semibold text-muted py-2">{d}</div>
                            ))}
                        </div>
                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: totalCells }).map((_, idx) => {
                                const day = idx - leadingBlanks + 1;
                                const isValid = day >= 1 && day <= MARCH_2026_DAYS;
                                const isToday = day === TODAY;
                                const isHighlight = HIGHLIGHTED_DAYS.includes(day);
                                const dots = CALENDAR_DOTS[day] ?? [];

                                return (
                                    <div
                                        key={idx}
                                        className={`relative min-h-[52px] rounded-lg p-1.5 flex flex-col ${!isValid
                                                ? ''
                                                : isToday
                                                    ? 'border-2 border-primary'
                                                    : isHighlight
                                                        ? 'bg-warning/10'
                                                        : ''
                                            }`}
                                    >
                                        {isValid && (
                                            <>
                                                <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-defaulttextcolor'}`}>
                                                    {day}
                                                </span>
                                                {dots.length > 0 && (
                                                    <div className="flex gap-0.5 flex-wrap mt-auto">
                                                        {dots.map((color, i) => (
                                                            <span
                                                                key={i}
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t border-defaultborder">
                            {[
                                { label: 'Group Classes', color: '#EF4444' },
                                { label: 'Private Classes', color: '#3B82F6' },
                                { label: 'Workshops', color: '#22C55E' },
                                { label: 'Special Events', color: '#F97316' },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                    <span className="text-xs text-muted">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions + Recent Activities */}
                <div className="xl:col-span-4 col-span-12 flex flex-col gap-4">
                    {/* Quick Actions */}
                    {/* TODO: wire each button to its respective action API */}
                    <div className="box mb-0">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Quick Actions</h6>
                        </div>
                        <div className="box-body flex flex-col gap-2 pt-0">
                            {QUICK_ACTIONS.map((qa) => (
                                <button
                                    key={qa.title}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-defaultborder hover:bg-light transition-colors text-left w-full"
                                >
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: qa.iconBg }}
                                    >
                                        <i className={`bx ${qa.icon} text-base`} style={{ color: qa.iconColor }}></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-defaulttextcolor leading-tight">{qa.title}</p>
                                        <p className="text-xs text-muted">{qa.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    {/* TODO: replace RECENT_ACTIVITIES with fetch('/api/bookings/recent-activities') */}
                    <div className="box mb-0">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Recent Activities</h6>
                        </div>
                        <div className="box-body flex flex-col gap-4 pt-0">
                            {RECENT_ACTIVITIES.map((a, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                        style={{ backgroundColor: a.color }}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-defaulttextcolor leading-tight">{a.title}</p>
                                        <p className="text-xs text-muted">{a.sub}</p>
                                        <p className="text-xs text-muted mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Class Schedule Management ── */}
            {/* TODO: replace CLASS_SCHEDULE with fetch('/api/bookings/class-schedule') */}
            <div className="box mb-6">
                <div className="box-header flex items-center justify-between flex-wrap gap-3">
                    <h6 className="box-title font-bold !mb-0">Class Schedule Management</h6>
                    <div className="flex items-center gap-2">
                        <div className="relative" style={{ minWidth: '200px' }}>
                            <i
                                className="bx bx-search absolute top-1/2 -translate-y-1/2 text-muted text-sm"
                                style={{ left: '10px' }}
                            ></i>
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={classSearch}
                                onChange={(e) => setClassSearch(e.target.value)}
                                className="ti-form-control !text-[0.875rem]"
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>
                        <button className="ti-btn ti-btn-sm ti-btn-light gap-1 text-xs">
                            <i className="bx bx-filter-alt"></i> Filter
                        </button>
                    </div>
                </div>
                <div className="box-body p-0">
                    <div className="table-responsive">
                        <table className="table text-sm whitespace-nowrap mb-0">
                            <thead>
                                <tr className="border-b border-defaultborder bg-light/40">
                                    {['Date & Time', 'Class Type', 'Trainer', 'Capacity', 'Booked', 'Waiting List', 'Status', 'Actions'].map((h) => (
                                        <th key={h} className="font-semibold text-muted text-xs py-3 px-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((row, i) => (
                                    <tr key={i} className="border-b border-defaultborder/50 hover:bg-light/50">
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-sm text-defaulttextcolor mb-0">{row.dateLabel}</p>
                                            <p className="text-xs text-muted mb-0">{row.dateSubLabel}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.dotColor }} />
                                                <span className="text-sm text-defaulttextcolor">{row.classType}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: row.trainerBg, color: '#374151' }}
                                                >
                                                    {row.trainerInitials}
                                                </div>
                                                <span className="text-sm text-defaulttextcolor">{row.trainerName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-defaulttextcolor">{row.capacity}</td>
                                        <td className="py-3 px-4 text-sm text-defaulttextcolor">{row.booked}</td>
                                        <td className="py-3 px-4 text-sm text-defaulttextcolor">{row.waitingList}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {/* TODO: wire to view/edit/cancel booking APIs */}
                                                <button className="text-muted hover:text-primary transition-colors"><i className="bx bx-show text-base"></i></button>
                                                <button className="text-muted hover:text-warning transition-colors"><i className="bx bx-edit-alt text-base"></i></button>
                                                <button className="text-muted hover:text-danger transition-colors"><i className="bx bx-x text-base"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredClasses.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-muted text-sm">
                                            No classes match your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Trainer Availability + Waiting List ── */}
            <div className="grid grid-cols-12 gap-4 mb-6">
                {/* Trainer Availability */}
                {/* TODO: replace TRAINER_AVAILABILITY with fetch('/api/bookings/trainer-availability') */}
                <div className="xl:col-span-5 col-span-12 box mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h6 className="box-title font-bold !mb-0">Trainer Availability</h6>
                        {/* TODO: wire to refresh availability API */}
                        <button className="w-7 h-7 rounded-full hover:bg-light flex items-center justify-center text-muted">
                            <i className="bx bx-refresh text-base"></i>
                        </button>
                    </div>
                    <div className="box-body flex flex-col gap-3 pt-0">
                        {TRAINER_AVAILABILITY.map((t) => (
                            <div key={t.name} className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: t.avatarBg, color: '#374151' }}
                                >
                                    {t.initials}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-defaulttextcolor leading-tight mb-0">{t.name}</p>
                                    <p className="text-xs text-muted mb-0">{t.speciality}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold ${AVAIL_STYLE[t.status]}`}>
                                        {t.status}
                                    </span>
                                    {/* TODO: wire to schedule trainer API */}
                                    <button className="text-muted hover:text-primary">
                                        <i className="bx bx-calendar text-base"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Waiting List Management */}
                {/* TODO: replace WAITING_LIST with fetch('/api/bookings/waiting-list') */}
                <div className="xl:col-span-7 col-span-12 box mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h6 className="box-title font-bold !mb-0">Waiting List Management</h6>
                        {/* TODO: wire to manage-all waiting list API */}
                        <button className="ti-btn ti-btn-sm ti-btn-primary text-xs font-semibold">
                            Manage All
                        </button>
                    </div>
                    <div className="box-body flex flex-col gap-5 pt-0">
                        {WAITING_LIST.map((group) => (
                            <div key={group.title}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-defaulttextcolor">{group.title}</p>
                                    <span className="text-xs font-semibold text-danger">{group.count} waiting</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {group.people.map((person, i) => (
                                        <div key={person} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted w-4">{i + 1}.</span>
                                                <span className="text-sm text-defaulttextcolor">{person}</span>
                                            </div>
                                            {/* TODO: wire Convert button to booking conversion API */}
                                            <button className="ti-btn ti-btn-sm bg-success/15 text-success border-0 text-xs font-semibold py-0.5 px-2.5">
                                                Convert
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                EXISTING — CompanyBookingsList (100% unchanged)
            ══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-12 gap-6">
                <div className="xl:col-span-12 col-span-12">
                    <CompanyBookingsList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;