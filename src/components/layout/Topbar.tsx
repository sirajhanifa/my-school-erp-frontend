import { useState } from "react";
import { useLocation } from "react-router";
import Icon from "../icon/Icon";
import { useModuleStore } from "../../store/moduleStore";
import SearchBox from "./SearchBox";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";

interface TopbarProps {
  onMenuClick: () => void; // opens the sidebar on mobile
}

// Bar at the top of every logged-in page: page title, search, notifications, profile
const Topbar = ({ onMenuClick }: TopbarProps) => {
  const location = useLocation();
  const modules = useModuleStore((state) => state.modules);
  // On phones the search box is hidden behind an icon to save space
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900 md:flex-none">
          {pageTitle}
        </h1>

        {/* Search in the middle on tablets and desktops */}
        <div className="hidden flex-1 justify-center px-4 md:flex">
          <div className="w-full max-w-md">
            <SearchBox />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((open) => !open)}
            aria-label="Search"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <Icon name={isMobileSearchOpen ? "X" : "Search"} size={20} />
          </button>
          <NotificationMenu />
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <ProfileMenu />
        </div>
      </div>

      {/* Phone search: a full-width row under the bar */}
      {isMobileSearchOpen && (
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          <SearchBox autoFocus />
        </div>
      )}
    </header>
  );
};

export default Topbar;
