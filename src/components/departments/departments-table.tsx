"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { PinRowButton } from "../card-table/pin-row-button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useDepartments } from "@/hooks/queries/use-departments";
import type { Department, BranchDepartment } from "@/services/departments";
import { EditDepartmentModal } from "./edit-department-modal";

export type DepartmentRow = {
  id: string;
  branchDepartmentId: string;
  department: string;
  branchLocation: string;
  managerName: string;
  staffCount: number;
};

export function DepartmentsTable({ className }: { className?: string }) {
  const [sortedBy, setSortedBy] = React.useState<string>("department");
  const [serverPagination, setServerPagination] = React.useState({ page: 1, pageSize: 10 });
  const [clientPagination, setClientPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  
  // Cache to store data from multiple server pages
  const [departmentCache, setDepartmentCache] = React.useState<Map<number, Department[]>>(new Map());
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedBranchDepartment, setSelectedBranchDepartment] = React.useState<BranchDepartment | null>(null);
  
  const { data: departmentsData, isLoading, error } = useDepartments(undefined, serverPagination);
  const router = useRouter();

  // Update cache when new data arrives
  React.useEffect(() => {
    if (departmentsData?.departments?.results) {
      setDepartmentCache(prev => {
        const newCache = new Map(prev);
        newCache.set(serverPagination.page, departmentsData.departments.results);
        return newCache;
      });
    }
  }, [departmentsData, serverPagination.page]);

  const handleServerPageChange = (page: number, pageSize: number) => {
    setServerPagination({ page, pageSize });
    // Don't reset client pagination here
  };

  const handleClientPageChange = (pageIndex: number, pageSize: number) => {
    setClientPagination({ pageIndex, pageSize });
  };

  const handleEditClick = (row: DepartmentRow) => {
    // Find the branch department from the cached data
    const allDepartments = Array.from(departmentCache.values()).flat();
    const department = allDepartments.find(dept => dept.id === Number(row.id));
    const branchDepartment = department?.branch_departments.find(
      bd => bd.id === Number(row.branchDepartmentId)
    );
    
    if (branchDepartment) {
      setSelectedBranchDepartment(branchDepartment);
      setEditModalOpen(true);
    }
  };

  // Get all cached departments and flatten them
  const allFlattenedDepartments: DepartmentRow[] = React.useMemo(() => {
    const flattened: DepartmentRow[] = [];
    
    // Process departments from cache in order
    const sortedPages = Array.from(departmentCache.keys()).sort((a, b) => a - b);
    
    sortedPages.forEach(pageNum => {
      const departments = departmentCache.get(pageNum) || [];
      departments.forEach((dept: Department) => {
        dept.branch_departments.forEach((branchDept: BranchDepartment) => {
          flattened.push({
            id: String(dept.id),
            branchDepartmentId: String(branchDept.id),
            department: dept.dept_name,
            branchLocation: branchDept.branch.branch_name,
            managerName: branchDept.manager?.full_name || "--",
            staffCount: branchDept.employee_count,
          });
        });
      });
    });
    
    return flattened;
  }, [departmentCache]);

  // Apply client-side pagination to all flattened data
  const paginatedDepartments = React.useMemo(() => {
    const startIndex = clientPagination.pageIndex * clientPagination.pageSize;
    const endIndex = startIndex + clientPagination.pageSize;
    return allFlattenedDepartments.slice(startIndex, endIndex);
  }, [allFlattenedDepartments, clientPagination]);

  // Calculate total estimated flattened rows
  const totalEstimatedRows = React.useMemo(() => {
    if (!departmentsData?.departments) return 0;
    
    // Calculate average branches per department from cached data
    const totalCachedDepartments = Array.from(departmentCache.values()).reduce(
      (sum, depts) => sum + depts.length, 0
    );
    const totalCachedFlattened = allFlattenedDepartments.length;
    
    if (totalCachedDepartments === 0) return 0;
    
    const avgBranchesPerDept = totalCachedFlattened / totalCachedDepartments;
    return Math.ceil(departmentsData.departments.count * avgBranchesPerDept);
  }, [allFlattenedDepartments, departmentCache, departmentsData]);

  // Create virtual pagination info for the flattened data
  const virtualPaginationInfo = React.useMemo(() => {
    return {
      count: totalEstimatedRows,
      page: clientPagination.pageIndex + 1,
      page_size: clientPagination.pageSize,
    };
  }, [totalEstimatedRows, clientPagination]);

  const [data, setData] = React.useState<DepartmentRow[]>(paginatedDepartments);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<DepartmentRow>(data);

  React.useEffect(() => {
    setData(paginatedDepartments);
  }, [paginatedDepartments]);

  if (isLoading) {
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
      accessorKey: "branchLocation", 
      header: ({ column }) => <CardTableColumnHeader column={column} title="Branch/Location" />, 
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> 
    },
    {
      accessorKey: "managerName",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Manager" />,
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">
          {String(getValue()) || "--"}
        </span>
      ),
    },
    { 
      accessorKey: "staffCount", 
      header: ({ column }) => <CardTableColumnHeader column={column} title="Staff Count" />, 
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> 
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
              e.stopPropagation(); // Prevent row click
              handleEditClick(row.original);
            }}
          >
            <Edit2 className="size-4" />
          </Button>

          <PinRowButton row={row} pinnedIds={pinnedIds} togglePin={togglePin} />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className)}>
        <CardTableToolbar
          title="Departments"
          onSearchChange={() => { }}
          sortOptions={[
            { label: "Department", value: "department" },
            { label: "Branch/Location", value: "branchLocation" },
            { label: "Manager", value: "managerName" },
            { label: "Staff Count", value: "staffCount" },
          ]}
          activeSort={sortedBy}
          onSortChange={(v) => setSortedBy(v)}
          onFilterClick={() => { }}
        />
        <CardTable<DepartmentRow, unknown>
          columns={columns}
          data={ordered}
          headerClassName="grid-cols-[0.8fr_1.2fr_1.0fr_0.8fr_0.8fr]"
          rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[0.8fr_1.2fr_1.0fr_0.8fr_0.8fr] cursor-pointer"}
          onRowClick={(row) => router.push(ROUTES.ADMIN.DEPARTMENTS_ID(row.original.branchDepartmentId))}
          footer={(table) => (
            <CardTablePagination 
              table={table} 
              paginationInfo={virtualPaginationInfo}
              onPageChange={(page, pageSize) => {
                const targetPageIndex = page - 1; // Convert to 0-based
                const targetStartIndex = targetPageIndex * pageSize;
                
                // Check if we have enough data in cache
                if (targetStartIndex + pageSize > allFlattenedDepartments.length) {
                  // Calculate which server page we need
                  const cachedDepartmentCount = Array.from(departmentCache.values()).reduce(
                    (sum, depts) => sum + depts.length, 0
                  );
                  const avgBranchesPerDept = allFlattenedDepartments.length / Math.max(cachedDepartmentCount, 1);
                  const neededDepartments = Math.ceil((targetStartIndex + pageSize) / avgBranchesPerDept);
                  const neededServerPage = Math.ceil(neededDepartments / serverPagination.pageSize);
                  
                  // Only fetch if we don't have this server page cached
                  if (!departmentCache.has(neededServerPage)) {
                    handleServerPageChange(neededServerPage, serverPagination.pageSize);
                  }
                }
                
                // Always update client pagination to the target page
                handleClientPageChange(targetPageIndex, pageSize);
              }}
            />
          )}
        />
      </Card>
      
      <EditDepartmentModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        branchDepartment={selectedBranchDepartment}
      />
    </>
  );
}


