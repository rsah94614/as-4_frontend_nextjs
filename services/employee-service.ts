// services/employee-service.ts
// Works with the real Employee Service routes:
//   GET /v1/employees          → paginated list (supports manager_id filter)
//   GET /v1/employees/{id}     → single employee detail
//
// All requests routed through Next.js proxy (/api/proxy/employees/*)
// — no direct microservice URL exposed to the browser.
//
// FIX: employeesClient baseURL is /api/proxy/employees, which the proxy maps to
// http://localhost:8003/v1/employees. So paths here must be relative to that —
// i.e. `/${id}` not `/v1/employees/${id}` (which would double-path to
// /api/proxy/employees/v1/employees/${id} → 404).

import { createAuthenticatedClient } from '@/lib/api-utils'
import { requireAuthenticatedUserId } from '@/lib/api-utils'
import { extractErrorMessage } from '@/lib/error-utils'

const employeesClient = createAuthenticatedClient('/api/proxy/employees')


// ─── Types matching backend schemas.py ───────────────────────────────────────

export interface Employee {
    employee_id:       string
    username:          string
    email:             string
    designation_id?:   string
    designation_name?: string
    department_id?:    string
    department_name?:  string
    manager_id?:       string
    manager_name?:     string
    status_id?:        string
    status_name?:      string
    is_active:         boolean
    date_of_joining:   string
    created_at:        string
    updated_at?:       string
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
            // FIX: was `/v1/employees/${id}` → double-pathed to
            // /api/proxy/employees/v1/employees/${id} → 404
            // Now: `/${id}` → /api/proxy/employees/${id} → proxied correctly
            const res = await employeesClient.get<EmployeeDetail>(`/${id}`)
            return res.data
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to fetch employee'))
        }
    },

    async listEmployees(params?: {
        page?:          number
        limit?:         number
        manager_id?:    string
        department_id?: string
        is_active?:     boolean
        search?:        string
        sort_by?:       string
        sort_order?:    string
    }): Promise<{ data: Employee[]; pagination: Record<string, unknown> }> {
        const q = new URLSearchParams()
        if (params?.page)              q.set('page',          String(params.page))
        if (params?.limit)             q.set('limit',         String(params.limit))
        if (params?.manager_id)        q.set('manager_id',    params.manager_id)
        if (params?.department_id)     q.set('department_id', params.department_id)
        if (params?.is_active != null) q.set('is_active',     String(params.is_active))
        if (params?.search)            q.set('search',        params.search)
        if (params?.sort_by)           q.set('sort_by',       params.sort_by)
        if (params?.sort_order)        q.set('sort_order',    params.sort_order)

        try {
            // FIX: backend list route is /list, not / — so path must be `/list?${q}`
            // → /api/proxy/employees/list?... → proxied to /v1/employees/list?...
            const res = await employeesClient.get<{ data: Employee[]; pagination: Record<string, unknown> }>(
                `/list?${q.toString()}`
            )
            return res.data
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to fetch employees'))
        }
    },
}

// ─── Main helper used by page.tsx ────────────────────────────────────────────

export async function getTeamMembersForUI(): Promise<{
    loggedInUser: TeamMember
    teamMembers:  TeamMember[]
    teamLeader:   TeamMember | null
}> {
    const myId      = requireAuthenticatedUserId()
    const myDetail  = await employeeService.getEmployee(myId)
    const managerId = myDetail.manager?.employee_id

    if (managerId) {
        const [teamLeaderDetail, colleaguesRes] = await Promise.all([
            employeeService.getEmployee(managerId).catch(() => null),
            employeeService.listEmployees({ manager_id: managerId, limit: 100, is_active: true }),
        ])

        return {
            loggedInUser: detailToTeamMember(myDetail),
            teamMembers:  colleaguesRes.data
                .filter((e) => e.employee_id !== myId)
                .map(listItemToTeamMember),
            teamLeader: teamLeaderDetail?.is_active ? detailToTeamMember(teamLeaderDetail) : null,
        }
    } else {
        const directReportsRes = await employeeService.listEmployees({ manager_id: myId, limit: 100, is_active: true })
        return {
            loggedInUser: detailToTeamMember(myDetail),
            teamMembers:  directReportsRes.data.map(listItemToTeamMember),
            teamLeader:   null,
        }
    }
}