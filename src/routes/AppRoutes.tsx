import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../Components/Users/Home";
import Login from "../Components/Users/Login";
import Register from "../Components/Users/Register";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import ListarProyectos from "../Components/Proyectos/ListarProyectos";
import Organizations from "@/pages/organizations";
import SistemaGestionEmpresarial from "@/pages/sistemaGestionEmpresarial";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import UserManager from "@/Components/Manage_USER/UserManager";
import UploadScanPage from "@/pages/uploadScan";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/organizations" element={<Organizations/>}/>
        <Route path="/erp" element={<SistemaGestionEmpresarial />} />

        {/* Dashboard */}
        <Route path="/organization" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="dashboard/proyectos/listar" element={<ListarProyectos />} />
          <Route path="dashboard/proyectos/:id/documentos" element={<Documents />} />
          <Route path="dashboard/manage/usuarios" element={<UserManager/>} />
          <Route path="dashboard/proyectos/:id/documentos/upload" element={<UploadScanPage />} />
          <Route path="dashboard/documentos" element={<div>Documentos</div>} />
        </Route>
      </Routes>
    </Router>
  );
}