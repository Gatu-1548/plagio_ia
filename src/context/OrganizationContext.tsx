import React, { createContext, useContext, useState } from "react";
import type { OrganizationResponse } from "@/Services/organizationServices";

interface OrganizationContextType {
  currentOrg: OrganizationResponse | null;
  setCurrentOrg: (org: OrganizationResponse | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState<OrganizationResponse | null>(null);
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
