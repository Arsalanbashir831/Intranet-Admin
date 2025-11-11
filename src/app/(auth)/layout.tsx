"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import RightAuthAside from "@/components/auth/right-auth-aside";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard requireAuth={false}>
        <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
					<section className="flex flex-col px-6 sm:px-8 lg:px-12 py-6 lg:py-8">
						<div className="mb-8">
							<Image src="/logo-primary.svg" alt="Company Logo" width={231} height={85} />
						</div>
						<div className="flex-1 flex items-center justify-center">
							{children}
						</div>
					</section>
					<section className="hidden lg:block">
						<RightAuthAside />
					</section>
				</div>  
        </AuthGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}
