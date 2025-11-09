// import { jwtDecode } from "jwt-decode";

// interface TokenPayload {
//   sub: string; // puede ser email o id, depende del backend
//   roles: { authority: string }[];
//   iat: number;
//   exp: number;
// }

// export function getUserIdFromToken(): number | null {
//   const token = sessionStorage.getItem("token");
//   if (!token) return null;

//   try {
//     const decoded = jwtDecode<TokenPayload>(token);
//     console.log("Token decodificado:", decoded);
//     return decoded.sub; // 👈 Aquí tienes el ID o email del usuario
//   } catch (error) {
//     console.error("Error decodificando token:", error);
//     return null;
//   }
// }