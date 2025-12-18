"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/constants/routes";
import { AuthGuardProps } from "@/types/auth";

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = ROUTES.AUTH.LOGIN,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    // If we've already checked auth and the user is authenticated, we're done
    if (authChecked) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      // Try to refresh auth first before redirecting
      refreshAuth()
        .then(() => {
          setAuthChecked(true);
          if (!isAuthenticated) {
            router.push(redirectTo);
          }
        })
        .catch(() => {
          router.push(redirectTo);
        });
    } else if (!requireAuth && isAuthenticated) {
      // User is authenticated but shouldn't be on auth pages
      router.push(ROUTES.ADMIN.DASHBOARD);
    } else {
      // Auth state is consistent with requirements
      setAuthChecked(true);
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectTo,
    router,
    refreshAuth,
    authChecked,
  ]);

  // Show loading while checking auth
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
