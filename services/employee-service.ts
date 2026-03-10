// services/employee-service.ts
// Works with the real Employee Service routes:
//   GET /v1/employees          → paginated list (supports manager_id filter)
//   GET /v1/employees/{id}     → single employee detail
//
// All requests routed through Next.js proxy (/api/proxy/employees/*)
// — no direct microservice URL exposed to the browser.

import { createAuthenticatedClient } from '@/lib/api-utils'
import { extractApiError, requireAuthenticatedUserId } from '@/lib/api-utils'

const employeesClient = createAuthenticatedClient('/api/proxy/employees')


// ─── Types matching backend schemas.py ───────────────────────────────────────

export interface Employee {
    employee_id:     string
    username:        string
    email:           string
    designation_id?: string
    designation_name?: string
    department_id?:  string
    department_name?: string
    manager_id?:     string
    manager_name?:   string
    status_id?:      string
    status_name?:    string
    is_active:       boolean
    date_of_joining: string
    created_at:      string
    updated_at?:     string
}

export interface EmployeeDetail {
    employee_id:     string
    username:        string
    email:           string
    is_active:       boolean
    date_of_joining: string
    designation?: {
        designation_id:   string
        designation_name: string
        designation_code: string
        level:            number
    }
    department?: {
        department_id:   string
        department_name: string
        department_code: string
    }
    manager?: {
        employee_id: string
        username:    string
        email:       string
    }
    status?: {
        status_id:   string
        status_code: string
        status_name: string
    }
    roles?: { role_id: string; role_name: string; role_code: string }[]
    created_at:  string
    updated_at?: string
}

export interface TeamMember {
    id:           string
    name:         string
    email?:       string
    designation?: string
}

// ─── Converters ──────────────────────────────────────────────────────────────

export function detailToTeamMember(e: EmployeeDetail): TeamMember {
    return { id: e.employee_id, name: e.username, email: e.email, designation: e.designation?.designation_name }
}

export function listItemToTeamMember(e: Employee): TeamMember {
    return { id: e.employee_id, name: e.username, email: e.email, designation: e.designation_name }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const employeeService = {
    async getEmployee(id: string): Promise<EmployeeDetail> {
        try {
            const res = await employeesClient.get<EmployeeDetail>(`/v1/employees/${id}`);
            return res.data;
        } catch (error: unknown) {
            throw new Error(extractApiError(error, 'Failed to fetch employee'));
        }
    },

    async listEmployees(params?: {
        page?:        number
        limit?:       number
        manager_id?:  string
        department_id?: string
        is_active?:   boolean
        search?:      string
        sort_by?:     string
        sort_order?:  string
    }): Promise<{ data: Employee[]; pagination: Record<string, unknown> }> {
        const q = new URLSearchParams()
        if (params?.page)          q.set('page',          String(params.page))
        if (params?.limit)         q.set('limit',         String(params.limit))
        if (params?.manager_id)    q.set('manager_id',    params.manager_id)
        if (params?.department_id) q.set('department_id', params.department_id)
        if (params?.is_active != null) q.set('is_active', String(params.is_active))
        if (params?.search)        q.set('search',        params.search)
        if (params?.sort_by)       q.set('sort_by',       params.sort_by)
        if (params?.sort_order)    q.set('sort_order',    params.sort_order)

        try {
            const res = await employeesClient.get<{ data: Employee[]; pagination: Record<string, unknown> }>(
                `/v1/employees?${q.toString()}`
            );
            return res.data;
        } catch (error: unknown) {
            throw new Error(extractApiError(error, 'Failed to fetch employees'));
        }
    },
}

// ─── Main helper used by page.tsx ────────────────────────────────────────────

export async function getTeamMembersForUI(): Promise<{
    loggedInUser: TeamMember
    teamMembers:  TeamMember[]
    teamLeader:   TeamMember | null
}> {
    const myId     = requireAuthenticatedUserId()
    const myDetail = await employeeService.getEmployee(myId)
    const managerId = myDetail.manager?.employee_id

    if (managerId) {
        // Fetch manager + colleagues in parallel
        const [teamLeaderDetail, colleaguesRes] = await Promise.all([
            employeeService.getEmployee(managerId).catch(() => null),
            employeeService.listEmployees({ manager_id: managerId, limit: 100 }),
        ])

        return {
            loggedInUser: detailToTeamMember(myDetail),
            teamMembers:  colleaguesRes.data
                .filter((e) => e.employee_id !== myId)
                .map(listItemToTeamMember),
            teamLeader: teamLeaderDetail ? detailToTeamMember(teamLeaderDetail) : null,
        }
    } else {
        const directReportsRes = await employeeService.listEmployees({ manager_id: myId, limit: 100 })
        return {
            loggedInUser: detailToTeamMember(myDetail),
            teamMembers:  directReportsRes.data.map(listItemToTeamMember),
            teamLeader:   null,
        }
    }
}