import { useAppContext } from "@/context/appContext";
import { useAuthContext } from "@/context/authContext";
import { AuthService } from "@/services/authService";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user } = useAuthContext();
  const { isInitialized } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check after initialization is complete
    if (isInitialized && (user || AuthService.isAuthenticated())) {
      navigate("/", { replace: true });
    }
  }, [user, navigate, isInitialized]);

  // If user is authenticated, don't render the children while navigating
  if (isInitialized && (user || AuthService.isAuthenticated())) {
    return null;
  }

  return <>{children}</>;
}
