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
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col">
            <AdminTopbar />
            <div>
              <UploadQueueProvider>
                {children}
                <QueueMount />
              </UploadQueueProvider>
            </div>
        </SidebarInset>
      </SidebarProvider>
      {process.env.NODE_ENV !== "production" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}


