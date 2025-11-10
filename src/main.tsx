import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './routes/AppRoutes';
import { ApolloProvider } from "@apollo/client/react";
import client from "./Services/apolloClient";
import { AuthProvider } from "./context/AuthContext";

const container = document.getElementById('root');
if (!container) throw new Error("No se encontró el elemento root");

createRoot(container).render(
  <StrictMode>
    <AuthProvider>
      <ApolloProvider client={client}>
        <AppRoutes />
      </ApolloProvider>
    </AuthProvider>
  </StrictMode>
);