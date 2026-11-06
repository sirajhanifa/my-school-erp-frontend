import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Icon from "../icon/Icon";
import type { IconName } from "../icon/Icon";
import { useModuleStore } from "../../store/moduleStore";
import type { MainMenu } from "../../store/moduleStore";

// Shared look of every menu row: shape, spacing, soft hover fade and keyboard focus ring
const rowBase =
  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none";

// Colours of a row that is not the current page
const rowIdle = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

// Colours of the current page's row: light blue tint, blue text
const rowActive = "bg-primary/10 text-primary font-semibold";

// Main menu link: when active, a blue bar also sits on the sidebar's left edge
const mainLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    rowBase,
    isActive
      ? `${rowActive} before:absolute before:inset-y-1.5 before:-left-3 before:w-1 before:rounded-r-full before:bg-primary`
      : rowIdle,
  );

// Submenu link: when active, its blue bar sits on top of the grey guide line
const subLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    rowBase,
    "py-2",
    isActive
      ? `${rowActive} before:absolute before:inset-y-1.5 before:-left-[9px] before:w-0.5 before:rounded-full before:bg-primary`
      : rowIdle,
  );

// Submenu link inside the flyout: same colours, no guide line to sit on
const flyoutLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(rowBase, "py-2", isActive ? rowActive : rowIdle);

// Icon colour: darker on hover, blue on the current page.
// NavLink sets aria-current="page" on the active link, which the blue class reads.
const iconBase =
  "shrink-0 transition-[color,translate] duration-150 ease-out group-hover:text-slate-600 group-aria-[current=page]:text-primary motion-reduce:transition-none";
const iconClass = cn(iconBase, "text-slate-400");

// Submenu icons nudge right a little on hover
const subIconClass = cn(iconClass, "group-hover:translate-x-0.5");

// localStorage key that remembers whether the desktop sidebar is collapsed
const COLLAPSED_KEY = "sidebarCollapsed";

// Storage can be blocked (e.g. private mode), so fall back to "expanded"
const loadCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

interface FlyoutProps {
  menu: MainMenu;
  anchor: HTMLElement; // the group button that opened it
  style: CSSProperties; // screen position, worked out from the button
  onClose: () => void;
}

// Popup card next to the collapsed sidebar, listing one group's submenus
const SubMenuFlyout = ({ menu, anchor, style, onClose }: FlyoutProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Move focus to the first link so keyboard users can carry on with Tab/Enter
  useEffect(() => {
    ref.current?.querySelector("a")?.focus();
  }, []);

  // Close on a click outside, Escape, scrolling or resizing
  useEffect(() => {
    const isInside = (target: EventTarget | null) =>
      target instanceof Node && (ref.current?.contains(target) || anchor.contains(target));

    const handleMouseDown = (event: MouseEvent) => {
      // Clicks on the group button are left to its own toggle
      if (!isInside(event.target)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        anchor.focus();
      }
    };
    const handleScroll = (event: Event) => {
      // Scrolling inside the flyout itself is fine
      if (!(event.target instanceof Node && ref.current?.contains(event.target))) onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    // true = capture, so we also hear scrolls of the sidebar's own menu
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", onClose);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [anchor, onClose]);

  return (
    <div
      ref={ref}
      style={style}
      className="fixed z-50 w-60 overflow-y-auto rounded-xl border border-slate-200 bg-popover p-2 text-popover-foreground shadow-xl shadow-slate-900/10 duration-150 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1 motion-reduce:animate-none"
    >
      <p className="mb-1 border-b border-slate-100 px-3 pt-1 pb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {menu.name}
      </p>
      <nav aria-label={menu.name} className="space-y-0.5">
        {menu.subMenus.map((subMenu) => (
          <NavLink
            key={subMenu.id}
            to={subMenu.path}
            end
            onClick={onClose}
            className={flyoutLinkClass}
          >
            <Icon name={subMenu.icon as IconName} size={16} className={subIconClass} />
            <span className="truncate">{subMenu.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

// Which group's flyout is open, and where to draw it
interface FlyoutState {
  code: string;
  anchor: HTMLElement;
  style: CSSProperties;
  pathname: string; // page it was opened on; changing page hides it
}

interface SidebarProps {
  isOpen: boolean; // mobile only: is the slide-in menu showing?
  onClose: () => void;
}

// Left-hand menu built from the modules stored in the database (see moduleStore).
// On desktop it is always visible and can be collapsed to icons only;
// on small screens it slides in over the page.
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const modules = useModuleStore((state) => state.modules);
  const isLoading = useModuleStore((state) => state.isLoading);
  const location = useLocation();

  // Code of the main menu the user opened by clicking.
  // null = the user has not clicked any yet, so we open the menu that contains the current page.
  const [openCode, setOpenCode] = useState<string | null>(null);

  // Desktop only: show icons without labels
  const [isCollapsed, setIsCollapsed] = useState(loadCollapsed);

  // Collapsed sidebar only: the submenu popup next to a group icon
  const [flyout, setFlyout] = useState<FlyoutState | null>(null);

  // Only show the flyout while collapsed and on the page it was opened on
  const visibleFlyout = isCollapsed && flyout?.pathname === location.pathname ? flyout : null;
  const flyoutMenu = visibleFlyout && modules.find((menu) => menu.code === visibleFlyout.code);

  // The main menu whose submenus contain the current page (if any)
  const currentMenuCode = modules.find((menu) =>
    menu.subMenus.some((subMenu) => subMenu.path === location.pathname),
  )?.code;

  const expandedCode = openCode ?? currentMenuCode;

  // Clicking an open menu closes it ("" = nothing open); clicking a closed one opens it
  const toggleMenu = (code: string) => {
    setOpenCode(expandedCode === code ? "" : code);
  };

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      // Not saved; the sidebar still works for this visit
    }
  };

  const closeFlyout = () => setFlyout(null);

  // In the collapsed desktop sidebar a group opens its submenus in a flyout;
  // everywhere else it opens/closes them inside the sidebar
  const handleGroupClick = (code: string, button: HTMLElement) => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isCollapsed || !isDesktop) {
      toggleMenu(code);
      return;
    }

    // Same icon again closes it
    if (visibleFlyout?.code === code) {
      closeFlyout();
      return;
    }

    // Place it just right of the sidebar, level with the button.
    // Low on the screen it grows upwards so it doesn't run off the bottom.
    const gap = 8;
    const rect = button.getBoundingClientRect();
    const left = (button.closest("aside")?.getBoundingClientRect().right ?? rect.right) + gap;
    const opensUp = rect.top > window.innerHeight * 0.6;
    const style: CSSProperties = opensUp
      ? { left, bottom: window.innerHeight - rect.bottom, maxHeight: rect.bottom - gap }
      : { left, top: rect.top, maxHeight: window.innerHeight - rect.top - gap };

    setFlyout({ code, anchor: button, style, pathname: location.pathname });
  };

  // Collapsed styles use "lg:" so they only apply on desktop, never to the mobile menu.
  // Labels fade in when they reappear after expanding.
  const hideWhenCollapsed = isCollapsed
    ? "lg:hidden"
    : "duration-200 animate-in fade-in-0 motion-reduce:animate-none";
  // Collapsed rows become even 40px icon squares in the middle of the bar
  const squareWhenCollapsed = isCollapsed ? "lg:mx-auto lg:size-10 lg:justify-center lg:px-0" : "";

  return (
    <>
      {/* Blurred dark backdrop behind the mobile menu; tapping it closes the menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] duration-200 animate-in fade-in-0 motion-reduce:animate-none lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar shadow-xl transition-all duration-300 ease-out motion-reduce:transition-none lg:static lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed && "lg:w-16",
        )}
      >
        {/* Same height as the topbar so their bottom borders line up */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-4",
            isCollapsed && "lg:justify-center lg:px-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Icon name="GraduationCap" size={20} />
            </span>
            <div className={cn("min-w-0 leading-tight", hideWhenCollapsed)}>
              <p className="truncate text-base font-semibold tracking-tight text-slate-900">
                MySchool ERP
              </p>
              <p className="truncate text-xs text-muted-foreground">School Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            aria-label="Close menu"
            className="text-muted-foreground lg:hidden"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Scrolls on its own when the menu is longer than the screen */}
        <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-4">
          {/* First load: grey placeholder rows where the menu will appear */}
          {isLoading &&
            modules.length === 0 &&
            [1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className={cn("flex items-center gap-3 px-3 py-2.5", squareWhenCollapsed)}
              >
                <Skeleton className="size-4.5 shrink-0 rounded bg-slate-200" />
                <Skeleton className={cn("h-3 flex-1 rounded bg-slate-200", hideWhenCollapsed)} />
              </div>
            ))}

          {modules.map((menu) => {
            // Main menu without submenus: a direct link (e.g. Dashboard).
            // onClose hides the mobile menu after picking a page.
            // title = the name shows as a tooltip when only the icon is visible.
            if (menu.subMenus.length === 0) {
              return (
                <NavLink
                  key={menu.id}
                  to={menu.path}
                  onClick={onClose}
                  title={isCollapsed ? menu.name : undefined}
                  className={(state) => cn(mainLinkClass(state), squareWhenCollapsed)}
                >
                  <Icon name={menu.icon as IconName} size={18} className={iconClass} />
                  <span className={cn("truncate", hideWhenCollapsed)}>{menu.name}</span>
                </NavLink>
              );
            }

            // Main menu with submenus: a button that opens/closes its submenu list
            const isMenuOpen = expandedCode === menu.code;
            const isFlyoutOpen = visibleFlyout?.code === menu.code;
            // Darker text when the current page is inside this group, even if it is closed
            const hasCurrentPage = currentMenuCode === menu.code;

            return (
              <div key={menu.id}>
                <button
                  type="button"
                  onClick={(event) => handleGroupClick(menu.code, event.currentTarget)}
                  aria-expanded={isCollapsed ? isFlyoutOpen : isMenuOpen}
                  aria-haspopup={isCollapsed ? "true" : undefined}
                  title={isCollapsed ? menu.name : undefined}
                  className={cn(
                    rowBase,
                    "hover:bg-slate-100 hover:text-slate-900",
                    hasCurrentPage ? "text-slate-900" : "text-slate-600",
                    // Collapsed: the group holding the current page gets the blue tint
                    hasCurrentPage && isCollapsed && "lg:bg-primary/10",
                    isFlyoutOpen && "bg-slate-100",
                    squareWhenCollapsed,
                  )}
                >
                  {/* Blue icon when the current page is inside this group */}
                  <Icon
                    name={menu.icon as IconName}
                    size={18}
                    className={cn(iconBase, hasCurrentPage ? "text-primary" : "text-slate-400")}
                  />
                  <span className={cn("flex-1 truncate text-left", hideWhenCollapsed)}>
                    {menu.name}
                  </span>
                  {/* One chevron that turns to point down when the group is open */}
                  <Icon
                    name="ChevronRight"
                    size={16}
                    className={cn(
                      "shrink-0 text-slate-400 transition-transform duration-300 ease-out group-hover:text-slate-600 motion-reduce:transition-none",
                      isMenuOpen && "rotate-90",
                      hideWhenCollapsed,
                    )}
                  />
                </button>

                {/* Slides open by animating the row height from 0fr to 1fr.
                    inert = closed submenu links can't be tabbed to or clicked. */}
                <div
                  inert={!isMenuOpen}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                    isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    isCollapsed && "lg:hidden",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    {/* Grey guide line on the left groups the submenus under their parent.
                        The list also fades and slides down slightly while opening. */}
                    <div
                      className={cn(
                        "my-1 ml-5 space-y-0.5 border-l border-slate-200 pl-2 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
                        isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                      )}
                    >
                      {menu.subMenus.map((subMenu) => (
                        // "end" = only highlight on an exact match, so "/students" is not
                        // highlighted while on "/students/admission"
                        <NavLink
                          key={subMenu.id}
                          to={subMenu.path}
                          end
                          onClick={onClose}
                          className={subLinkClass}
                        >
                          <Icon
                            name={subMenu.icon as IconName}
                            size={16}
                            className={subIconClass}
                          />
                          <span className="truncate">{subMenu.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Desktop only: switch between the full sidebar and icons only */}
        <div className="hidden shrink-0 border-t border-sidebar-border p-3 lg:block">
          <Button
            variant="ghost"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : undefined}
            className={cn(
              "group h-10 w-full justify-start gap-3 px-3 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              squareWhenCollapsed,
            )}
          >
            <Icon
              name={isCollapsed ? "PanelLeftOpen" : "PanelLeftClose"}
              size={18}
              className={iconClass}
            />
            <span className={cn("truncate", hideWhenCollapsed)}>Collapse</span>
          </Button>
        </div>
      </aside>

      {/* Rendered into <body>: inside the sidebar it would be clipped by overflow-hidden.
          key = a fresh flyout per group, so focus moves to its first link again */}
      {visibleFlyout &&
        flyoutMenu &&
        createPortal(
          <SubMenuFlyout
            key={visibleFlyout.code}
            menu={flyoutMenu}
            anchor={visibleFlyout.anchor}
            style={visibleFlyout.style}
            onClose={closeFlyout}
          />,
          document.body,
        )}
    </>
  );
};

export default Sidebar;
