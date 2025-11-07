import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import * as React from "react";
import { BranchDepartmentsTable } from "@/components/branches/branch-departments-table";
import { getBranch } from "@/services/branches";

interface BranchDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BranchDetailsPage({ params }: BranchDetailsPageProps) {
  const { id } = await params;
  
  // Fetch branch data to get branch name for breadcrumbs
  let branchName = "Branch";
  
  try {
    const branchData = await getBranch(id);
    branchName = branchData.branch_name;
  } catch (error) {
    console.error("Failed to fetch branch details:", error);
  }
  
  return (
    <>
      <PageHeader
        title="Branches"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Branches", href: ROUTES.ADMIN.BRANCHES },
          { label: branchName },
        ]}
      />
      <div className="px-4 md:px-12 py-4">
        <BranchDepartmentsTable branchId={id} branchName={branchName} />
      </div>
    </>
  );
}

