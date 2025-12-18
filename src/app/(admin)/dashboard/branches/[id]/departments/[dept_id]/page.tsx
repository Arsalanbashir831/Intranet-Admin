import * as React from "react";
import { PageHeader } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { DepartmentsDetailTable } from "@/components/departments/departments-detail-table";
import { getBranch } from "@/services/branches";

interface BranchDepartmentDetailsPageProps {
  params: Promise<{
    id: string;
    dept_id: string;
  }>;
}

export default async function BranchDepartmentDetailsPage({
  params,
}: BranchDepartmentDetailsPageProps) {
  const { id, dept_id } = await params;

  // Fetch initial data to get branch and department names for breadcrumbs
  let departmentName = "Department";
  let branchName = "Branch";

  try {
    const branchData = await getBranch(id);
    branchName = branchData.branch_name;

    // Find the department in the branch
    const department = branchData.departments?.find(
      (d) => String(d.branch_department_id) === dept_id
    );
    if (department) {
      departmentName = department.dept_name;
    }
  } catch (error) {
    console.error("Failed to fetch branch/department details:", error);
  }

  return (
    <>
      <PageHeader
        title="Branches"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Branches", href: ROUTES.ADMIN.BRANCHES },
          { label: branchName, href: ROUTES.ADMIN.BRANCHES_ID(id) },
          { label: departmentName },
        ]}
      />
      <div className="px-4 md:px-12 py-4">
        <DepartmentsDetailTable
          branchDepartmentId={dept_id}
          departmentName={departmentName}
          branchName={branchName}
        />
      </div>
    </>
  );
}
