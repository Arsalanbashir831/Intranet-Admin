"use client";

import { RecentAnnouncementsTable } from "@/components/announcements/recent-announcements-table";
import type { Announcement } from "@/components/announcements/recent-announcements-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

const data: Announcement[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `${i}`,
  name: "Announcement 1",
  access: i % 3 === 0 ? "Admin Only" : "All Employees",
  date: "2024-07-26",
  type: "Policy",
  status: i % 4 === 0 ? "Draft" : "Published",
}));

export default function CompanyHubPage() {
  return (
    <>
      <PageHeader title="Company Hub" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB }]} action={<Link href={ROUTES.ADMIN.COMPANY_HUB_NEW}><Button>Add New</Button></Link>} />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-12 py-4">
          <RecentAnnouncementsTable initialData={data} />
        </div>
      </ScrollArea>
    </>
  );
}


