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
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useDepartments } from "@/hooks/queries/use-departments";
import { useBranches } from "@/hooks/queries/use-branches";
import type { Department, BranchDepartment } from "@/services/departments";
import type { Branch } from "@/services/branches";
import { EditDepartmentModal } from "./edit-department-modal";
import { FilterDrawer } from "@/components/card-table/filter-drawer";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Custom Department Filter Component for Departments Table
function DepartmentNameFilter({ 
  value, 
  onValueChange, 
  placeholder = "Select department" 
}: { 
  value?: string; 
  onValueChange: (value: string) => void; 
  placeholder?: string; 
}) {
  const { data: departmentsData, isLoading } = useDepartments({ page_size: 1000 });
  
  const departmentNames = React.useMemo(() => {
    if (!departmentsData) return [];
    // departmentsData is now directly an array of departments
    const list = Array.isArray(departmentsData) ? departmentsData : [];
    // Extract unique department names
    const names = (list as { id: number; dept_name: string }[])
      .map(dept => dept.dept_name)
      .filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
    return names;
  }, [departmentsData]);

  return (
    <div className="space-y-2">
      <Label htmlFor="department-name">Department</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="department-name" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>Loading...</SelectItem>
          ) : (
            <>
              <SelectItem value="__all__">All Departments</SelectItem>
              {departmentNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// Custom Branch Filter Component for Departments Table
function BranchNameFilter({ 
  value, 
  onValueChange, 
  placeholder = "Select branch" 
}: { 
  value?: string; 
  onValueChange: (value: string) => void; 
  placeholder?: string; 
}) {
  const { data: branchesData, isLoading } = useBranches({ page_size: 1000 });
  
  const branchNames = React.useMemo(() => {
    if (!branchesData) return [];
    const list = Array.isArray(branchesData) 
      ? branchesData 
      : (branchesData as { branches?: { results?: unknown[] } })?.branches?.results || [];
    // Extract unique branch names
    const names = (list as { id: number; branch_name: string }[])
      .map(branch => branch.branch_name)
      .filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
    return names;
  }, [branchesData]);

  return (
    <div className="space-y-2">
      <Label htmlFor="branch-name">Branch</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="branch-name" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>Loading...</SelectItem>
          ) : (
            <>
              <SelectItem value="__all__">All Branches</SelectItem>
              {branchNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export type DepartmentRow = {
  id: string;
  branchDepartmentId: string;
  department: string;
  branchLocation: string;
  managerName: string;
  staffCount: number;
};

// Type guard to check if data is from branches API
function isBranchData(data: unknown): data is import('@/services/branches').BranchListResponse {
  return (data as Record<string, unknown>) && typeof data === 'object' && 'branches' in (data as Record<string, unknown>);
}

// Type guard to check if data is from departments API
function isDepartmentData(data: unknown): data is import('@/services/departments').DepartmentListResponse {
  return (data as Record<string, unknown>) && typeof data === 'object' && 'departments' in (data as Record<string, unknown>);
}

export function DepartmentsTable({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [serverPagination, setServerPagination] = React.useState({ page: 1, pageSize: 10 });
  const [clientPagination, setClientPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<Record<string, unknown>>({});

  // Cache to store data from multiple server pages
  const [departmentCache, setDepartmentCache] = React.useState<Map<number, Department[]>>(new Map());
  const [branchCache, setBranchCache] = React.useState<Map<number, Branch[]>>(new Map());

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedBranchDepartment, setSelectedBranchDepartment] = React.useState<BranchDepartment | null>(null);

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
    
    // Add department filter if selected (but not if it's the "All" option)
    if (filters.department && filters.department !== "__all__") {
      // Use department name instead of ID for filtering
      params.dept_name = String(filters.department);
    }
    
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearchQuery, filters]);

  // Determine which API to use based on filters
  const shouldUseBranchFilter = filters.branch && 
    filters.branch !== "__all__" && 
    String(filters.branch).length > 0;

  // Use the appropriate hook based on filters
  const departmentsQuery = useDepartments(
    shouldUseBranchFilter ? undefined : searchParams,
    serverPagination
  );
  
  // When branch filter is applied, use branches API instead
  const branchesQuery = useBranches(
    shouldUseBranchFilter ? { 
      search: String(filters.branch),
      page_size: 1000 // Get all branches to process departments
    } : undefined
  );

  // Use the appropriate query result
  const { data: departmentsData, isLoading, error, isFetching } = shouldUseBranchFilter 
    ? branchesQuery 
    : departmentsQuery;

  const router = useRouter();

  // Update cache when new data arrives
  React.useEffect(() => {
    if (!shouldUseBranchFilter && departmentsData) {
      // departmentsData is now directly an array of departments
      if (Array.isArray(departmentsData)) {
        setDepartmentCache(prev => {
          const newCache = new Map(prev);
          newCache.set(serverPagination.page, departmentsData);
          return newCache;
        });
      }
    } else if (shouldUseBranchFilter && departmentsData) {
      if (isBranchData(departmentsData) && departmentsData.branches?.results) {
        setBranchCache(prev => {
          const newCache = new Map(prev);
          newCache.set(1, departmentsData.branches.results); // Branches are already filtered
          return newCache;
        });
      }
    }
  }, [departmentsData, serverPagination.page, shouldUseBranchFilter]);

  const handleServerPageChange = (page: number, pageSize: number) => {
    setServerPagination({ page, pageSize });
    // Don't reset client pagination here
  };

  const handleClientPageChange = (pageIndex: number, pageSize: number) => {
    setClientPagination({ pageIndex, pageSize });
  };

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    // Reset pagination when searching
    setClientPagination({ pageIndex: 0, pageSize: clientPagination.pageSize });
    setServerPagination({ page: 1, pageSize: serverPagination.pageSize });
    // Clear cache when searching to start fresh
    if (value.trim() !== debouncedSearchQuery.trim()) {
      setDepartmentCache(new Map());
      setBranchCache(new Map()); // Clear branch cache too
    }
  }, [clientPagination.pageSize, serverPagination.pageSize, debouncedSearchQuery]);

  const handleResetFilters = () => {
    setFilters({});
    setIsFilterOpen(false);
    // Reset pagination when resetting filters
    setClientPagination({ pageIndex: 0, pageSize: clientPagination.pageSize });
    setServerPagination({ page: 1, pageSize: serverPagination.pageSize });
    // Clear cache when resetting filters to start fresh
    setDepartmentCache(new Map());
    setBranchCache(new Map()); // Clear branch cache too
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

    if (shouldUseBranchFilter) {
      // When using branch filter, process data from branches API
      const branches = Array.from(branchCache.values()).flat();
      branches.forEach((branch) => {
        // Apply client-side filtering based on branch filter
        const shouldIncludeBranch = !filters.branch || 
          filters.branch === "__all__" || 
          (branch.branch_name && branch.branch_name.toLowerCase().includes(String(filters.branch).toLowerCase()));
          
        if (shouldIncludeBranch) {
          branch.departments?.forEach((dept) => {
            // Apply client-side filtering based on department filter
            const shouldIncludeDepartment = !filters.department || 
              filters.department === "__all__" || 
              (dept.dept_name && dept.dept_name.toLowerCase().includes(String(filters.department).toLowerCase()));
              
            if (shouldIncludeDepartment) {
              flattened.push({
                id: String(dept.id),
                branchDepartmentId: String(dept.branch_department_id),
                department: dept.dept_name || "",
                branchLocation: branch.branch_name || "",
                managerName: dept.manager?.employee?.emp_name || "--",
                staffCount: dept.employee_count,
              });
            }
          });
        }
      });
    } else {
      // Process departments from cache in order
      const sortedPages = Array.from(departmentCache.keys()).sort((a, b) => a - b);

      sortedPages.forEach(pageNum => {
        const departments = departmentCache.get(pageNum) || [];
        departments.forEach((dept) => {
          // Apply client-side filtering based on selected filters
          const shouldIncludeDepartment = !filters.department || 
            filters.department === "__all__" || 
            // Use department name for filtering instead of ID
            (dept.dept_name && dept.dept_name.toLowerCase().includes(String(filters.department).toLowerCase()));
            
          if (shouldIncludeDepartment) {
            dept.branch_departments.forEach((branchDept) => {
              // Apply client-side filtering based on branch filter
              const shouldIncludeBranch = !filters.branch || 
                filters.branch === "__all__" || 
                // Use branch name for filtering instead of ID
                (branchDept.branch.branch_name && branchDept.branch.branch_name.toLowerCase().includes(String(filters.branch).toLowerCase()));
                
              if (shouldIncludeBranch) {
                flattened.push({
                  id: String(dept.id),
                  branchDepartmentId: String(branchDept.id),
                  department: dept.dept_name,
                  branchLocation: branchDept.branch.branch_name,
                  managerName: branchDept.manager?.employee?.emp_name || "--",
                  staffCount: branchDept.employee_count,
                });
              }
            });
          }
        });
      });
    }

    return flattened;
  }, [departmentCache, branchCache, filters, shouldUseBranchFilter]);

  // Apply client-side pagination to all flattened data
  const paginatedDepartments = React.useMemo(() => {
    const startIndex = clientPagination.pageIndex * clientPagination.pageSize;
    const endIndex = startIndex + clientPagination.pageSize;
    return allFlattenedDepartments.slice(startIndex, endIndex);
  }, [allFlattenedDepartments, clientPagination]);

  // Calculate total estimated flattened rows
  const totalEstimatedRows = React.useMemo(() => {
    if (shouldUseBranchFilter) {
      // When using branch filter, count from branch cache
      const branches = Array.from(branchCache.values()).flat();
      let count = 0;
      branches.forEach((branch) => {
        count += branch.departments?.length || 0;
      });
      return count;
    } else {
      if (!departmentsData || !Array.isArray(departmentsData)) return 0;

      // Calculate average branches per department from cached data
      const totalCachedDepartments = Array.from(departmentCache.values()).reduce(
        (sum, depts) => sum + depts.length, 0
      );
      const totalCachedFlattened = allFlattenedDepartments.length;

      if (totalCachedDepartments === 0) return 0;

      const avgBranchesPerDept = totalCachedFlattened / totalCachedDepartments;
      return Math.ceil(departmentsData.length * avgBranchesPerDept);
    }
  }, [allFlattenedDepartments, departmentCache, branchCache, departmentsData, shouldUseBranchFilter]);

  // Create virtual pagination info for the flattened data
  const virtualPaginationInfo = React.useMemo(() => {
    return {
      count: totalEstimatedRows,
      page: clientPagination.pageIndex + 1,
      page_size: clientPagination.pageSize,
    };
  }, [totalEstimatedRows, clientPagination]);

  const [data, setData] = React.useState<DepartmentRow[]>(paginatedDepartments);
  const { ordered } = usePinnedRows<DepartmentRow>(data);

  React.useEffect(() => {
    setData(paginatedDepartments);
  }, [paginatedDepartments]);

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && allFlattenedDepartments.length === 0) {
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
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className, {
        "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
      })}>
        <CardTableToolbar
          title='Departments'
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          showSortOptions={false}
          onFilterClick={() => setIsFilterOpen(true)}
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
                  if (!shouldUseBranchFilter && !departmentCache.has(neededServerPage)) {
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

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onReset={handleResetFilters}
        showFilterButton={false}
        title="Filter Departments"
        description="Filter departments by department or branch"
      >
        <div className="space-y-6 py-4">
          <DepartmentNameFilter 
            value={(filters.department as string) || "__all__"} 
            onValueChange={(value: string) => setFilters(prev => ({ ...prev, department: value }))}
          />
          <BranchNameFilter 
            value={(filters.branch as string) || "__all__"} 
            onValueChange={(value: string) => setFilters(prev => ({ ...prev, branch: value }))}
          />
        </div>
      </FilterDrawer>

      <EditDepartmentModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        branchDepartment={selectedBranchDepartment}
      />
    </>
  );
}