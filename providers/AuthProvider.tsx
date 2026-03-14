"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth, login as authLogin, User } from "@/services/auth-service";

/* ------------------------------------------------------------------ */
/*  JWT role extraction                                                */
/* ------------------------------------------------------------------ */

/**
 * Decode the JWT payload (no signature verification — browser only).
 * Returns the parsed payload or null if the token is missing / malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extract role codes from the current access token.
 *
 * The auth service embeds roles in the JWT. Tries these common claim keys:
 *   roles      → ["SUPER_ADMIN", "EMPLOYEE"]
 *   role_codes → ["SUPER_ADMIN"]
 *   role       → "SUPER_ADMIN"  or  ["SUPER_ADMIN"]
 */
function getRolesFromJwt(): string[] {
  const token = auth.getAccessToken();
  if (!token) return [];
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  if (Array.isArray(payload.roles))      return payload.roles      as string[];
  if (Array.isArray(payload.role_codes)) return payload.role_codes as string[];
  if (Array.isArray(payload.role))       return payload.role       as string[];
  if (typeof payload.role === "string")  return [payload.role];

  return [];
}

/**
 * Return the stored user enriched with roles.
 *
 * Priority:
 *   1. roles already on the stored user object (set after the User interface
 *      was updated to include roles — new logins only)
 *   2. roles decoded from the JWT claims (works for existing sessions and
 *      any backend that doesn't include roles on the employee payload)
 *
 * This means role-gating works immediately after deploy with no forced
 * re-login required.
 */
function getUserWithRoles(): User | null {
  const user = auth.getUser();
  if (!user) return null;
  if (Array.isArray((user as User).roles) && (user as User).roles.length > 0) {
    return user;
  }
  const roles = getRolesFromJwt();
  return { ...user, roles };
}

/* ------------------------------------------------------------------ */
/*  Context shape                                                      */
/* ------------------------------------------------------------------ */

interface AuthContextValue {
  /** Current user (null when not logged-in or still loading) */
  user: User | null;
  /** True while the initial auth check is running */
  loading: boolean;
  /** Convenience flag – true when user !== null */
  isAuthenticated: boolean;
  /** Log in with email + password. Returns an error string on failure. */
  loginUser: (email: string, password: string) => Promise<string | null>;
  /** Log out, clear tokens, redirect to /login */
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  loginUser: async () => "AuthProvider not mounted",
  logoutUser: async () => {},
});

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- bootstrap: rehydrate from localStorage on mount -------- */
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Fast path — valid, non-expired token
        if (auth.isAuthenticated()) {
          setUser(getUserWithRoles());
          return;
        }

        // 2. Token expired but refresh token exists → try silent refresh
        if (auth.getRefreshToken()) {
          const refreshed = await auth.refreshAccessToken();
          if (refreshed) {
            // After refresh the new JWT is in localStorage — decode roles from it
            setUser(getUserWithRoles());
            return;
          }
        }

        // 3. No valid session
        setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  /* -------- loginUser -------- */
  const loginUser = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const result = await authLogin(email, password);
      if (result.success) {
        // After login the new JWT is in localStorage — decode roles from it
        setUser(getUserWithRoles());
        return null;
      }
      return result.error ?? "Login failed";
    },
    []
  );

  /* -------- logoutUser -------- */
  const logoutUser = useCallback(async () => {
    setUser(null);
    auth.clearTokens();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    try {
      await auth.logout();
    } catch {
      // Ignore — tokens are already cleared locally
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);