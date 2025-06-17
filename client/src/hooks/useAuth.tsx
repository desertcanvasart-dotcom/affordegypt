import React, { useState, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const cachedUser = localStorage.getItem("cached_user");
    
    // If we have cached user data, use it immediately to prevent logout flashing
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem("cached_user");
      }
    }
    
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Cache user data to prevent logout flashing
        localStorage.setItem("cached_user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("cached_user");
        setUser(null);
      }
    } catch (error: any) {
      // Only remove token if it's actually an auth error
      if (error.message && error.message.includes('401')) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("cached_user");
        setUser(null);
      }
      // For other errors, keep the user state as is to prevent unnecessary logouts
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", {
      username,
      password,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("cached_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (userData: RegisterData) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("cached_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("cached_user");
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const response = await apiRequest("PUT", "/api/auth/profile", profileData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Profile update failed");
    }

    const data = await response.json();
    localStorage.setItem("cached_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}