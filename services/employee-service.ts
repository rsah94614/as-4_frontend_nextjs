// services/employee-service.ts
// Works with the real Employee Service routes:
//   GET /v1/employees          → paginated list (supports manager_id filter)
//   GET /v1/employees/{id}     → single employee detail
//
// Uses auth.getUser() to get the current employee_id from localStorage
// (stored at login via auth.setTokens) — no extra /me request needed.

import { auth } from './auth-service'
import axiosClient from './api-client'

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || 'http://localhost:8002'

const ENDPOINTS = {
    LIST: `${EMPLOYEE_API}/v1/employees`,
    GET: (id: string) => `${EMPLOYEE_API}/v1/employees/${id}`,
} as const

// ─── Types matching backend schemas.py ───────────────────────────────────────

/** Matches EmployeeListItem from schemas.py */
export interface Employee {
    employee_id: string
    username: string
    email: string
    designation_id?: string
    designation_name?: string
    department_id?: string
    department_name?: string
    manager_id?: string
    manager_name?: string
    status_id?: string
    status_name?: string
    is_active: boolean
    date_of_joining: string
    created_at: string
    updated_at?: string
}

/** Matches EmployeeDetailResponse from schemas.py */
export interface EmployeeDetail {
    employee_id: string
    username: string
    email: string
    is_active: boolean
    date_of_joining: string
    designation?: {
        designation_id: string
        designation_name: string
        designation_code: string
        level: number
    }
    department?: {
        department_id: string
        department_name: string
        department_code: string
    }
    manager?: {
        employee_id: string
        username: string
        email: string
    }
    status?: {
        status_id: string
        status_code: string
        status_name: string
    }
    roles?: { role_id: string; role_name: string; role_code: string }[]
    created_at: string
    updated_at?: string
}

/** Shape used by UI components (ReviewCard, header, etc.) */
export interface TeamMember {
    id: string
    name: string   // mapped from username
    email?: string
    designation?: string
}

// ─── Converters ──────────────────────────────────────────────────────────────

export function detailToTeamMember(e: EmployeeDetail): TeamMember {
    return {
        id: e.employee_id,
        name: e.username,
        email: e.email,
        designation: e.designation?.designation_name,
    }
}

export function listItemToTeamMember(e: Employee): TeamMember {
    return {
        id: e.employee_id,
        name: e.username,
        email: e.email,
        designation: e.designation_name,
    }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const employeeService = {
    /** Fetch a single employee detail by ID */
    async getEmployee(id: string): Promise<EmployeeDetail> {
        try {
            const res = await axiosClient.get<EmployeeDetail>(ENDPOINTS.GET(id));
            return res.data;
        } catch (error: unknown) {
            const axiosErr = error as { response?: { data?: { detail?: string } } };
            throw new Error(axiosErr.response?.data?.detail || 'Failed to fetch employee');
        }
    },

    /**
     * List employees with optional filters.
     * Passing manager_id fetches all direct reports of that manager.
     */
    async listEmployees(params?: {
        page?: number
        limit?: number
        manager_id?: string
        department_id?: string
        is_active?: boolean
        search?: string
        sort_by?: string
        sort_order?: string
    }): Promise<{ data: Employee[]; pagination: Record<string, unknown> }> {
        const q = new URLSearchParams()
        if (params?.page) q.set('page', String(params.page))
        if (params?.limit) q.set('limit', String(params.limit))
        if (params?.manager_id) q.set('manager_id', params.manager_id)
        if (params?.department_id) q.set('department_id', params.department_id)
        if (params?.is_active != null) q.set('is_active', String(params.is_active))
        if (params?.search) q.set('search', params.search)
        if (params?.sort_by) q.set('sort_by', params.sort_by)
        if (params?.sort_order) q.set('sort_order', params.sort_order)

        try {
            const res = await axiosClient.get<{ data: Employee[]; pagination: Record<string, unknown> }>(
                `${ENDPOINTS.LIST}?${q.toString()}`
            );
            return res.data;
        } catch (error: unknown) {
            const axiosErr = error as { response?: { data?: { detail?: string } } };
            throw new Error(axiosErr.response?.data?.detail || 'Failed to fetch employees');
        }
    },
}

// ─── Main helper used by page.tsx ────────────────────────────────────────────

/**
 * Assembles the three pieces the review page needs, using only real endpoints:
 *
 *  loggedInUser  — auth.getUser().employee_id → GET /v1/employees/{myId}
 *  teamMembers   — GET /v1/employees?manager_id={myId}  (my direct reports)
 *  teamLeader    — GET /v1/employees/{manager_id}        (my manager)
 */
export async function getTeamMembersForUI(): Promise<{
    loggedInUser: TeamMember
    teamMembers: TeamMember[]
    teamLeader: TeamMember | null
}> {
    // 1. Get current employee_id from the user stored in localStorage at login
    const storedUser = auth.getUser()
    if (!storedUser?.employee_id) throw new Error('Authentication required')

    const myId = storedUser.employee_id as string

    // 2. Fetch own full profile + direct reports in parallel
    const [myDetail, teamRes] = await Promise.all([
        employeeService.getEmployee(myId),
        employeeService.listEmployees({ manager_id: myId, limit: 100 }),
    ])

    // 3. Fetch manager if the profile has one
    let teamLeader: TeamMember | null = null
    if (myDetail.manager?.employee_id) {
        try {
            const mgr = await employeeService.getEmployee(myDetail.manager.employee_id)
            teamLeader = detailToTeamMember(mgr)
        } catch {
            // Manager fetch failed — don't crash the page
            teamLeader = null
        }
    }

    return {
        loggedInUser: detailToTeamMember(myDetail),
        teamMembers: teamRes.data.map(listItemToTeamMember),
        teamLeader,
    }
}
