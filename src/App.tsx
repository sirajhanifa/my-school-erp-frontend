import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginPage from "./modules/auth/login/LoginPage";
import DashboardPage from "./modules/dashboard/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
