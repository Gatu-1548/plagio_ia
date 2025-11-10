import { useState } from "react";
import { loginUser } from "../../Services/authService";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


interface TokenPayload {
  sub: string; 
  roles: { authority: string }[];
  id: number; 
  iat: number;
  exp: number;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { token, login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userToken = await loginUser(email, password);
      const decoded = jwtDecode<TokenPayload>(userToken);
      const userId = decoded.id;
      const sub = decoded.sub;
      login(userToken, userId, sub);
      setError("");
      navigate("/organizations");
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Entrar
          </button>
        </form>

        {token && (
          <p className="mt-4 text-green-600 text-center wrap-break-word">
            Login Exitoso
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-500 text-center font-medium">
            {error}
          </p>
        )}

        <p className="mt-6 text-sm text-center text-gray-500">
          ¿No tienes una cuenta?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}


// import { useState, type FormEvent } from "react";
// import { useMutation } from "@apollo/client/react";
// import { gql } from "@apollo/client";
// // --- MUTACIÓN GRAPHQL ---
// const LOGIN_USER = gql`
//   mutation LoginUser($email: String!, $password: String!) {
//     loginUser(email: $email, password: $password) {
//       token
//     }
//   }
// `;

// // --- TIPOS TYPESCRIPT ---
// interface LoginUserResponse {
//   loginUser: {
//     token: string;
//   };
// }

// interface LoginUserVars {
//   email: string;
//   password: string;
// }

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   // --- USEMUTATION TIPADO ---
//   const [loginUser] = useMutation<LoginUserResponse, LoginUserVars>(LOGIN_USER);

//   const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       const { data } = await loginUser({
//         variables: { email, password },
//       });

//       // data ya tiene el tipo definido
//       const token = data?.loginUser.token;
//       if (token) {
//         localStorage.setItem("token", token);
//         setError("");
//         console.log("Token recibido:", token);
//       }
//     } catch (err: any) {
//       setError(err.message || "Error al iniciar sesión");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-indigo-600 to-purple-500 p-4">
//       <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">
//         <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
//           Iniciar sesión
//         </h1>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//           <input
//             type="password"
//             placeholder="Contraseña"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
//           >
//             Entrar
//           </button>
//         </form>
//         {error && (
//           <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
//         )}
//       </div>
//     </div>
//   );
// }