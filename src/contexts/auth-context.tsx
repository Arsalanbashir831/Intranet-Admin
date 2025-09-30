"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { getAuthTokens, clearAuthCookies } from "@/lib/cookies";
import { verifyToken } from "@/services/auth";

interface User {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,  setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cookies-only
        const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();

        if (accessToken && refreshTokenValue) {
          // Verify current access token. If invalid, try to refresh manually
          try {
            await verifyToken();
            setUser({ id: "self", name: "Admin", role: "ADMIN" });
          } catch (error) {
            // Token verification failed, try to refresh manually
            try {
              const { refreshToken } = await import("@/services/auth");
              const result = await refreshToken(refreshTokenValue);
              const { setAuthCookies } = await import("@/lib/cookies");
              setAuthCookies(result.access, result.refresh || refreshTokenValue);
              
              // Try to verify again with new token
              await verifyToken();
              setUser({ id: "self", name: "Admin", role: "ADMIN" });
            } catch (refreshError) {
              // Refresh failed, user is not authenticated
              console.error("Token refresh failed:", refreshError);
              setUser(null);
            }
          }
        } else {
          // No tokens found, user is not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== "undefined") {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - only run once on mount

  // Profile fetching removed – verification-based auth only

  // Listen for token updates from API client
  useEffect(() => {
    const handleTokenUpdate = () => {
      const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();
      if (accessToken && refreshTokenValue) {
        setUser({
          id: "1",
          name: "User",
          role: "EMPLOYEE",
        });
      } else {
        setUser(null);
      }
    };

    // Listen for storage events (when tokens are updated)
    window.addEventListener('storage', handleTokenUpdate);
    
    // Also listen for custom events if needed
    window.addEventListener('auth:login', handleTokenUpdate);
    window.addEventListener('auth:logout', () => setUser(null));

    return () => {
      window.removeEventListener('storage', handleTokenUpdate);
      window.removeEventListener('auth:login', handleTokenUpdate);
      window.removeEventListener('auth:logout', () => setUser(null));
    };
  }, []);

  const logout = () => {
    setUser(null);
    clearAuthCookies();
    
    window.location.href = ROUTES.AUTH.LOGIN;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
