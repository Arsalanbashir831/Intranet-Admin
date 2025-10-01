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
import { PinRowButton } from "../card-table/pin-row-button";
import { ROUTES } from "@/constants/routes";
import { useEmployees, useDeleteEmployee } from "@/hooks/queries/use-employees";
import { toast } from "sonner";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";

export type EmployeeRow = {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  email: string;
  department: string;
  role: string;
  reportingTo: string | null;
  reportingAvatar?: string;
  staffCount?: number;
};

export function EmployeeTable() {
  const router = useRouter();
  const [sortedBy, setSortedBy] = React.useState<string>("name");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  
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
  
  const { data: apiData, isLoading, error, isFetching } = useEmployees(searchParams);
  const deleteEmployee = useDeleteEmployee();
  const data = React.useMemo<EmployeeRow[]>(() => {
    const employeesContainer = (apiData as any)?.employees;
    const list = Array.isArray(employeesContainer?.results)
      ? employeesContainer.results
      : (Array.isArray(apiData) ? apiData : []);
    return (list as any[]).map((e) => ({
      id: String(e.id),
      name: String(e.emp_name ?? ""),
      avatar: e.profile_picture ?? undefined,
      location: String(e?.branch_department?.branch?.branch_name ?? ""),
      email: String(e.email ?? ""),
      department: String(e?.branch_department?.department?.dept_name ?? ""),
      role: String(e.role ?? ""),
      reportingTo: e?.branch_department?.manager?.employee?.emp_name ?? null,
      reportingAvatar: undefined,
    }));
  }, [apiData]);
  const { pinnedIds, togglePin } = usePinnedRows<EmployeeRow>(data);

  const handleRowClick = React.useCallback((row: { original: EmployeeRow }) => {
    router.push(ROUTES.ADMIN.ORG_CHART_PROFILE_ID(row.original.id));
  }, [router]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Remove client-side sorting since we're using API search
  React.useEffect(() => {
    // This effect can be used for additional client-side operations if needed
    // For now, we rely on the API to return sorted and filtered data
  }, [data, sortedBy]);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = React.useMemo<ColumnDef<EmployeeRow>[]>(() => [
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
    { accessorKey: "location", header: ({ column }) => <CardTableColumnHeader column={column} title="Branch/location" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    { accessorKey: "email", header: ({ column }) => <CardTableColumnHeader column={column} title="Employee Email" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    {
      accessorKey: "department",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Department" />,
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {String(getValue())}
        </Badge>
      ),
    },
    { accessorKey: "role", header: ({ column }) => <CardTableColumnHeader column={column} title="Role" />, cell: ({ getValue }) => <span className="text-sm text-[#1D1F2C]">{String(getValue())}</span> },
    {
      accessorKey: "reportingTo",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Reporting to" />,
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
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
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
            disabled={deletingId === row.original.id || deleteEmployee.isPending}
          >
            <Button size="icon" variant="ghost" className="text-[#D64575]">
              <Trash2 className="size-4" />
            </Button>
          </ConfirmPopover>
          </span>
          
          <PinRowButton row={row} pinnedIds={pinnedIds} togglePin={togglePin} />
        </div>
      ),
    },
  ], [deletingId, deleteEmployee.isPending, pinnedIds, togglePin]);

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
          <div className="text-sm text-red-600">Error loading employees: {error.message}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none", {
      "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
    })}>
      <CardTableToolbar
        title="Recent Additions"
        placeholder="Search employees..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        sortOptions={[
          { label: "Employee Name", value: "name" },
          { label: "Branch/location", value: "location" },
          { label: "Employee Email", value: "email" },
          { label: "Department", value: "department" },
          { label: "Role", value: "role" },
          { label: "Reporting to", value: "reportingTo" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<EmployeeRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1.2fr_1fr_1.2fr_0.9fr_0.8fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1.2fr_0.9fr_0.8fr_1fr_0.8fr] cursor-pointer"}
        onRowClick={handleRowClick}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


