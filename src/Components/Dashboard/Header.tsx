import { Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const token = sessionStorage.getItem("token");
  let userEmail = "Usuario";

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userEmail = decoded.sub;
    } catch (error) {
      console.error("Error decodificando token:", error);
    }
  }

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">Dashboard Principal</h2>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500"> {userEmail}</span>
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}