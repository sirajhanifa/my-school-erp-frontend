import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import Icon from "../icon/Icon";
import type { IconName } from "../icon/Icon";
import Spinner from "../form/Spinner";
import { useModuleStore } from "../../store/moduleStore";

// Styles for a menu link: highlighted in blue when it is the current page
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
  }`;

interface SidebarProps {
  isOpen: boolean; // mobile only: is the slide-in menu showing?
  onClose: () => void;
}

// Left-hand menu built from the modules stored in the database (see moduleStore).
// On desktop it is always visible; on small screens it slides in over the page.
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const modules = useModuleStore((state) => state.modules);
  const isLoading = useModuleStore((state) => state.isLoading);
  const location = useLocation();

  // Code of the main menu the user opened by clicking.
  // null = the user has not clicked any yet, so we open the menu that contains the current page.
  const [openCode, setOpenCode] = useState<string | null>(null);

  // The main menu whose submenus contain the current page (if any)
  const currentMenuCode = modules.find((menu) =>
    menu.subMenus.some((subMenu) => subMenu.path === location.pathname),
  )?.code;

  const expandedCode = openCode ?? currentMenuCode;

  // Clicking an open menu closes it ("" = nothing open); clicking a closed one opens it
  const toggleMenu = (code: string) => {
    setOpenCode(expandedCode === code ? "" : code);
  };

  return (
    <>
      {/* Dark backdrop behind the mobile menu; tapping it closes the menu */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Same height as the topbar so their bottom borders line up */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <span className="text-lg font-semibold text-slate-900">MySchool ERP</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-6 text-slate-500">
            <Spinner className="h-5 w-5" />
          </div>
        )}

        {/* Scrolls on its own when the menu is longer than the screen */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {modules.map((menu) => {
            // Main menu without submenus: a direct link (e.g. Dashboard).
            // onClose hides the mobile menu after picking a page.
            if (menu.subMenus.length === 0) {
              return (
                <NavLink key={menu.id} to={menu.path} onClick={onClose} className={linkClass}>
                  <Icon name={menu.icon as IconName} size={18} />
                  {menu.name}
                </NavLink>
              );
            }

            // Main menu with submenus: a button that opens/closes its submenu list
            const isMenuOpen = expandedCode === menu.code;

            return (
              <div key={menu.id}>
                <button
                  type="button"
                  onClick={() => toggleMenu(menu.code)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Icon name={menu.icon as IconName} size={18} />
                  <span className="flex-1 text-left">{menu.name}</span>
                  <Icon name={isMenuOpen ? "ChevronDown" : "ChevronRight"} size={16} />
                </button>

                {isMenuOpen && (
                  <div className="mt-1 space-y-1 pl-6">
                    {menu.subMenus.map((subMenu) => (
                      // "end" = only highlight on an exact match, so "/students" is not
                      // highlighted while on "/students/admission"
                      <NavLink
                        key={subMenu.id}
                        to={subMenu.path}
                        end
                        onClick={onClose}
                        className={linkClass}
                      >
                        <Icon name={subMenu.icon as IconName} size={16} />
                        {subMenu.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
