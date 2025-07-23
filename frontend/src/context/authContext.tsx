import type { UserDto } from "@/services/authService";
import { AuthService } from "@/services/authService";
import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getUserInitials: () => string;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: () => {},
  getUserInitials: () => "",
  isLoading: false,
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await AuthService.login({ username, password });

      // Set user in context (token is already stored by AuthService)
      setUser({
        id: data.user.id,
        name: data.user.name,
        username: data.user.username,
      });
    } catch (error) {
      throw error; // Re-throw to let the component handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Clear JWT token using AuthService
    AuthService.clearAuthToken();
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "";
    return user.name
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, getUserInitials, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
