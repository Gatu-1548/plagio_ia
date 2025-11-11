import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../Components/Users/Home";
import Login from "../Components/Users/Login";
import Register from "../Components/Users/Register";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import ListarProyectos from "../Components/Proyectos/ListarProyectos";
import Organizations from "@/pages/organizations";
import UserManager from "@/Components/Manage_USER/UserManager";
export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/organizations" element={<Organizations/>}/>

        {/* Dashboard */}
        <Route path="/organization/dashboard" element={<DashboardLayout />}>
          <Route path="proyectos/listar" element={<ListarProyectos />} />
          <Route path="manage/usuarios" element={<UserManager />} />
        </Route>
      </Routes>
    </Router>
  );
}