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

// Left-hand menu built from the modules stored in the database (see moduleStore).
const Sidebar = () => {
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
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="px-5 py-4 text-lg font-semibold text-slate-900">MySchool ERP</div>

      {isLoading && (
        <div className="flex justify-center py-6 text-slate-500">
          <Spinner className="h-5 w-5" />
        </div>
      )}

      <nav className="space-y-1 px-3 pb-4">
        {modules.map((menu) => {
          // Main menu without submenus: a direct link (e.g. Dashboard)
          if (menu.subMenus.length === 0) {
            return (
              <NavLink key={menu.id} to={menu.path} className={linkClass}>
                <Icon name={menu.icon as IconName} size={18} />
                {menu.name}
              </NavLink>
            );
          }

          // Main menu with submenus: a button that opens/closes its submenu list
          const isOpen = expandedCode === menu.code;

          return (
            <div key={menu.id}>
              <button
                type="button"
                onClick={() => toggleMenu(menu.code)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Icon name={menu.icon as IconName} size={18} />
                <span className="flex-1 text-left">{menu.name}</span>
                <Icon name={isOpen ? "ChevronDown" : "ChevronRight"} size={16} />
              </button>

              {isOpen && (
                <div className="mt-1 space-y-1 pl-6">
                  {menu.subMenus.map((subMenu) => (
                    // "end" = only highlight on an exact match, so "/students" is not
                    // highlighted while on "/students/admission"
                    <NavLink key={subMenu.id} to={subMenu.path} end className={linkClass}>
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
  );
};

export default Sidebar;
