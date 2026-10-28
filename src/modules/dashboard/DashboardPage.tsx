import { useAuthStore } from "../../store/authStore";

// Placeholder page shown after login. Replace with the real dashboard later.
// The sidebar, topbar (with Logout) and menu loading all come from AppLayout (see App.tsx).
const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {user?.email} · {user?.role}
      </p>
    </div>
  );
};

export default DashboardPage;
