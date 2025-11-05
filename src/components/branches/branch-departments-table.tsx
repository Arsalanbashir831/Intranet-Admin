"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { useBranch } from "@/hooks/queries/use-branches";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { Branch } from "@/services/branches";

export type BranchDepartmentRow = {
  id: string;
  department: string;
  employee_count: number;
  branch_department_id: string;
};

interface BranchDepartmentsTableProps {
  branchId: string;
  branchName: string;
}

export function BranchDepartmentsTable({ branchId, branchName }: BranchDepartmentsTableProps) {
  const router = useRouter();
  const { data: branchData, isLoading, error } = useBranch(branchId);

  const data: BranchDepartmentRow[] = React.useMemo(() => {
    if (!branchData?.departments) return [];

    return branchData.departments.map((dept) => ({
      id: String(dept.id),
      department: dept.dept_name,
      employee_count: dept.employee_count,
      branch_department_id: String(dept.branch_department_id),
    }));
  }, [branchData]);

  const columns: ColumnDef<BranchDepartmentRow>[] = React.useMemo(() => [
    {
      accessorKey: "department",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {row.original.department}
        </Badge>
      ),
    },
    {
      accessorKey: "employee_count",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Employees" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading departments...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error loading departments</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
      <CardTableToolbar
        title={`${branchName} - Departments`}
        searchValue=""
        onSearchChange={() => {}}
        showSortOptions={false}
        showFilters={false}
      />
      <CardTable<BranchDepartmentRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1fr_1fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1fr_1fr] cursor-pointer"}
        onRowClick={(row) => router.push(ROUTES.ADMIN.BRANCHES_ID_DEPARTMENTS_DEPT_ID(branchId, row.original.branch_department_id))}
      />
    </Card>
  );
}

