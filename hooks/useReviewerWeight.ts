/**
 * useReviewerWeight.ts
 *
 * Reads the current user's reviewer weight from their JWT role.
 * Uses getRolesFromToken() from role-utils — same source Sidebar uses.
 * Weight mapping mirrors the backend formula exactly.
 */

import { useMemo } from "react"
import { getRolesFromToken } from "@/lib/role-utils"

const ROLE_WEIGHT_MAP: Record<string, number> = {
    SUPER_ADMIN: 1.5,
    HR_ADMIN:    1.2,
    MANAGER:     1.3,
    EMPLOYEE:    1.0,
}

// Highest weight wins if user has multiple roles
function resolveWeight(roles: string[]): number {
    const weights = roles.map(r => ROLE_WEIGHT_MAP[r] ?? 1.0)
    return weights.length > 0 ? Math.max(...weights) : 1.0
}

export function useReviewerWeight(): { weight: number; roleCode: string | null } {
    return useMemo(() => {
        const roles    = getRolesFromToken()           // e.g. ["MANAGER"] or ["HR_ADMIN", "EMPLOYEE"]
        const weight   = resolveWeight(roles)
        const roleCode = roles[0] ?? null              // primary role for display
        return { weight, roleCode }
    }, [])
}