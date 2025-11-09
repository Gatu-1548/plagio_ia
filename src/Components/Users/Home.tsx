import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Bienvenido a IA_Plagio</h1>
      <p>El sistema de gestión de usuarios</p>
      <button
        style={{ margin: "10px", padding: "10px 20px" }}
        onClick={() => navigate("/login")}
      >
        Login
      </button>
      <button
        style={{ margin: "10px", padding: "10px 20px" }}
        onClick={() => navigate("/register")}
      >
        Registrarse
      </button>
    </div>
  );
}