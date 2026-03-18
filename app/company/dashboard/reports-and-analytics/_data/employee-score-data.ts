// ============================================================
// STATIC DATA LAYER — employee-score.data.ts
// ─────────────────────────────────────────────────────────────
// All data lives here. When APIs are ready, replace each
// function body with a fetch() call. The UI imports ONLY
// these functions, so zero component edits will be needed.
// ============================================================

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

// ─── Static Employee Data ────────────────────────────────────

// 999 total simulated by repeating a base set across pages.
// When APIs are ready: replace getEmployees() with a real
// paginated fetch e.g. /api/employees/wellness-score?page=1&limit=25&status=...&department=...
const BASE_EMPLOYEES: Omit<Employee, 'id'>[] = [
    { empCode: 'EMP002', initials: 'MC', avatarBg: '#DBEAFE', avatarColor: '#2563EB', name: 'Michael Chen',      department: 'Marketing',    status: 'Good',      lastAssessment: '2024-03-02', score: 82  },
    { empCode: 'EMP003', initials: 'ER', avatarBg: '#FEF9C3', avatarColor: '#CA8A04', name: 'Emily Rodriguez',   department: 'Sales',        status: 'Fair',      lastAssessment: '2024-03-01', score: 68  },
    { empCode: 'EMP004', initials: 'DK', avatarBg: '#FFE4E6', avatarColor: '#E11D48', name: 'David Kim',         department: 'Engineering',  status: 'At Risk',   lastAssessment: '2024-02-28', score: 45  },
    { empCode: 'EMP005', initials: 'JT', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'Jessica Thompson',  department: 'HR',           status: 'Excellent', lastAssessment: '2024-03-03', score: 92  },
    { empCode: 'EMP006', initials: 'RW', avatarBg: '#EDE9FE', avatarColor: '#7C3AED', name: 'Robert Wilson',     department: 'Finance',      status: 'Good',      lastAssessment: '2024-03-02', score: 78  },
    { empCode: 'EMP007', initials: 'AD', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'Amanda Davis',      department: 'Marketing',    status: 'Excellent', lastAssessment: '2024-03-01', score: 89  },
    { empCode: 'EMP008', initials: 'CL', avatarBg: '#FEF3C7', avatarColor: '#D97706', name: 'Christopher Lee',   department: 'Engineering',  status: 'Fair',      lastAssessment: '2024-03-03', score: 71  },
    { empCode: 'EMP009', initials: 'JB', avatarBg: '#DBEAFE', avatarColor: '#2563EB', name: 'Jennifer Brown',    department: 'Sales',        status: 'Good',      lastAssessment: '2024-03-02', score: 85  },
    { empCode: 'EMP010', initials: 'MG', avatarBg: '#FFE4E6', avatarColor: '#E11D48', name: 'Matthew Garcia',    department: 'Finance',      status: 'At Risk',   lastAssessment: '2024-02-29', score: 52  },
    { empCode: 'EMP011', initials: 'WT', avatarBg: '#FFE4E6', avatarColor: '#E11D48', name: 'William Taylor',    department: 'HR',           status: 'At Risk',   lastAssessment: '2024-03-02', score: 49  },
    { empCode: 'EMP012', initials: 'LT', avatarBg: '#FFE4E6', avatarColor: '#E11D48', name: 'Lucas Thomas',      department: 'Marketing',    status: 'At Risk',   lastAssessment: '2024-03-03', score: 57  },
    { empCode: 'EMP013', initials: 'LH', avatarBg: '#FEF9C3', avatarColor: '#CA8A04', name: 'Lucas Harris',      department: 'HR',           status: 'Fair',      lastAssessment: '2024-03-02', score: 68  },
    { empCode: 'EMP014', initials: 'WJ', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'William Jackson',   department: 'Marketing',    status: 'Excellent', lastAssessment: '2024-03-02', score: 100 },
    { empCode: 'EMP015', initials: 'BA', avatarBg: '#EDE9FE', avatarColor: '#7C3AED', name: 'Benjamin Anderson', department: 'Engineering',  status: 'Good',      lastAssessment: '2024-03-01', score: 81  },
    { empCode: 'EMP016', initials: 'AT', avatarBg: '#EDE9FE', avatarColor: '#7C3AED', name: 'Alexander Taylor',  department: 'Engineering',  status: 'Good',      lastAssessment: '2024-02-28', score: 89  },
    { empCode: 'EMP017', initials: 'WT', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'William Thomas',    department: 'Engineering',  status: 'Excellent', lastAssessment: '2024-02-28', score: 95  },
    { empCode: 'EMP018', initials: 'MT', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'Mia Taylor',        department: 'HR',           status: 'Excellent', lastAssessment: '2024-03-03', score: 92  },
    { empCode: 'EMP019', initials: 'MH', avatarBg: '#FEF9C3', avatarColor: '#CA8A04', name: 'Mia Harris',        department: 'Marketing',    status: 'Fair',      lastAssessment: '2024-03-01', score: 67  },
    { empCode: 'EMP020', initials: 'JH', avatarBg: '#FEF9C3', avatarColor: '#CA8A04', name: 'James Harris',      department: 'Engineering',  status: 'Fair',      lastAssessment: '2024-02-28', score: 64  },
    { empCode: 'EMP021', initials: 'SA', avatarBg: '#FFE4E6', avatarColor: '#E11D48', name: 'Sophia Anderson',   department: 'HR',           status: 'At Risk',   lastAssessment: '2024-03-02', score: 59  },
    { empCode: 'EMP022', initials: 'SM', avatarBg: '#FEF9C3', avatarColor: '#CA8A04', name: 'Sophia Martinez',   department: 'HR',           status: 'Fair',      lastAssessment: '2024-03-03', score: 67  },
    { empCode: 'EMP023', initials: 'AT', avatarBg: '#FEF9C3', avatarColor: '#CA8A04', name: 'Amelia Thompson',   department: 'HR',           status: 'Fair',      lastAssessment: '2024-02-28', score: 71  },
    { empCode: 'EMP024', initials: 'MW', avatarBg: '#EDE9FE', avatarColor: '#7C3AED', name: 'Mia White',         department: 'Engineering',  status: 'Good',      lastAssessment: '2024-03-02', score: 89  },
    { empCode: 'EMP025', initials: 'JH', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'James Harris',      department: 'Finance',      status: 'Excellent', lastAssessment: '2024-02-28', score: 93  },
    { empCode: 'EMP026', initials: 'SA', avatarBg: '#D1FAE5', avatarColor: '#059669', name: 'Sophia Anderson',   department: 'Engineering',  status: 'Excellent', lastAssessment: '2024-03-03', score: 94  },
];

export const DEPARTMENTS = ['All Departments', 'Marketing', 'Sales', 'Engineering', 'HR', 'Finance'];

export const STATUS_FILTERS: EmployeeStatus[] = ['Excellent', 'Good', 'Fair', 'At Risk'];

// ─── Paginated Employee List ──────────────────────────────────

export interface GetEmployeesParams {
    page: number;
    pageSize: PageSize;
    search: string;
    status: string;       // 'All Status' | EmployeeStatus
    department: string;   // 'All Departments' | department name
}

export async function getEmployees(params: GetEmployeesParams): Promise<EmployeeListResponse> {
    // TODO: return await fetch(
    //   `/api/reports/employee-wellness-score?page=${params.page}&limit=${params.pageSize}` +
    //   `&search=${params.search}&status=${params.status}&department=${params.department}`
    // ).then(r => r.json())

    // --- Static simulation ---
    // Build full 999-employee list by cycling the base set
    const full: Employee[] = Array.from({ length: 999 }, (_, i) => {
        const base = BASE_EMPLOYEES[i % BASE_EMPLOYEES.length];
        const num  = i + 2; // start from EMP002
        return {
            ...base,
            id: `emp-${num}`,
            empCode: `EMP${String(num).padStart(3, '0')}`,
        };
    });

    // Apply filters
    let filtered = full.filter((e) => {
        const matchSearch =
            params.search === '' ||
            e.name.toLowerCase().includes(params.search.toLowerCase()) ||
            e.empCode.toLowerCase().includes(params.search.toLowerCase());
        const matchStatus =
            params.status === 'All Status' || e.status === params.status;
        const matchDept =
            params.department === 'All Departments' || e.department === params.department;
        return matchSearch && matchStatus && matchDept;
    });

    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const employees = filtered.slice(start, start + params.pageSize);

    return { total, employees };
}

// ─── Deletion History ─────────────────────────────────────────

export async function getDeletionHistory(): Promise<DeletionHistoryRow[]> {
    // TODO: return await fetch('/api/reports/employee-wellness-score/deletion-history').then(r => r.json())
    return [
        {
            employeeName:    'Sarah Johnson',
            deletedBy:       'Admin User',
            deletionDateTime:'03/07/2026, 03:41 PM',
            reason:          'No reason provided',
        },
    ];
}