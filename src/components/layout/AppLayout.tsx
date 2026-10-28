import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useModuleStore } from "../../store/moduleStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// The frame around every logged-in page: sidebar on the left, topbar on top,
// and the page content scrolling underneath the topbar.
// It is a layout route (see App.tsx): it stays mounted while <Outlet /> swaps the page.
const AppLayout = () => {
  const fetchModules = useModuleStore((state) => state.fetchModules);
  // Only matters on small screens; on desktop the sidebar is always visible
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load this school's menu once; the sidebar, title and search all use it
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* min-w-0 lets wide content (tables) scroll instead of stretching the page */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
