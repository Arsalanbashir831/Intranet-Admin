"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { OrgChartForm } from "@/components/org-chart/org-chart-form";
// import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function NewOrgChartPage() {
  let submitFn: (() => void) | null = null;

  return (
    <>
      <PageHeader
        title="Org Chart/Directory"
        crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }, { label: "Add New", href: ROUTES.ADMIN.ORG_CHART_NEW }]}
        action={
          <div className="flex gap-2">
            <Button onClick={() => submitFn?.()}>Save</Button>
          </div>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <OrgChartForm onRegisterSubmit={(fn) => { submitFn = fn; }} />
      </div>
    </>
  );
}


