import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './routes/AppRoutes';
import { ApolloProvider } from "@apollo/client/react";
import client from "./Services/apolloClient";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationContext";

const container = document.getElementById('root');
if (!container) throw new Error("No se encontró el elemento root");

createRoot(container).render(
  <StrictMode>
    <AuthProvider>
      <OrganizationProvider>
        <ApolloProvider client={client}>
          <AppRoutes />
        </ApolloProvider>
      </OrganizationProvider>
    </AuthProvider>
  </StrictMode>
);