import { useAppContext } from "@/context/appContext";
import { useAuthContext } from "@/context/authContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthContext();
  const { isInitialized } = useAppContext();

  // Wait for initialization before making routing decisions
  if (!isInitialized) {
    return null;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the protected content
  return <>{children}</>;
}
