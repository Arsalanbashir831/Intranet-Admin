"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const cookies = typeof document !== "undefined" ? document.cookie.split(';') : [];
    const tokenCookie = cookies.find((c) => c.trim().startsWith('accessToken='));
    const accessToken = tokenCookie ? tokenCookie.split('=')[1] : null;
    
    if (accessToken) {
      // User is authenticated, redirect to dashboard
      router.push(ROUTES.ADMIN.DASHBOARD);
    } else {
      // User is not authenticated, redirect to login
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
