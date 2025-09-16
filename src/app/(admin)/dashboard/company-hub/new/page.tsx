"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CompanyHubForm } from "@/components/company-hub/company-hub-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CompanyHubPage() {
  return (
    <>
      <PageHeader title="Company Hub" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB }, { label: "Add New", href: ROUTES.ADMIN.COMPANY_HUB_NEW }]} action={<div className="flex gap-2"><Button variant='outline' className="border-primary">Save As Draft</Button><Button>Save</Button></div>} />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-12 py-4">
          <CompanyHubForm />
        </div>
      </ScrollArea>
    </>
  );
}


