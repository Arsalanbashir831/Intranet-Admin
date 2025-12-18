"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { ROUTES } from "@/constants/routes";
import { useEmployees, useDeleteEmployee } from "@/hooks/queries/use-employees";
import {
  useBranchDepartmentEmployees,
  useDepartmentEmployees,
} from "@/hooks/queries/use-departments";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { useRoles } from "@/hooks/queries/use-roles";
import { toast } from "sonner";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";
import { FilterDrawer } from "@/components/card-table/filter-drawer";
import {
  DepartmentFilter,
  BranchDepartmentFilter,
  RoleFilter,
} from "@/components/card-table/filter-components";

import { EmployeeRow } from "@/types/org-chart";
import {
  createRoleMap,
  transformEmployeeToRow,
} from "@/handlers/org-chart-handlers";

export function EmployeeTable() {
  const router = useRouter();
  const { isManager } = useManagerScope();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    React.useState<string>("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<Record<string, unknown>>({});

  // Fetch roles to map role IDs to names
  const { data: rolesData } = useRoles(undefined, { pageSize: 1000 });

  // Create a map of role ID to role name
  const roleMap = React.useMemo(() => {
    return createRoleMap(rolesData);
  }, [rolesData]);

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

    // Add branch filter if selected (but not if it's the "All" option)
    if (filters.branch && filters.branch !== "__all__") {
      params.branch = String(filters.branch);
    }

    // Add branch department filter if selected (but not if it's the "All" option)
    if (filters.branchDepartment && filters.branchDepartment !== "__all__") {
      params.branch_department = String(filters.branchDepartment);
    }

    // Add role filter if selected (but not if it's the "All" option)
    if (filters.role && filters.role !== "__all__") {
      params.role = String(filters.role);
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearchQuery, filters]);

  // Determine which hook to use based on filters
  const shouldUseDepartmentFilter =
    filters.department &&
    filters.department !== "__all__" &&
    String(filters.department).length > 0;

  const shouldUseBranchDepartmentFilter =
    filters.branchDepartment &&
    filters.branchDepartment !== "__all__" &&
    String(filters.branchDepartment).length > 0;

  // Use the appropriate hook based on filters
  const employeesQuery = useEmployees(
    shouldUseDepartmentFilter || shouldUseBranchDepartmentFilter
      ? undefined
      : searchParams
    // Removed managerScope parameter to prevent unwanted manager_scope=true API calls
  );

  const departmentEmployeesQuery = useDepartmentEmployees(
    shouldUseDepartmentFilter ? String(filters.department) : "",
    undefined,
    shouldUseDepartmentFilter ? searchParams : undefined
  );

  const branchDeptEmployeesQuery = useBranchDepartmentEmployees(
    shouldUseBranchDepartmentFilter ? String(filters.branchDepartment) : "",
    undefined,
    shouldUseBranchDepartmentFilter ? searchParams : undefined
  );

  // Use the appropriate query result
  const {
    data: apiData,
    isLoading,
    error,
    isFetching,
  } = shouldUseDepartmentFilter
    ? departmentEmployeesQuery
    : shouldUseBranchDepartmentFilter
    ? branchDeptEmployeesQuery
    : employeesQuery;

  const deleteEmployee = useDeleteEmployee(isManager);
  const data = React.useMemo<EmployeeRow[]>(() => {
    // Handle different data structures from different APIs
    let employeesList: unknown[] = [];

    if (shouldUseDepartmentFilter) {
      // For department employees, the data structure is different
      const employeesContainer = (
        apiData as { employees?: { results?: unknown[] } }
      )?.employees;
      employeesList =
        employeesContainer && Array.isArray(employeesContainer.results)
          ? employeesContainer.results
          : Array.isArray(apiData)
          ? apiData
          : [];
    } else if (shouldUseBranchDepartmentFilter) {
      // For branch department employees, the data structure is different
      const employeesContainer = (
        apiData as { employees?: { results?: unknown[] } }
      )?.employees;
      employeesList =
        employeesContainer && Array.isArray(employeesContainer.results)
          ? employeesContainer.results
          : Array.isArray(apiData)
          ? apiData
          : [];
    } else {
      // For regular employees query
      const employeesContainer = (
        apiData as { employees?: { results?: unknown[] } }
      )?.employees;
      employeesList =
        employeesContainer && Array.isArray(employeesContainer.results)
          ? employeesContainer.results
          : Array.isArray(apiData)
          ? apiData
          : [];
    }

    return (employeesList as unknown[]).map((e: unknown) => {
      return transformEmployeeToRow(e, roleMap);
    });
  }, [
    apiData,
    shouldUseDepartmentFilter,
    shouldUseBranchDepartmentFilter,
    roleMap,
  ]);

  const { pinnedIds, togglePin } = usePinnedRows<EmployeeRow>(data);

  const handleRowClick = React.useCallback(
    (row: { original: EmployeeRow }) => {
      router.push(ROUTES.ADMIN.ORG_CHART_PROFILE_ID(row.original.id));
    },
    [router]
  );

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleResetFilters = () => {
    setFilters({});
    setIsFilterOpen(false);
  };

  // Memoize the columns to prevent unnecessary re-renders
  const columns = React.useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
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
            <span className="text-sm font-medium text-[#1D1F2C]">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Branch/location" />
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-[#667085]">{String(getValue())}</span>
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
        accessorKey: "department",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ getValue }) => (
          <Badge
            variant="secondary"
            className="bg-[#FFF1F5] text-[#D64575] border-0">
            {String(getValue())}
          </Badge>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-[#1D1F2C]">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "reportingTo",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Reporting to" />
        ),
        cell: ({ row }) => {
          const name = row.original.reportingTo;
          if (!name || name === "--") {
            return <span className="text-sm text-[#667085]">--</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={row.original.reportingAvatar} alt={name} />
                <AvatarFallback className="text-[10px]">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-[#667085]">{name}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="text-sm font-medium text-[#727272]">Action</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span onClick={(e) => e.stopPropagation()}>
              <ConfirmPopover
                title="Delete employee?"
                description="This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                  const id = row.original.id;
                  try {
                    setDeletingId(id);
                    await deleteEmployee.mutateAsync(id);
                    toast.success("Employee deleted");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to delete employee");
                  } finally {
                    setDeletingId(null);
                  }
                }}
                disabled={
                  deletingId === row.original.id || deleteEmployee.isPending
                }>
                <Button size="icon" variant="ghost" className="text-[#D64575]">
                  <Trash2 className="size-4" />
                </Button>
              </ConfirmPopover>
            </span>
          </div>
        ),
      },
    ],
    [deletingId, deleteEmployee.isPending, pinnedIds, togglePin]
  );

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && !data.length) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[#667085]">Loading employees...</div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-red-600">
            Error loading employees: {error.message}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={cn("border-[#FFF6F6] p-5 shadow-none", {
          "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
        })}>
        <CardTableToolbar
          title="Recent Additions"
          searchValue={searchQuery}
          showSortOptions={false}
          onSearchChange={handleSearchChange}
          onFilterClick={() => setIsFilterOpen(true)}
        />
        <CardTable<EmployeeRow, unknown>
          columns={columns}
          data={data}
          headerClassName="grid-cols-[1.2fr_1fr_1.2fr_0.9fr_0.8fr_1fr_0.8fr]"
          rowClassName={() =>
            "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1.2fr_0.9fr_0.8fr_1fr_0.8fr] cursor-pointer"
          }
          onRowClick={handleRowClick}
          footer={(table) => <CardTablePagination table={table} />}
        />
      </Card>

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onReset={handleResetFilters}
        showFilterButton={false}
        title="Filter Employees"
        description="Filter employees by department, branch, or branch department">
        <div className="space-y-6 py-4">
          <DepartmentFilter
            value={(filters.department as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, department: value }))
            }
          />
          <BranchDepartmentFilter
            value={(filters.branchDepartment as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, branchDepartment: value }))
            }
          />
          <RoleFilter
            value={(filters.role as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, role: value }))
            }
          />
        </div>
      </FilterDrawer>
    </>
  );
}
