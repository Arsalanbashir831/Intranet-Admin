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
} from "@/components/ui/sidebar";
import { AdminFooterMenu } from "./admin-footer-menu";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, iconSrc: "/icons/pie-chart.svg" },
  { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB, iconSrc: "/icons/building.svg" },
  { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE, iconSrc: "/icons/note-blank.svg" },
  { label: "New Hire Plan", href: ROUTES.ADMIN.NEW_HIRE_PLAN, iconSrc: "/icons/clipboard-text.svg" },
  { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS, iconSrc: "/icons/users.svg" },
  { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART, iconSrc: "/icons/user-hierarchy.svg" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="border-none">
      {/* Header on white background */}
      <SidebarHeader className="px-4 py-2.25 bg-white">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Cartwright King" width={118} height={46} priority />
        </div>
      </SidebarHeader>
      {/* Main content on brand background */}
      <SidebarContent>
        <SidebarGroup className="border-b border-[#E4E4E4] py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {NAV_ITEMS.map((item) => {
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
                            className="size-5 inline-block bg-current"
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
                          <span className="text-base">{item.label}</span>
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


