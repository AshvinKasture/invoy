import { useAppContext } from "@/context/appContext";
import { useAuthContext } from "@/context/authContext";
import { AuthService } from "@/services/authService";
import { useEffect } from "react";
import { toast } from "sonner";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { setUser } = useAuthContext();
  const { showSpinner, hideSpinner, setIsInitialized } = useAppContext();

  useEffect(() => {
    const validateExistingToken = async () => {
      showSpinner();

      const token = AuthService.getAuthToken();
      if (token) {
        try {
          const userData = await AuthService.validateToken();
          if (userData) {
            setUser(userData);
          } else {
            AuthService.clearAuthToken();
            toast.error("Your session has expired. Please log in again.");
          }
        } catch (error) {
          AuthService.clearAuthToken();
          if (
            error instanceof Error &&
            !error.message.includes("NetworkError") &&
            !error.message.includes("fetch")
          ) {
            toast.error("Session validation failed. Please log in again.");
          }
        }
      }

      hideSpinner();
      setIsInitialized(true);
    };

    validateExistingToken();
  }, [setUser, showSpinner, hideSpinner, setIsInitialized]);

  return <>{children}</>;
}
