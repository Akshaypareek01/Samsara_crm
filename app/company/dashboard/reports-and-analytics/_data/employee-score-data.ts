// ============================================================
// Employee score list + deletion history — company portal API
// ============================================================

import companyService from '@/services/companyService';

// ─── Types ───────────────────────────────────────────────────

export type EmployeeStatus = 'Excellent' | 'Good' | 'Fair' | 'At Risk';

export interface Employee {
    id: string;
    empCode: string;
    initials: string;
    avatarBg: string;
    avatarColor: string;
    name: string;
    department: string;
    status: EmployeeStatus;
    lastAssessment: string;
    score: number;
}

export interface DeletionHistoryRow {
    employeeName: string;
    deletedBy: string;
    deletionDateTime: string;
    reason: string;
}

export interface EmployeeListResponse {
    total: number;
    employees: Employee[];
}

export type PageSize = 10 | 25 | 50 | 100;

export const DEPARTMENTS = ['All Departments', 'Marketing', 'Sales', 'Engineering', 'HR', 'Finance'];

export const STATUS_FILTERS: EmployeeStatus[] = ['Excellent', 'Good', 'Fair', 'At Risk'];

/**
 * Maps scorecard UI status to portal PATCH fields (`level` + wellness `status` flag).
 */
export function wellnessStatusToApi(status: EmployeeStatus): {
    level: 'beginner' | 'intermediate' | 'advanced';
    status: boolean;
} {
    switch (status) {
        case 'Excellent':
            return { level: 'advanced', status: true };
        case 'Good':
            return { level: 'intermediate', status: true };
        case 'Fair':
            return { level: 'beginner', status: true };
        case 'At Risk':
            return { level: 'beginner', status: false };
    }
}

export interface GetEmployeesParams {
    page: number;
    pageSize: PageSize;
    search: string;
    status: string;
    department: string;
}

const DEMO_FLAG = process.env.NEXT_PUBLIC_DEMO_EMPLOYEES === 'true';

/** Tiny local demo set — only used when NEXT_PUBLIC_DEMO_EMPLOYEES=true. */
const BASE_DEMO: Omit<Employee, 'id'>[] = [
    {
        empCode: 'EMP002',
        initials: 'MC',
        avatarBg: '#DBEAFE',
        avatarColor: '#2563EB',
        name: 'Michael Chen',
        department: 'Marketing',
        status: 'Good',
        lastAssessment: '2024-03-02',
        score: 82,
    },
    {
        empCode: 'EMP003',
        initials: 'ER',
        avatarBg: '#FEF9C3',
        avatarColor: '#CA8A04',
        name: 'Emily Rodriguez',
        department: 'Sales',
        status: 'Fair',
        lastAssessment: '2024-03-01',
        score: 68,
    },
];

/**
 * Local-only pagination for explicit demo mode.
 */
function getStaticEmployeesDemo(params: GetEmployeesParams): EmployeeListResponse {
    const full: Employee[] = BASE_DEMO.map((b, i) => ({
        ...b,
        id: `demo-${i}`,
        empCode: `EMP${String(i + 2).padStart(3, '0')}`,
    }));
    let filtered = full.filter((e) => {
        const matchSearch =
            params.search === '' ||
            e.name.toLowerCase().includes(params.search.toLowerCase()) ||
            e.empCode.toLowerCase().includes(params.search.toLowerCase());
        const matchStatus = params.status === 'All Status' || e.status === params.status;
        const matchDept =
            params.department === 'All Departments' || e.department === params.department;
        return matchSearch && matchStatus && matchDept;
    });
    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    return { total, employees: filtered.slice(start, start + params.pageSize) };
}

function mapRow(u: Record<string, unknown>, idx: number): Employee {
    return {
        id: String(u.id ?? `cu-${idx}`),
        empCode: String(u.empCode ?? ''),
        initials: String(u.initials ?? '?'),
        avatarBg: String(u.avatarBg ?? '#DBEAFE'),
        avatarColor: String(u.avatarColor ?? '#2563EB'),
        name: String(u.name ?? ''),
        department: String(u.department ?? 'Wellness'),
        status: (['Excellent', 'Good', 'Fair', 'At Risk'].includes(String(u.status))
            ? u.status
            : 'Fair') as EmployeeStatus,
        lastAssessment: String(u.lastAssessment ?? ''),
        score: Number(u.score ?? 0),
    };
}

/**
 * Paginated employees for the scorecard UI (real API, or tiny demo if env flag set).
 */
export async function getEmployees(params: GetEmployeesParams): Promise<EmployeeListResponse> {
    if (DEMO_FLAG) {
        return getStaticEmployeesDemo(params);
    }
    try {
        const res = await companyService.listPortalEmployees({
            page: params.page,
            limit: params.pageSize,
            search: params.search,
            status: params.status,
            department: params.department,
        });
        const raw = (res.employees as Record<string, unknown>[]) ?? [];
        const employees = raw.map((u, idx) => mapRow(u, idx));
        return { total: res.total, employees };
    } catch (err) {
        console.error('getEmployees (portal API):', err);
        return { total: 0, employees: [] };
    }
}

/**
 * Soft-delete audit rows for the company (paginated; first page merged in UI).
 */
export async function getDeletionHistory(): Promise<DeletionHistoryRow[]> {
    try {
        const res = await companyService.listPortalDeletionHistory({ page: 1, limit: 100 });
        return (res.rows ?? []).map((r) => ({
            employeeName: r.employeeName,
            deletedBy: r.deletedBy,
            deletionDateTime: r.deletionDateTime,
            reason: r.reason,
        }));
    } catch (err) {
        console.error('getDeletionHistory:', err);
        return [];
    }
}
