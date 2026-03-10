// services/employee-service.ts
// Works with the real Employee Service routes:
//   GET /v1/employees          → paginated list (supports manager_id filter)
//   GET /v1/employees/{id}     → single employee detail
//
// Uses auth.getUser() to get the current employee_id from localStorage
// (stored at login via auth.setTokens) — no extra /me request needed.

import axiosClient from './api-client'
import { extractApiError, requireAuthenticatedUserId } from '@/lib/api-utils'
import type { Employee, EmployeeDetail, TeamMember } from '@/types'

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || 'http://localhost:8003'

const ENDPOINTS = {
    LIST: `${EMPLOYEE_API}/v1/employees`,
    GET: (id: string) => `${EMPLOYEE_API}/v1/employees/${id}`,
} as const

// ─── Types matching backend schemas.py ───────────────────────────────────────

/** Matches EmployeeListItem from schemas.py */
 

/** Matches EmployeeDetailResponse from schemas.py */


/** Shape used by UI components (ReviewCard, header, etc.) */


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
            throw new Error(extractApiError(error, 'Failed to fetch employee'));
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
            throw new Error(extractApiError(error, 'Failed to fetch employees'));
        }
    },
}

// ─── Main helper used by page.tsx ────────────────────────────────────────────

/**
 * Assembles the three pieces the review page needs, using only real endpoints:
 *
 *  loggedInUser  — GET /v1/employees/{myId}
 *  teamLeader    — GET /v1/employees/{manager_id}   (my manager)
 *  teamMembers   — GET /v1/employees?manager_id={manager_id}
 *                  i.e. colleagues who share my manager, excluding myself.
 *
 *  If the logged-in user has no manager (they ARE a top-level manager),
 *  fall back to fetching their own direct reports instead.
 */
export async function getTeamMembersForUI(): Promise<{
    loggedInUser: TeamMember
    teamMembers: TeamMember[]
    teamLeader: TeamMember | null
}> {
    // 1. Get current employee_id from the user stored in localStorage at login
    const myId = requireAuthenticatedUserId()

    // 2. Fetch own full profile
    const myDetail = await employeeService.getEmployee(myId)

    const managerId = myDetail.manager?.employee_id

    if (managerId) {
        // 3a. Has a manager — fetch manager detail + all colleagues in parallel
        const [teamLeaderDetail, colleaguesRes] = await Promise.all([
            employeeService.getEmployee(managerId).catch(() => null),
            employeeService.listEmployees({ manager_id: managerId, limit: 100 }),
        ])

        return {
            loggedInUser: detailToTeamMember(myDetail),
            // Exclude self from the reviewable list
            teamMembers: colleaguesRes.data
                .filter((e) => e.employee_id !== myId)
                .map(listItemToTeamMember),
            teamLeader: teamLeaderDetail ? detailToTeamMember(teamLeaderDetail) : null,
        }
    } else {
        // 3b. No manager — this user is a top-level manager; show their direct reports
        const directReportsRes = await employeeService.listEmployees({
            manager_id: myId,
            limit: 100,
        })

        return {
            loggedInUser: detailToTeamMember(myDetail),
            teamMembers: directReportsRes.data.map(listItemToTeamMember),
            teamLeader: null,
        }
    }
}

export type { Employee, EmployeeDetail, TeamMember } from "@/types";
