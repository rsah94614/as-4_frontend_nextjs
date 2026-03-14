// lib/role-utils.ts
// ─── Decode JWT without a library ─────────────────────────────────────────────
import { auth } from '@/services/auth-service';

/**
 * Single source of truth for all elevated role sets.
 *
 * FIX 4: isSuperDev previously hardcoded its own inline array
 * ['SUPER_ADMIN', 'SUPER_DEV', 'ADMIN'] independently of ADMIN_ROLES,
 * creating a split source of truth and accidentally granting plain ADMIN
 * super-dev access. Both functions now derive from constants defined here.
 */
export const ADMIN_ROLES     = ['HR_ADMIN', 'ADMIN', 'SUPER_ADMIN'] as const;
export const SUPER_DEV_ROLES = ['SUPER_ADMIN', 'SUPER_DEV']         as const;

// ─── JWT decode ───────────────────────────────────────────────────────────────

/**
 * FIX 5: Explicitly validate the token has exactly three dot-separated
 * segments before indexing [1]. Previously a malformed token let
 * split('.')[1] return undefined, making .replace() throw — rescued only
 * accidentally by the catch block.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
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

// ─── Role extraction ──────────────────────────────────────────────────────────

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

// ─── Role checks ──────────────────────────────────────────────────────────────

/**
 * Returns true if the current user has an admin role.
 *
 * FIX 2 (resolved): User.roles is string[] per auth-service.ts — the unsafe
 * cast to Record<string, unknown> is no longer needed. Roles are read directly
 * from the typed User object.
 *
 * FIX 3: JWT is checked first (signed authority). The cached user object is a
 * fallback only, consulted when the token check does not resolve — it may lag
 * after a role change.
 */
export function isAdminUser(): boolean {
    // Primary: JWT is signed and always reflects the latest issued roles.
    const tokenRoles = getRolesFromToken();
    if (tokenRoles.some(r => (ADMIN_ROLES as readonly string[]).includes(r))) {
        return true;
    }

    // Fallback: user object cached at login.
    // User.roles is string[] — access it directly, no cast required.
    const user = auth.getUser();
    if (!user) return false;

    const userRoles = user.roles.map(r => r.toUpperCase());
    return userRoles.some(r => (ADMIN_ROLES as readonly string[]).includes(r));
}

/**
 * Returns true if the current user has the SUPER_ADMIN or SUPER_DEV role.
 *
 * FIX 1: Removed plain 'ADMIN' from the check — it was a silent privilege
 * escalation granting regular admins super-dev access.
 *
 * FIX 3: Uses getRolesFromToken() exclusively, consistent with isAdminUser().
 *
 * FIX 4: Derives from SUPER_DEV_ROLES constant, not an inline array.
 */
export function isSuperDev(): boolean {
    const roles = getRolesFromToken();
    return roles.some(r => (SUPER_DEV_ROLES as readonly string[]).includes(r));
}