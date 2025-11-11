import { Menu, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";


interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const token = sessionStorage.getItem("token");
  let userEmail = "Usuario";
  let avatarFallback = "U";

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userEmail = decoded.sub;
      if (userEmail) {
        avatarFallback = userEmail[0].toUpperCase();
      }
    } catch (error) {
      console.error("Error decodificando token:", error);
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center border-b border-gray-200 h-16">
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={22} />
        </Button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          PAGINA PRINCIPAL
        </h2>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Mi Cuenta</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </header>
  );
}