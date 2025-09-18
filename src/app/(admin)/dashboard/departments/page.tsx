"use client";

import { DepartmentsTable } from "@/components/departments/departments-table";
import { PageHeader } from "@/components/page-header";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { useAppModalControls } from "@/components/common/app-modal";
import { NewDepartmentModal } from "@/components/departments/new-department-modal";

export default function DepartmentsPage() {
  const { open, setOpen } = useAppModalControls(false);

  return (
    <>
      <PageHeader
        title="Departments"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS },
        ]}
        action={<Button onClick={() => setOpen(true)}>Add New</Button>}
      />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <DepartmentsTable />;
        </div>
      {/* </ScrollArea> */}

        <NewDepartmentModal open={open} setOpen={setOpen} />
    </>
  );
}


