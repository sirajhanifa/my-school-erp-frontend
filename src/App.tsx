import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginPage from "./modules/auth/login/LoginPage";
import DashboardPage from "./modules/dashboard/DashboardPage";
import ClassesPage from "./modules/organization-setup/classes/ClassesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Toaster from "./components/toast/Toaster";
import { useAuthStore } from "./store/authStore";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // On first load, ask the backend if the auth cookie is still valid.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {/* All logged-in pages share one AppLayout, so the sidebar stays mounted
            and the menu is loaded once instead of on every page change */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organization-setup/classes" element={<ClassesPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
