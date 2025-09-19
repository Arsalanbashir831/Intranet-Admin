import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import * as React from "react";
import { DepartmentsDetailTable } from "@/components/departments/departments-detail-table";

interface DepartmentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DepartmentDetailsPage({ params }: DepartmentDetailsPageProps) {
  const { id } = await params;
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
        <DepartmentsDetailTable departmentId={id} />
      </div>
      {/* </ScrollArea> */}
    </>
  );
}


