// lib/role-utils.ts
// ─── Decode JWT without a library ─────────────────────────────────────────────
import { auth } from '@/services/auth-service';

export const ADMIN_ROLES = ['HR_ADMIN', 'ADMIN', 'SUPER_ADMIN'] as const;

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** Extract roles from the JWT access token payload */
export function getRolesFromToken(): string[] {
    const token = auth.getAccessToken();
    if (!token) return [];
    const payload = decodeJwtPayload(token);
    if (!payload) return [];
    const raw = (payload.roles ?? payload.role ?? []) as string[] | string;
    const arr: string[] = Array.isArray(raw) ? raw : String(raw).split(',');
    return arr.map((r: string) => r.trim().toUpperCase()).filter(Boolean);
}

/** Returns true if the current user has an admin role */
export function isAdminUser(): boolean {
    const user = auth.getUser();
    if (!user) return false;

    const tokenRoles = getRolesFromToken();
    const userObj = user as Record<string, unknown>;
    const rolesSource = (userObj.roles ?? (userObj.employee as Record<string, unknown> | undefined)?.roles ?? []) as string[];
    const userRoles: string[] = rolesSource.map((r: string) =>
        r.toUpperCase()
    );
    const all = Array.from(new Set([...tokenRoles, ...userRoles]));
    return all.some(r => (ADMIN_ROLES as readonly string[]).includes(r));
}
