"use client";

import type { ReactNode } from "react";
import { UploadQueueProvider } from "@/contexts/upload-queue-context";
import { UploadQueue } from "@/components/knowledge-base/upload-queue";
import { useUploadQueue } from "@/contexts/upload-queue-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminTopbar } from "@/components/admin/layout/admin-topbar";

type AdminLayoutProps = {
  children: ReactNode;
};

function QueueMount() {
  const { items, clear, remove, collapsed, setCollapsed } = useUploadQueue();
  return <UploadQueue items={items} onClear={clear} onRemove={remove} collapsed={collapsed} setCollapsed={setCollapsed} />;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
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
  );
}


