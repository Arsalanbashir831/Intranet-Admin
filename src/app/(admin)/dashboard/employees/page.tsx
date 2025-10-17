"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { EmployeeTable } from "@/components/org-chart/employee-table";
import { useManagerScope } from "@/contexts/manager-scope-context";
// import { ScrollArea } from "@/components/ui/scroll-area";



export default function OrgChartPage() {
  const { isLoading } = useManagerScope();
  
  // Always show "Add New Employee" button for both admins and managers
  // Managers will be restricted to their departments in the form
  
  return (
    <>
      <PageHeader
        title="Employees"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Employees", href: ROUTES.ADMIN.ORG_CHART }
        ]}
        action={
          !isLoading ? (
            <Link href={ROUTES.ADMIN.ORG_CHART_NEW}>
              <Button>
                Add New Employee
              </Button>
            </Link>
          ) : undefined
        }
      />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <EmployeeTable />
        </div>
      {/* </ScrollArea> */}
    </>
  );
}