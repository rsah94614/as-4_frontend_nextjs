//Placeholder for now, waiting for backend team
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

const AuthContext = createContext<{
  user: User;
  setUser: (user: User) => void;
  loading: boolean;
}>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/auth/validate")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
