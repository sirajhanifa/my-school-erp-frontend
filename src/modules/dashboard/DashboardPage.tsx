import { useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../components/layout/Sidebar";
import { useAuthStore } from "../../store/authStore";
import { useModuleStore } from "../../store/moduleStore";
import { toast } from "../../store/toastStore";

// Placeholder page shown after login. Replace with the real dashboard later.
const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const fetchModules = useModuleStore((state) => state.fetchModules);

  // Load this school's menu from the backend when the page opens
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleLogout = async () => {
    await logout();
    toast.info("You have been logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.email} · {user?.role}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
