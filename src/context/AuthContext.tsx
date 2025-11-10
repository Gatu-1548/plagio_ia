import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  userId: number | null;
  sub: string | null;
  login: (token: string, userId?: number, sub?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [sub, setSub] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem("token");
    const id = sessionStorage.getItem("userId");
    const sub = sessionStorage.getItem("sub");
    if (t) setToken(t);
    if (id) setUserId(Number(id));
    if (sub) setSub(sub);
  }, []);

  const login = (t: string, id?: number, sub?: string) => {
    setToken(t);
    sessionStorage.setItem("token", t);
    if (typeof id === "number") {
      setUserId(id);
      sessionStorage.setItem("userId", String(id));
    }
    if (typeof sub === "string") {
      setSub(sub);
      sessionStorage.setItem("sub", String(sub));
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setSub(null)
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("sub")
  };

  return (
    <AuthContext.Provider value={{ token, userId, sub, login, logout }}>
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
