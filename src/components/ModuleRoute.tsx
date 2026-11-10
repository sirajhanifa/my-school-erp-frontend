import { Navigate, Outlet, useLocation, useOutletContext } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import type { AppLayoutContext } from "./layout/AppLayout";
import { useModuleStore } from "../store/moduleStore";

// Opens a page only if it is in the user's menu (the menu holds only the modules their role allows).
// This stops typed URLs; the backend still checks every API call, which is the real protection.
const ModuleRoute = () => {
  const modules = useModuleStore((state) => state.modules);
  const hasLoaded = useModuleStore((state) => state.hasLoaded);
  const { pathname } = useLocation();
  // Pass AppLayout's context on, so pages can still use useOutletContext()
  const context = useOutletContext<AppLayoutContext>();

  // Wait for the menu, otherwise a page refresh would be blocked before it arrives
  if (!hasLoaded) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Spinner className="size-6" />
      </div>
    );
  }

  // Pages the user may open: links (e.g. Dashboard) and every submenu
  const allowedPaths = modules
    .flatMap((menu) => [menu.path, ...menu.subMenus.map((subMenu) => subMenu.path)])
    .filter(Boolean);

  // The page itself, or a page inside it (e.g. /users/students/123)
  const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isAllowed) {
    return <Outlet context={context} />;
  }

  // Not allowed: send the user to the first page they can open
  const firstPath = allowedPaths[0];
  if (firstPath) {
    return <Navigate to={firstPath} replace />;
  }

  return (
    <div className="py-12 text-center">
      <p className="font-semibold text-slate-900">No modules assigned</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your role has no access to any module yet. Please contact the administrator.
      </p>
    </div>
  );
};

export default ModuleRoute;
