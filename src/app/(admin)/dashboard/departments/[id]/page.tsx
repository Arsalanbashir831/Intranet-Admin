import * as React from "react";
import { PageHeader } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { DepartmentsDetailTable } from "@/components/departments/departments-detail-table";
import { getBranchDepartmentEmployees } from "@/services/departments";

interface DepartmentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DepartmentDetailsPage({
  params,
}: DepartmentDetailsPageProps) {
  const { id } = await params;

  // Fetch initial data to get department and branch names for breadcrumbs
  let departmentName = "Department";
  let branchName = "Branch";

  try {
    const employeesData = await getBranchDepartmentEmployees(id);
    if (employeesData?.employees?.results?.[0]?.branch_department) {
      const branchDept = employeesData.employees.results[0].branch_department;
      departmentName = branchDept.department.dept_name;
      branchName = branchDept.branch.branch_name;
    }
  } catch (error) {
    // Handle error silently, will use default names
    console.error("Failed to fetch department details:", error);
  }

  return (
    <>
      <PageHeader
        title="Departments"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS },
          { label: `${departmentName} - ${branchName}` },
        ]}
      />
      <div className="px-4 md:px-12 py-4">
        <DepartmentsDetailTable
          branchDepartmentId={id}
          departmentName={departmentName}
          branchName={branchName}
        />
      </div>
    </>
  );
}
