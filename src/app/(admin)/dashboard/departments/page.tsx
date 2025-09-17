import { DepartmentsTable } from "@/components/departments/departments-table";
import { PageHeader } from "@/components/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader title="Departments" crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS }]} />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-5 md:px-12 py-4">
          <DepartmentsTable />;
        </div>
      </ScrollArea>
    </>
  );
}


