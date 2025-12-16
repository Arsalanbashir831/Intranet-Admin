"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { UploadQueueProvider } from "@/contexts/upload-queue-context";
import { UploadQueue } from "@/components/knowledge-base/upload-queue";
import { useUploadQueue } from "@/contexts/upload-queue-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminTopbar } from "@/components/admin/layout/admin-topbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/contexts/auth-context";
import { ManagerScopeProvider } from "@/contexts/manager-scope-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MfaBanner } from "@/components/common/mfa-banner";

type AdminLayoutProps = {
  children: ReactNode;
};

function QueueMount() {
  const { items, clear, remove, collapsed, setCollapsed } = useUploadQueue();
  return <UploadQueue items={items} onClear={clear} onRemove={remove} collapsed={collapsed} setCollapsed={setCollapsed} />;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ManagerScopeProvider>
          <AuthGuard requireAuth={true}>
            <SidebarProvider>
              <AdminSidebar />
              <SidebarInset className="flex flex-col">
                <AdminTopbar />
                <MfaBanner />
                <div>
                  <UploadQueueProvider>
                    {children}
                    <QueueMount />
                  </UploadQueueProvider>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </AuthGuard>
        </ManagerScopeProvider>
        {process.env.NODE_ENV !== "production" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </AuthProvider>
    </QueryClientProvider>
  );
}


