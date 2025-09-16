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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminFooterMenu } from "./layout/admin-footer-menu";
import { ROUTES } from "@/constants/routes";

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
  { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART, iconSrc: "/icons/user-hierarchy.svg" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="[--sidebar-width:16rem]">
      {/* Header on white background */}
      <SidebarHeader className="px-4 bg-white">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Cartwright King" width={118} height={46} priority />
        </div>
      </SidebarHeader>
      {/* Main content on brand background */}
      <SidebarContent style={{ backgroundColor: "#D64575" }}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-white text-black"
                            : "group text-white hover:bg-white/10 hover:text-black"
                        }
                      >
                        <a className="flex items-center gap-3">
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
                        </a>
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
      <SidebarSeparator className="bg-white/70 mx-0 w-full" />
      <SidebarFooter style={{ backgroundColor: "#D64575" }}>
        <AdminFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


