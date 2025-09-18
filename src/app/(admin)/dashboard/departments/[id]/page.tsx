import { PageHeader } from "@/components/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/ui/card";
import * as React from "react";
import { DepartmentsDetailTable } from "@/components/departments/departments-detail-table";

export default function DepartmentDetailsPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageHeader
        title="Departments"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS },
          { label: "Marketing" },
        ]}
      />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
            <DepartmentsDetailTable />
        </div>
        {/* </ScrollArea> */}
    </>
  );
}


