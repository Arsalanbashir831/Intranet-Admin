"use client";

import { DepartmentsTable } from "@/components/departments/departments-table";
import { PageHeader } from "@/components/common";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { useAppModalControls } from "@/components/common/app-modal";
import { NewDepartmentModal } from "@/components/departments/new-department-modal";
import { useManagerScope } from "@/contexts/manager-scope-context";

export default function DepartmentsPage() {
  const { open, setOpen } = useAppModalControls(false);
  const { isManager, isLoading } = useManagerScope();
  
  // Hide "Add New" button for managers - only admins can create departments
  const showAddButton = !isManager;

  return (
    <>
      <PageHeader
        title="Departments"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS },
        ]}
        action={
          !isLoading && showAddButton ? (
            <Button onClick={() => setOpen(true)}>Add New</Button>
          ) : undefined
        }
      />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <DepartmentsTable />
        </div>
      {/* </ScrollArea> */}

        <NewDepartmentModal open={open} setOpen={setOpen} />
    </>
  );
}


