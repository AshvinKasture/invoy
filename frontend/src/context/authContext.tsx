import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  name: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
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
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    try {
      // TODO: Replace with actual API endpoint - update to match your backend
      const response = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // TODO: Handle JWT token storage
      // localStorage.setItem("token", data.token);

      // Set user in context
      setUser({
        id: data.user.id,
        name: data.user.name,
        username: data.user.username,
      });
    } catch (error) {
      throw error; // Re-throw to let the component handle the error
    }
  };

  const logout = () => {
    setUser(null);
    // TODO: Clear JWT token from storage
    // localStorage.removeItem("token");
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "";
    return user.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, getUserInitials }}
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
