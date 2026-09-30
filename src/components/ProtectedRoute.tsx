import type { ReactNode } from "react";
import { Navigate } from "react-router";
import Spinner from "./form/Spinner";
import { useAuthStore } from "../store/authStore";

type ProtectedRouteProps = {
  children: ReactNode;
};

// Wrap any page that needs a logged-in user. Everyone else is sent to /login.
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  // Wait until we know whether the user is logged in (e.g. right after a page refresh).
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
