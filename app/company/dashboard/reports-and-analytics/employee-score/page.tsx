"use client";

import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import companyService from '@/services/companyService';
import {
    getEmployees,
    getDeletionHistory,
    DEPARTMENTS,
    STATUS_FILTERS,
    type Employee,
    type EmployeeStatus,
    type DeletionHistoryRow,
    type PageSize,
    type GetEmployeesParams,
} from '../_data/employee-score-data';
import { EditEmployeeWellnessModal } from './EditEmployeeWellnessModal';

// ─────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<EmployeeStatus, string> = {
    Excellent: 'bg-success/15 text-success',
    Good:      'bg-info/15 text-info',
    Fair:      'bg-warning/15 text-warning',
    'At Risk': 'bg-danger/15 text-danger',
};

const StatusBadge = ({ status }: { status: EmployeeStatus }) => (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[status]}`}>
        {status}
    </span>
);

const QuickFilterBadge = ({
    label,
    active,
    color,
    onClick,
}: {
    label: string;
    active: boolean;
    color: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
            active ? `${color} border-transparent` : 'bg-transparent border-defaultborder text-muted hover:bg-light'
        }`}
    >
        {label}
    </button>
);

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

const PAGE_SIZES: PageSize[] = [10, 25, 50, 100];

const EmployeeScorePage = () => {
    // ── Filter state ──────────────────────────────────────────
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('All Status');
    const [deptFilter, setDept]       = useState('All Departments');
    const [pageSize, setPageSize]     = useState<PageSize>(25);
    const [page, setPage]             = useState(1);
    const [jumpTo, setJumpTo]         = useState('');

    // ── Data state ────────────────────────────────────────────
    const [employees, setEmployees]   = useState<Employee[]>([]);
    const [total, setTotal]           = useState(0);
    const [deletion, setDeletion]     = useState<DeletionHistoryRow[]>([]);
    const [selected, setSelected]     = useState<Set<string>>(new Set());
    const [allChecked, setAllChecked] = useState(false);
    const [deletionOpen, setDeletionOpen] = useState(false);
    const [editRow, setEditRow] = useState<Employee | null>(null);

    const totalPages = Math.ceil(total / pageSize);

    // ── Fetch employees whenever filters/page change ──────────
    // When APIs are ready: getEmployees() internally calls fetch().
    // Nothing in this component changes.
    const fetchData = useCallback(async () => {
        const params: GetEmployeesParams = {
            page, pageSize, search, status: statusFilter, department: deptFilter,
        };
        const result = await getEmployees(params);
        setEmployees(result.employees);
        setTotal(result.total);
        setSelected(new Set());
        setAllChecked(false);
    }, [page, pageSize, search, statusFilter, deptFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        getDeletionHistory().then(setDeletion);
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1); }, [search, statusFilter, deptFilter, pageSize]);

    // ── Selection helpers ─────────────────────────────────────
    const toggleAll = () => {
        if (allChecked) {
            setSelected(new Set());
            setAllChecked(false);
        } else {
            setSelected(new Set(employees.map((e) => e.id)));
            setAllChecked(true);
        }
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Quick filter helpers ───────────────────────────────────
    const handleQuickFilter = (s: EmployeeStatus) => {
        setStatus((prev) => (prev === s ? 'All Status' : s));
    };

    // ── Pagination helpers ─────────────────────────────────────
    const handleJump = () => {
        const n = parseInt(jumpTo, 10);
        if (!isNaN(n) && n >= 1 && n <= totalPages) {
            setPage(n);
            setJumpTo('');
        }
    };

    const exportEmployeesCsv = async () => {
        try {
            await companyService.downloadCompanyReportsExport('employees');
        } catch {
            alert('Export failed. Check your connection and try again.');
        }
    };

    const exportBookingsCsv = async () => {
        try {
            await companyService.downloadCompanyReportsExport('bookings');
        } catch {
            alert('Export failed. Check your connection and try again.');
        }
    };

    const openEdit = (emp: Employee) => setEditRow(emp);

    const paginationPages = (): (number | '...')[] => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, '...', totalPages];
        if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', page - 1, page, page + 1, '...', totalPages];
    };

    const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endRow   = Math.min(page * pageSize, total);

    return (
        <Fragment>
            <Seo title="Employee Wellness Score Card" />
            <Pageheader
                currentpage="Employee Wellness Score Card"
                activepage="Reports & Analytics"
                mainpage="Employee Wellness Score Card"
            />

            {/* ── Top Action Bar ── */}
            <div className="flex justify-end gap-2 mb-4">
                {/* TODO: wire to export API */}
                <button
                    type="button"
                    onClick={exportEmployeesCsv}
                    className="ti-btn ti-btn-sm bg-warning text-white border-0 gap-1 text-xs font-semibold"
                    aria-label="Export employees as CSV"
                >
                    <i className="ri-download-2-line"></i> Export employees (CSV)
                </button>
                <button
                    type="button"
                    onClick={exportBookingsCsv}
                    className="ti-btn ti-btn-sm ti-btn-primary gap-1 text-xs font-semibold"
                    aria-label="Export bookings as CSV"
                >
                    <i className="ri-download-line"></i> Export bookings (CSV)
                </button>
            </div>

            <div className="box mb-0">
                <div className="box-body p-0">

                    {/* ── Search + Filters ── */}
                    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-defaultborder">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[220px]">
                            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm"></i>
                            <input
                                type="text"
                                placeholder="Search employees by name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-control pl-9 text-sm"
                            />
                        </div>

                        {/* Status dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatus(e.target.value)}
                                className="form-select text-sm pr-8 appearance-none"
                            >
                                <option>All Status</option>
                                {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Department dropdown */}
                        <div className="relative">
                            <select
                                value={deptFilter}
                                onChange={(e) => setDept(e.target.value)}
                                className="form-select text-sm pr-8 appearance-none"
                            >
                                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Reset */}
                        <button
                            onClick={() => { setSearch(''); setStatus('All Status'); setDept('All Departments'); }}
                            className="ti-btn ti-btn-sm ti-btn-light text-xs font-semibold"
                        >
                            Reset
                        </button>
                    </div>

                    {/* ── Quick Filters + Count ── */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-defaultborder">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted font-medium">Quick Filters:</span>
                            <QuickFilterBadge
                                label="Excellent"
                                active={statusFilter === 'Excellent'}
                                color="bg-success/15 text-success"
                                onClick={() => handleQuickFilter('Excellent')}
                            />
                            <QuickFilterBadge
                                label="Good"
                                active={statusFilter === 'Good'}
                                color="bg-info/15 text-info"
                                onClick={() => handleQuickFilter('Good')}
                            />
                            <QuickFilterBadge
                                label="Fair"
                                active={statusFilter === 'Fair'}
                                color="bg-warning/15 text-warning"
                                onClick={() => handleQuickFilter('Fair')}
                            />
                            <QuickFilterBadge
                                label="At Risk"
                                active={statusFilter === 'At Risk'}
                                color="bg-danger/15 text-danger"
                                onClick={() => handleQuickFilter('At Risk')}
                            />
                        </div>
                        <p className="text-xs text-muted">
                            Showing <span className="font-semibold text-defaulttextcolor">{startRow}–{endRow}</span> of{' '}
                            <span className="font-semibold text-defaulttextcolor">{total}</span> employees
                        </p>
                    </div>

                    {/* ── Table ── */}
                    <div className="table-responsive">
                        <table className="table text-sm whitespace-nowrap mb-0">
                            <thead>
                                <tr className="border-b border-defaultborder bg-light/40">
                                    <th className="py-3 px-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={allChecked}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Employee</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Department</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Status</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Last Assessment</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Score</th>
                                    <th className="font-semibold text-muted text-xs py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-muted text-sm">
                                            {total === 0 &&
                                            search === '' &&
                                            statusFilter === 'All Status' &&
                                            deptFilter === 'All Departments' ? (
                                                <span>
                                                    No employees registered for your company yet. Add participants
                                                    from the Wellness program pages, or contact your administrator.
                                                </span>
                                            ) : (
                                                <span>No employees match the current filters.</span>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="border-b border-defaultborder/50 hover:bg-light/50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selected.has(emp.id)}
                                                    onChange={() => toggleOne(emp.id)}
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                        style={{ backgroundColor: emp.avatarBg, color: emp.avatarColor }}
                                                    >
                                                        {emp.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-defaulttextcolor leading-tight">{emp.name}</p>
                                                        <p className="text-xs text-muted">{emp.empCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-defaulttextcolor">{emp.department}</td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={emp.status} />
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted">{emp.lastAssessment}</td>
                                            <td className="py-3 px-4 font-semibold text-sm text-defaulttextcolor">
                                                {emp.score}/100
                                            </td>
                                            <td className="py-3 px-4">
                                                {/* TODO: wire to edit employee wellness score API */}
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(emp)}
                                                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                                    aria-label={`Edit wellness row for ${emp.name}`}
                                                >
                                                    <i className="bx bx-edit-alt text-sm"></i> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 border-t border-defaultborder">
                        {/* Left: page size + jump */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
                                    className="form-select text-xs w-auto"
                                >
                                    {PAGE_SIZES.map((s) => (
                                        <option key={s} value={s}>{s} per page</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted">Jump to page:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={jumpTo}
                                    onChange={(e) => setJumpTo(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                                    className="form-control text-xs w-16 py-1"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/* Right: page buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="ti-btn ti-btn-sm ti-btn-light text-xs disabled:opacity-40"
                            >
                                Previous
                            </button>
                            {paginationPages().map((p, i) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-muted text-xs">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`ti-btn ti-btn-sm text-xs w-8 h-8 p-0 ${
                                            page === p
                                                ? 'ti-btn-primary'
                                                : 'ti-btn-light'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="ti-btn ti-btn-sm ti-btn-light text-xs disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Deletion History (collapsible) ── */}
            <div className="box mt-4 mb-0">
                <div
                    className="box-header cursor-pointer flex items-center justify-between"
                    onClick={() => setDeletionOpen((o) => !o)}
                >
                    <h6 className="box-title font-bold !mb-0">Deletion History</h6>
                    <i className={`bx ${deletionOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-lg text-muted`}></i>
                </div>
                {deletionOpen && (
                    <div className="box-body p-0">
                        <div className="table-responsive">
                            <table className="table text-sm whitespace-nowrap mb-0">
                                <thead>
                                    <tr className="border-b border-defaultborder bg-light/40">
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Employee Name</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Deleted By</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Deletion Date/Time</th>
                                        <th className="font-semibold text-muted text-xs py-3 px-4">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deletion.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-muted text-sm">
                                                No deletion records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        deletion.map((row, i) => (
                                            <tr key={i} className="border-b border-defaultborder/50 hover:bg-light/50">
                                                <td className="py-3 px-4 font-semibold text-defaulttextcolor">{row.employeeName}</td>
                                                <td className="py-3 px-4 text-muted">{row.deletedBy}</td>
                                                <td className="py-3 px-4 text-muted">{row.deletionDateTime}</td>
                                                <td className="py-3 px-4 text-muted">{row.reason}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Collapsed state: show a preview row */}
                {!deletionOpen && deletion.length > 0 && (
                    <div className="box-body py-3 px-4">
                        <div className="grid grid-cols-4 gap-4 text-xs company-employee-score-grid-4">
                            <span className="text-muted font-medium">Employee Name</span>
                            <span className="text-muted font-medium">Deleted By</span>
                            <span className="text-muted font-medium">Deletion Date/Time</span>
                            <span className="text-muted font-medium">Reason</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm mt-2 company-employee-score-grid-4">
                            <span className="font-semibold text-defaulttextcolor">{deletion[0].employeeName}</span>
                            <span className="text-muted">{deletion[0].deletedBy}</span>
                            <span className="text-muted">{deletion[0].deletionDateTime}</span>
                            <span className="text-muted">{deletion[0].reason}</span>
                        </div>
                    </div>
                )}
            </div>

            {editRow && (
                <EditEmployeeWellnessModal
                    employee={editRow}
                    onClose={() => setEditRow(null)}
                    onSaved={fetchData}
                />
            )}
        </Fragment>
    );
};

export default EmployeeScorePage;