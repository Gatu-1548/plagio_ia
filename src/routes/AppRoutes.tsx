import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../Components/Users/Register";
import Login from "../Components/Users/Login";
import Home from "../Components/Users/Home";
import ListarProyectos from "../Components/Proyectos/ListarProyectos";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} /> 
        <Route path="/proyectos" element={<ListarProyectos />} /> 
      </Routes>
    </Router>
  );
}