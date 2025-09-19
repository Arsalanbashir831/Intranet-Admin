"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CompanyHubForm, CompanyHubInitialData } from "@/components/company-hub/company-hub-form";
import { useParams } from "next/navigation";
import * as React from "react";

export default function CompanyHubEditPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";

  // Mock: load data by id. Replace with real fetch later
  const [initialData, setInitialData] = React.useState<CompanyHubInitialData | null>(null);
  React.useEffect(() => {
    // simulate fetched data
    setInitialData({
      type: "announcement",
      title: `Announcement ${id}`,
      tags: "#policy #notice",
      viewAccessDepartmentIds: ["1", "3"],
      postedBy: "Michael James",
      description: `<p class=""><mark data-color="#FFFF00" style="background-color: rgb(255, 255, 0); color: inherit;">Previously saved rich text content here...</mark></p><p><br class="ProseMirror-trailingBreak"></p>`,
    });
  }, [id]);

  return (
    <>
      <PageHeader
        title="Company Hub"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB },
          { label: "Edit", href: ROUTES.ADMIN.COMPANY_HUB_EDIT_ID(id) },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary">Save As Draft</Button>
            <Button>Save</Button>
          </div>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <CompanyHubForm initialData={initialData ?? undefined} />
      </div>
    </>
  );
}


