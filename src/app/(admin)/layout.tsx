"use client";

import type { ReactNode } from "react";
import { UploadQueueProvider } from "@/contexts/upload-queue-context";
import { UploadQueue } from "@/components/knowledge-base/upload-queue";
import { useUploadQueue } from "@/contexts/upload-queue-context";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { ProfileDropdown } from "@/components/admin/layout/profile-dropdown";
import { CircleQuestionMark } from "lucide-react";
import { TopbarSearch } from "@/components/admin/layout/topbar-search";
import Link from "next/link";

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
          <div className="sticky top-0 z-10 bg-background flex h-16 items-center gap-3 px-4">
            <SidebarTrigger className="md:-ml-8 z-[10]" />
            <div className="hidden flex-1 items-center md:flex">
              <TopbarSearch />
            </div>
            <div className="ml-auto flex items-center gap-6">
              <Link
                href="/help-center"
                className="hidden items-center gap-1 md:flex text-sm text-muted-foreground hover:text-foreground"
              >
                <CircleQuestionMark className="size-4" />
                <span>Help Center</span>
              </Link>
              <ProfileDropdown />
            </div>
          </div>

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


