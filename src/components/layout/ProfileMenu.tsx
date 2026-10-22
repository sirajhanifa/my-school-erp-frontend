import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Icon from "../icon/Icon";
import { useAuthStore } from "../../store/authStore";
import { toast } from "../../store/toastStore";
import useClickOutside from "./useClickOutside";

// "Ravi Kumar" -> "RK", "Admin" -> "A"
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

// Avatar button with the logged-in user's details and a Logout option
const ProfileMenu = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    toast.info("You have been logged out");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100 sm:pr-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {getInitials(user.name)}
        </span>
        {/* Name and role are hidden on small screens to save space */}
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-medium text-slate-900">{user.name}</span>
          <span className="block text-xs leading-tight text-slate-500">{user.role}</span>
        </span>
        <Icon name="ChevronDown" size={16} className="hidden text-slate-400 sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="py-1">
            {/* Disabled until a profile page exists */}
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-400"
            >
              <Icon name="User" size={16} />
              My Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Icon name="LogOut" size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
