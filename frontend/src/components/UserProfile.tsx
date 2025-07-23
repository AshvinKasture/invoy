import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/context/authContext";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, logout, getUserInitials } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Don't render if no user is logged in
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors outline-none">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gray-600 text-white text-sm font-medium">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-700 text-sm font-medium">{user.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/profile"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Your Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/settings"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center space-x-2 text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
