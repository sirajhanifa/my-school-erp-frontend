import { useLocation } from "react-router";
import Icon from "../icon/Icon";
import { useModuleStore } from "../../store/moduleStore";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";

interface TopbarProps {
  onMenuClick: () => void; // opens the sidebar on mobile
  actionsRef: (element: HTMLDivElement | null) => void; // slot where pages put their buttons
}

// Bar at the top of every logged-in page: page title, notifications, profile
const Topbar = ({ onMenuClick, actionsRef }: TopbarProps) => {
  const location = useLocation();
  const modules = useModuleStore((state) => state.modules);

  // Find the menu entry for the current URL, so the title matches the sidebar.
  // Empty until the menu has loaded (or if the page is not in the menu).
  const pageTitle =
    modules
      .flatMap((menu) => [menu, ...menu.subMenus])
      .find((item) => item.path === location.pathname)?.name ?? "";

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Hamburger: only on small screens, where the sidebar is hidden */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-1 rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Icon name="Menu" size={20} />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">
          {pageTitle}
        </h1>

        {/* Page actions (e.g. "Add Class"); empty on pages that don't use it */}
        <div ref={actionsRef} className="flex items-center gap-2" />

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationMenu />
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
