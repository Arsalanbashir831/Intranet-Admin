"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { cn } from "@/lib/utils";
import { useDepartments } from "@/hooks/queries/use-departments";
import type { Department } from "@/services/departments";
import { EditDepartmentModal } from "./edit-department-modal";

export type DepartmentRow = {
  id: string;
  department: string;
};

export function DepartmentsTable({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [serverPagination, setServerPagination] = React.useState({ page: 1, pageSize: 10 });
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);

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

  const { data: departmentsData, isLoading, error, isFetching } = useDepartments(
    searchParams,
    serverPagination
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setServerPagination({ page, pageSize });
  };

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    // Reset pagination when searching
    setServerPagination({ page: 1, pageSize: serverPagination.pageSize });
  }, [serverPagination.pageSize]);

  const handleEditClick = (row: DepartmentRow) => {
    const department = Array.isArray(departmentsData) 
      ? departmentsData.find(dept => String(dept.id) === row.id)
      : null;
    
    if (department) {
      setSelectedDepartment(department);
      setEditModalOpen(true);
    }
  };

  // Transform API data to match our UI structure
  const data: DepartmentRow[] = React.useMemo(() => {
    if (!departmentsData) return [];
    
    // Handle both array (legacy) and paginated response structure
    const departments = Array.isArray(departmentsData) 
      ? departmentsData 
      : (departmentsData as { departments?: { results?: Department[] } })?.departments?.results || [];
    
    return departments.map((dept: Department) => ({
      id: String(dept.id),
      department: dept.dept_name,
    }));
  }, [departmentsData]);

  // Get pagination info from API response if available
  const paginationInfo = React.useMemo(() => {
    if (!departmentsData) return undefined;
    
    // If it's a paginated response, extract pagination info
    if (typeof departmentsData === 'object' && 'departments' in departmentsData) {
      const paginated = departmentsData as { departments?: { count?: number; page?: number; page_size?: number } };
      if (paginated.departments) {
        return {
          count: paginated.departments.count || 0,
          page: paginated.departments.page || 1,
          page_size: paginated.departments.page_size || 10,
        };
      }
    }
    
    // Fallback for array response
    if (Array.isArray(departmentsData)) {
      return {
        count: departmentsData.length,
        page: serverPagination.page,
        page_size: serverPagination.pageSize,
      };
    }
    
    return undefined;
  }, [departmentsData, serverPagination]);

  const [tableData, setTableData] = React.useState<DepartmentRow[]>(data);
  const { ordered } = usePinnedRows<DepartmentRow>(tableData);

  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  // Show loading state only on initial load
  if (isLoading && !debouncedSearchQuery && data.length === 0) {
    return (
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading departments...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error loading departments</div>
        </div>
      </Card>
    );
  }

  const columns: ColumnDef<DepartmentRow>[] = [
    {
      accessorKey: "department",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Department" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {row.original.department}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="text-[#D64575]"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row.original);
            }}
          >
            <Edit2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className, {
        "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery,
      })}>
        <CardTableToolbar
          title='Departments'
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          showSortOptions={false}
          showFilters={false}
        />
        <CardTable<DepartmentRow, unknown>
          columns={columns}
          data={ordered}
          headerClassName="grid-cols-2"
          rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-2"}
          footer={(table) => (
            <CardTablePagination
              table={table}
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
            />
          )}
        />
      </Card>

      {selectedDepartment && (
        <EditDepartmentModal
          open={editModalOpen}
          setOpen={setEditModalOpen}
          department={selectedDepartment}
        />
      )}
    </>
  );
}
