"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBranchDepartmentEmployees } from "@/hooks/queries/use-departments";
import type { BranchDepartmentEmployee } from "@/services/departments";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { format } from "date-fns";

export type DepartmentEmployeeRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  dateOfJoining?: string;
};

interface DepartmentsDetailTableProps {
  branchDepartmentId?: string;
  departmentName?: string;
  branchName?: string;
}

export function DepartmentsDetailTable({
  branchDepartmentId,
  departmentName = "Department",
  branchName = "Branch"
}: DepartmentsDetailTableProps) {
  const router = useRouter();
  const [sortedBy, setSortedBy] = React.useState<string>("name");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({ page: 1, pageSize: 10 });

  // Debounce search query to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build search params - only include search if it has a value
  const searchParams = React.useMemo(() => {
    const params: Record<string, string | number | boolean> = {};
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearchQuery]);

  const { data: employeesData, isLoading, error, isFetching } = useBranchDepartmentEmployees(
    branchDepartmentId || "",
    pagination,
    searchParams
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    // Reset pagination when searching
    setPagination({ page: 1, pageSize: pagination.pageSize });
  }, [pagination.pageSize]);

  // Transform API data to match our UI structure
  const employees: DepartmentEmployeeRow[] = React.useMemo(() => {
    if (!employeesData?.employees?.results) return [];

    return employeesData.employees.results.map((emp: BranchDepartmentEmployee) => ({
      id: String(emp.id),
      name: emp.emp_name || "N/A",
      email: emp.email || "N/A",
      role: emp.role || "N/A",
      avatar: emp.profile_picture || undefined,
      dateOfJoining: emp.hire_date || undefined,
    }));
  }, [employeesData]);

  const [data, setData] = React.useState<DepartmentEmployeeRow[]>(employees);

  React.useEffect(() => {
    setData(employees);
  }, [employees]);

  // Memoize the columns to prevent unnecessary re-renders - MOVED BEFORE CONDITIONAL RETURNS
  const columns = React.useMemo<ColumnDef<DepartmentEmployeeRow>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Employee Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback className="text-[10px]">
              {row.original.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#667085]">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Employee Email" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Role" />,
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "dateOfJoining",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Date of Joining" />,
      cell: ({ getValue }) => {
        const date = getValue() as string | undefined;
        if (!date) return <span className="text-sm text-[#667085]">N/A</span>;
        
        // Format the date for display
        try {
          return <span className="text-sm text-[#667085]">{format(new Date(date), "dd/MM/yyyy")}</span>;
        } catch {
          return <span className="text-sm text-[#667085]">{date}</span>;
        }
      },
    },
  ], []);

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && employees.length === 0) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading employees...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error loading employees</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", {
      "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
    })}>
      <CardTableToolbar
        title={`${departmentName} - ${branchName} Staff Directory`}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        sortOptions={[
          { label: "Employee Name", value: "name" },
          { label: "Employee Email", value: "email" },
          { label: "Role", value: "role" },
          { label: "Date of Joining", value: "dateOfJoining" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<DepartmentEmployeeRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1.4fr_1.6fr_0.8fr_1fr]"
        rowClassName={() => "cursor-pointer hover:bg-[#FAFAFB] grid-cols-[1.4fr_1.6fr_0.8fr_1fr]"}
        onRowClick={(row) => {
          router.push(ROUTES.ADMIN.ORG_CHART_PROFILE_ID(String(row.original.id)));
        }
        }
        footer={(table) => (
          <CardTablePagination
            table={table}
            paginationInfo={employeesData?.employees}
            onPageChange={handlePageChange}
          />
        )}
      />
    </Card>
  );
}


