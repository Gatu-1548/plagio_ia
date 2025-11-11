import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../Components/Users/Home";
import Login from "../Components/Users/Login";
import Register from "../Components/Users/Register";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import ListarProyectos from "../Components/Proyectos/ListarProyectos";
import Organizations from "@/pages/organizations";
import SistemaGestionEmpresarial from "@/pages/sistemaGestionEmpresarial";

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
        <Route path="/organization/dashboard" element={<DashboardLayout />}>
          <Route path="proyectos/listar" element={<ListarProyectos />} />
          <Route path="documentos" element={<div>Documentos</div>} />
        </Route>
      </Routes>
    </Router>
  );
}