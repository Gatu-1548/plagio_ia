import React, { createContext, useContext, useEffect, useState } from "react";
import type { OrganizationResponse } from "@/Services/organizationServices";

interface OrganizationContextType {
  currentOrg: OrganizationResponse | null;
  setCurrentOrg: (org: OrganizationResponse | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrg, setCurrentOrgState] = useState<OrganizationResponse | null>(null);

  // Restaurar organización desde sessionStorage al iniciar
  useEffect(() => {
    const stored = sessionStorage.getItem("currentOrg");
    if (stored) {
      try {
        setCurrentOrgState(JSON.parse(stored));
      } catch { }
    }
  }, []);

  // Guardar organización en sessionStorage cada vez que cambia
  const setCurrentOrg = (org: OrganizationResponse | null) => {
    setCurrentOrgState(org);
    if (org) {
      sessionStorage.setItem("currentOrg", JSON.stringify(org));
    } else {
      sessionStorage.removeItem("currentOrg");
    }
  };

  return (
    <OrganizationContext.Provider value={{ currentOrg, setCurrentOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
};
