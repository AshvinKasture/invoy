import type { UserDto } from "@/services/authService";
import { AuthService } from "@/services/authService";
import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getUserInitials: () => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: () => {},
  getUserInitials: () => "",
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserDto | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const data = await AuthService.login({ username, password });

      setUser({
        id: data.user.id,
        name: data.user.name,
        username: data.user.username,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
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
      value={{
        user,
        setUser,
        login,
        logout,
        getUserInitials,
      }}
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
