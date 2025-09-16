"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { OrgChartForm } from "@/components/org-chart/org-chart-form";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function NewOrgChartPage() {
  return (
    <>
      <PageHeader title="Org Chart/Directory" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }, { label: "Add New", href: ROUTES.ADMIN.ORG_CHART_NEW }]} action={<div className="flex gap-2"><Button variant='outline' className="border-primary">Save As Draft</Button><Button>Save</Button></div>} />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-12 py-4">
          <OrgChartForm />
        </div>
      </ScrollArea>
    </>
  );
}


