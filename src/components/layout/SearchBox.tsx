import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Icon from "../icon/Icon";
import type { IconName } from "../icon/Icon";
import { useModuleStore } from "../../store/moduleStore";
import useClickOutside from "./useClickOutside";

// One page the user can jump to from the search results
interface SearchPage {
  id: string;
  name: string;
  parentName?: string; // e.g. "Students" for the "Admission" submenu
  icon: string;
  path: string;
}

// Search box that finds pages from the menu and opens them.
// There is no search API yet, so it only searches the user's menu.
const SearchBox = ({ autoFocus = false }: { autoFocus?: boolean }) => {
  const navigate = useNavigate();
  const modules = useModuleStore((state) => state.modules);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // Which result is highlighted with the arrow keys
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen);

  // Turn the menu tree into a flat list of pages that can be opened
  const pages = useMemo<SearchPage[]>(
    () =>
      modules.flatMap((menu) =>
        menu.subMenus.length === 0
          ? [{ id: menu.id, name: menu.name, icon: menu.icon, path: menu.path }]
          : menu.subMenus.map((subMenu) => ({
              id: subMenu.id,
              name: subMenu.name,
              parentName: menu.name,
              icon: subMenu.icon,
              path: subMenu.path,
            })),
      ),
    [modules],
  );

  // Pages whose name (or parent menu name) contains what the user typed
  const term = query.trim().toLowerCase();
  const results = term
    ? pages
        .filter(
          (page) =>
            page.name.toLowerCase().includes(term) ||
            page.parentName?.toLowerCase().includes(term),
        )
        .slice(0, 8)
    : [];

  const openPage = (page: SearchPage) => {
    navigate(page.path);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openPage(results[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Icon
        name="Search"
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        placeholder="Search pages..."
        aria-label="Search pages"
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0); // new text = start again from the first result
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      />

      {isOpen && term && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">No pages found</p>
          ) : (
            <ul className="py-1">
              {results.map((page, index) => (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => openPage(page)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                      index === activeIndex ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <Icon name={page.icon as IconName} size={16} />
                    <span className="flex-1 truncate">{page.name}</span>
                    {page.parentName && (
                      <span className="text-xs text-slate-400">{page.parentName}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
