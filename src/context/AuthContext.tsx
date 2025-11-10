import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  userId: number | null;
  sub: string | null;
  role: string | null;
  login: (token: string, userId?: number, sub?: string, role?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem("token");
    const id = sessionStorage.getItem("userId");
    const sub = sessionStorage.getItem("sub");
    const role = sessionStorage.getItem("role");

    if (t) setToken(t);
    if (id) setUserId(Number(id));
    if (sub) setSub(sub);
    if (role) setRole(role);
  }, []);

  const login = (t: string, id?: number, sub?: string, role?: string) => {
    setToken(t);
    sessionStorage.setItem("token", t);

    if (typeof id === "number") {
      setUserId(id);
      sessionStorage.setItem("userId", String(id));
    }

    if (typeof sub === "string") {
      setSub(sub);
      sessionStorage.setItem("sub", sub);
    }

    if (typeof role === "string") {
      setRole(role); 
      sessionStorage.setItem("role", role); 
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setSub(null);
    setRole(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("sub");
    sessionStorage.removeItem("role"); 
  };

  return (
    <AuthContext.Provider value={{ token, userId, sub, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;