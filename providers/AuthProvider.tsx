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
  logoutUser: async () => { },
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
          setUser(auth.getUser());
          return;
        }

        // 2. Token expired but refresh token exists → try silent refresh
        if (auth.getRefreshToken()) {
          const refreshed = await auth.refreshAccessToken();
          if (refreshed) {
            setUser(auth.getUser());
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
        setUser(auth.getUser());
        return null; // no error
      }
      return result.error ?? "Login failed";
    },
    []
  );

  /* -------- logoutUser -------- */
  const logoutUser = useCallback(async () => {
    // Clear local state and tokens immediately so the redirect is never blocked
    setUser(null);
    auth.clearTokens();

    // Redirect to login page right away
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    // Fire backend logout in background (best-effort, don't block on it)
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
