import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { EmployeeTable, type EmployeeRow } from "@/components/org-chart/employee-table";
import { ScrollArea } from "@/components/ui/scroll-area";



export default function OrgChartPage() {
  return (
    <>
      <PageHeader
        title="Org Chart/Directory"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }
        ]}
        action={
          <Link href={ROUTES.ADMIN.ORG_CHART_NEW}>
            <Button className="bg-[#D64575] hover:bg-[#D64575]/90 text-white">
              Add New Employee
            </Button>
          </Link>
        }
      />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-5 md:px-12 py-4">
          <EmployeeTable />;
        </div>
      </ScrollArea>
    </>
  );
}