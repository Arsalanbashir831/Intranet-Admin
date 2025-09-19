"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useProfile } from "@/hooks/queries/use-profile";
import { ROUTES } from "@/constants/routes";
import { getAuthTokens, clearAuthCookies } from "@/lib/cookies";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Cookies-only
        const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();

        if (accessToken && refreshTokenValue) {
          // We have tokens, assume user is authenticated
          // The API client will handle token refresh automatically
          // Profile data will be fetched separately
          setUser({
            id: "1", // Will be updated when profile loads
            email: "loading...", // Will be updated when profile loads
            name: "Loading...", // Will be updated when profile loads
          });
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

  // Update user when profile data loads (avoid infinite loops)
  useEffect(() => {
    if (profile) {
      setUser((prev) => {
        const next = {
          id: profile.id.toString(),
          email: profile.email,
          name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
          avatar: profile.profile_picture_url,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          full_name: profile.full_name,
          role: profile.role as string,
          status: profile.status as string,
        };
        // Shallow compare key fields to prevent unnecessary state updates
        if (
          prev &&
          prev.id === next.id &&
          prev.email === next.email &&
          prev.name === next.name &&
          prev.avatar === next.avatar
        ) {
          return prev;
        }
        return next;
      });
    } else if (profileError) {
      setUser(null);
    }
  }, [profile, profileError]);

  // Listen for token updates from API client
  useEffect(() => {
    const handleTokenUpdate = () => {
      const { accessToken, refreshToken: refreshTokenValue } = getAuthTokens();
      if (accessToken && refreshTokenValue) {
        setUser({
          id: "1",
          email: "user@example.com", 
          name: "User",
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
    isLoading: isLoading || profileLoading,
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
