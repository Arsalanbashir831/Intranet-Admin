"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { AdminFooterMenu } from "./admin-footer-menu";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useMemo } from "react";

type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, iconSrc: "/icons/pie-chart.svg", description: "Overview and analytics" },
  { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB, iconSrc: "/icons/building.svg", description: "Company information and settings" },
  { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE, iconSrc: "/icons/note-blank.svg", description: "Documents and resources" },
  { label: "Polls", href: ROUTES.ADMIN.POLLS, iconSrc: "/icons/pie-chart.svg", description: "Manage polls and surveys" },
  { label: "Training Checklists", href: ROUTES.ADMIN.NEW_HIRE_PLAN, iconSrc: "/icons/clipboard-text.svg", description: "Employee onboarding plans" },
  { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS, iconSrc: "/icons/user-hierarchy.svg", description: "Department management" },
  { label: "Branches", href: ROUTES.ADMIN.BRANCHES, iconSrc: "/icons/branch.svg", description: "Branch management" },
  { label: "Employees", href: ROUTES.ADMIN.ORG_CHART, iconSrc: "/icons/users.svg", description: "Organization structure" },
  // { label: "Executive Members", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS, iconSrc: "/icons/users.svg", description: "Executive team management" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === "collapsed";
  const isAdmin = user?.isAdmin === true;

  // Filter navigation items based on user permissions
  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      // Hide Branches if user is not admin
      if (item.href === ROUTES.ADMIN.BRANCHES && !isAdmin) {
        return false;
      }
      return true;
    });
  }, [isAdmin]);

  return (
    <Sidebar collapsible="icon" className="border-none">
      {/* Header on white background */}
      <SidebarHeader className={cn("px-4 py-2.25 bg-white", isCollapsed && "px-2")}>
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.svg" 
            alt="Cartwright King" 
            width={118} 
            height={46} 
            priority 
            className="group-data-[collapsible=icon]:hidden transition-opacity"
          />
          <Image 
            src="/logo-icon.svg" 
            alt="CK" 
            width={48} 
            height={48} 
            className="hidden group-data-[collapsible=icon]:block transition-opacity !w-12 !h-12"
          />
        </div>
      </SidebarHeader>
      {/* Main content on brand background */}
      <SidebarContent>
        <SidebarGroup className="border-b border-[#E4E4E4] py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {visibleNavItems.map((item) => {
                const isActive = item.href === ROUTES.ADMIN.DASHBOARD 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          cn("py-5 rounded-[2px]",isActive
                            ? "bg-white text-black"
                            : "group text-white hover:bg-white/10 hover:text-black")
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="size-5 inline-block bg-current flex-shrink-0"
                            style={{
                              WebkitMaskImage: `url(${item.iconSrc})`,
                              maskImage: `url(${item.iconSrc})`,
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                              WebkitMaskPosition: "center",
                              maskPosition: "center",
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                            }}
                            aria-hidden
                          />
                          <span className="text-base group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Footer */}
      <SidebarSeparator className="mx-0 w-full" />
      <SidebarFooter>
        <AdminFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


