"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { getAuthTokens, clearAuthCookies } from "@/lib/cookies";
import { getMe } from "@/services/auth";

// Define types for the user based on the me API response
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  executiveId: number | null;
  employeeId: number | null;
  name: string;
  profilePicture?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthError(null);
        // Cookies-only
        const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();

        if (accessToken && refreshTokenValue) {
          // Use the me API to get user details
          try {
            const meData = await getMe();
            setUser({
              id: meData.user.id,
              username: meData.user.username,
              email: meData.user.email,
              firstName: meData.user.first_name,
              lastName: meData.user.last_name,
              isActive: meData.user.is_active,
              isStaff: meData.user.is_staff,
              isSuperuser: meData.user.is_superuser,
              executiveId: meData.executive?.id || null,
              employeeId: meData.employee?.id || null,
              name: meData.executive?.name || meData.user.username,
              profilePicture: meData.executive?.profile_picture,
              role: meData.executive?.role,
            });
          } catch {
            // If me API fails, try to refresh token and try again
            try {
              const { refreshToken } = await import("@/services/auth");
              const result = await refreshToken(refreshTokenValue);
              const { setAuthCookies } = await import("@/lib/cookies");
              setAuthCookies(result.access, result.refresh || refreshTokenValue);
              
              // Try to get user details again with new token
              const meData = await getMe();
              setUser({
                id: meData.user.id,
                username: meData.user.username,
                email: meData.user.email,
                firstName: meData.user.first_name,
                lastName: meData.user.last_name,
                isActive: meData.user.is_active,
                isStaff: meData.user.is_staff,
                isSuperuser: meData.user.is_superuser,
                executiveId: meData.executive?.id || null,
                employeeId: meData.employee?.id || null,
                name: meData.executive?.name || meData.user.username,
                profilePicture: meData.executive?.profile_picture,
                role: meData.executive?.role,
              });
            } catch (refreshError) {
              // Refresh failed, user is not authenticated
              console.error("Token refresh failed:", refreshError);
              setAuthError("Session expired. Please log in again.");
              setUser(null);
            }
          }
        } else {
          // No tokens found, user is not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthError("Authentication check failed. Please try again.");
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
  }, []);

  // Add refreshAuth function
  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();
      
      if (accessToken && refreshTokenValue) {
        try {
          const meData = await getMe();
          setUser({
            id: meData.user.id,
            username: meData.user.username,
            email: meData.user.email,
            firstName: meData.user.first_name,
            lastName: meData.user.last_name,
            isActive: meData.user.is_active,
            isStaff: meData.user.is_staff,
            isSuperuser: meData.user.is_superuser,
            executiveId: meData.executive?.id || null,
            employeeId: meData.employee?.id || null,
            name: meData.executive?.name || meData.user.username,
            profilePicture: meData.executive?.profile_picture,
            role: meData.executive?.role,
          });
        } catch {
          // Token verification failed, try to refresh
          try {
            const { refreshToken } = await import("@/services/auth");
            const result = await refreshToken(refreshTokenValue);
            const { setAuthCookies } = await import("@/lib/cookies");
            setAuthCookies(result.access, result.refresh || refreshTokenValue);
            
            // Get user details with new token
            const meData = await getMe();
            setUser({
              id: meData.user.id,
              username: meData.user.username,
              email: meData.user.email,
              firstName: meData.user.first_name,
              lastName: meData.user.last_name,
              isActive: meData.user.is_active,
              isStaff: meData.user.is_staff,
              isSuperuser: meData.user.is_superuser,
              executiveId: meData.executive?.id || null,
              employeeId: meData.employee?.id || null,
              name: meData.executive?.name || meData.user.username,
              profilePicture: meData.executive?.profile_picture,
              role: meData.executive?.role,
            });
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            setAuthError("Session expired. Please log in again.");
            setUser(null);
            clearAuthCookies();
          }
        }
      }
    } catch (error) {
      console.error("Auth refresh failed:", error);
      setAuthError("Failed to refresh authentication. Please log in again.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for token updates from API client
  useEffect(() => {
    const handleTokenUpdate = () => {
      const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();
      if (accessToken && refreshTokenValue) {
        // Refresh auth when tokens are updated
        refreshAuth();
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
    setAuthError(null);
    clearAuthCookies();
    
    // Use window.location for navigation since we're in a context outside of React components
    if (typeof window !== "undefined") {
      window.location.href = ROUTES.AUTH.LOGIN;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshAuth,
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