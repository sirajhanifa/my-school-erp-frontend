import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "../icon/Icon";
import { useAuthStore } from "../../store/authStore";
import { toast } from "../../store/toastStore";

// "Ravi Kumar" -> "RK", "Admin" -> "A"
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

// Avatar button with the logged-in user's details and a Logout option.
// The dropdown handles opening, closing on outside click/Escape and keyboard use.
const ProfileMenu = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    toast.info("You have been logged out");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" aria-label="Open profile menu" className="h-auto gap-2 p-1 sm:pr-2" />}
      >
        <Avatar>
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        {/* Name and role are hidden on small screens to save space */}
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-medium">{user.name}</span>
          <span className="block text-xs leading-tight font-normal text-muted-foreground">{user.role}</span>
        </span>
        <Icon name="ChevronDown" size={16} className="hidden text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="py-1.5">
            <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="block truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Disabled until a profile page exists */}
        <DropdownMenuItem disabled>
          <Icon name="User" size={16} />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <Icon name="LogOut" size={16} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
