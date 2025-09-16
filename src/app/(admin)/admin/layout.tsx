"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { ProfileDropdown } from "@/components/admin/layout/profile-dropdown";
import { CircleQuestionMark, Search } from "lucide-react";
import { TopbarSearch } from "@/components/admin/layout/topbar-search";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <div className="">
          <div className="flex h-16 items-center gap-3 px-4">
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
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}


