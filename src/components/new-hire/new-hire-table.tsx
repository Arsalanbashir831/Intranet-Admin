"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
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
import { AvatarStack } from "@/components/ui/avatar-stack";
import { useChecklists, useDeleteChecklist } from "@/hooks/queries/use-new-hire";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { components } from "@/types/api";

export type NewHireRow = {
  id: string;
  assignedTo: Array<{ id: string; name: string; avatar?: string; }>; // employee objects
  department: string;
  dateOfCreation: string;
  status: "Published" | "Draft";
  assignedBy: string;
  assignedByAvatar?: string;
};

export function NewHireTable() {
  const router = useRouter();
  const [sortedBy, setSortedBy] = React.useState<string>("dateOfCreation");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");

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

  const { data: checklistsData, isLoading, isFetching } = useChecklists(searchParams);
  const deleteChecklist = useDeleteChecklist();

  // Transform API data to table format
  const data = React.useMemo<NewHireRow[]>(() => {
    if (!checklistsData?.results) return [];

    return checklistsData.results.map((checklist: components["schemas"]["Checklist"]) => {
      // Use expanded employee data from assigned_to_details
      const assignedEmployees = checklist.assigned_to_details?.map((emp) => ({
        id: String(emp.id),
        name: emp.emp_name,
        avatar: emp.profile_picture || undefined,
      })) || [];

      // Get assigned by details
      const assignedByDetails = checklist.assigned_by_details as { emp_name?: string; profile_picture?: string } | undefined;

      // Get department name - need to extract from assigned_to_details branch_department
      const departmentName = checklist.assigned_to_details?.[0]?.branch_department ? 'Department' : 'Unknown';

      return {
        id: String(checklist.id),
        assignedTo: assignedEmployees,
        department: departmentName,
        dateOfCreation: format(new Date(checklist.created_at), 'M/d/yy'),
        status: checklist.status === 'publish' ? 'Published' as const : 'Draft' as const,
        assignedBy: assignedByDetails?.emp_name || 'Unknown',
        assignedByAvatar: assignedByDetails?.profile_picture || undefined,
      };
    });
  }, [checklistsData]);

  const { pinnedIds, togglePin, ordered } = usePinnedRows<NewHireRow>(data);

  const handleRowClick = React.useCallback((row: NewHireRow) => {
    router.push(ROUTES.ADMIN.NEW_HIRE_PLAN_EDIT_ID(row.id));
  }, [router]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteChecklist.mutateAsync(Number(id));
      toast.success('New hire plan deleted successfully');
    } catch (error) {
      console.error('Failed to delete checklist:', error);
      toast.error('Failed to delete new hire plan');
    }
  };

  // Memoize the columns to prevent unnecessary re-renders
  const columns = React.useMemo<ColumnDef<NewHireRow>[]>(() => [
    {
      accessorKey: "assignedTo",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Assigned to" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AvatarStack size={24} className="-space-x-2">
            {row.original.assignedTo.map((employee, idx) => (
              <Avatar key={idx} className="z-1">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="text-[10px] border border-primary">{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarStack>
          {row.original.assignedTo.length > 3 ? (
            <span className="text-xs text-muted-foreground">+{row.original.assignedTo.length - 3}</span>
          ) : null}
        </div>
      ),
    },
    { accessorKey: "department", header: ({ column }) => <CardTableColumnHeader column={column} title="Department" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    {
      accessorKey: "dateOfCreation",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Date of Creation" />,
      cell: ({ row }) => <span className="text-sm text-[#667085]">{row.original.dateOfCreation}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className={row.original.status === "Published" ? "bg-emerald-50 text-emerald-700 border-0" : "bg-orange-50 text-orange-700 border-0"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "assignedBy",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Assigned by" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={row.original.assignedByAvatar} alt={row.original.assignedBy} />
            <AvatarFallback className="text-[10px]">
              {row.original.assignedBy
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#667085]">{row.original.assignedBy}</span>
        </div>
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
            onClick={() => handleDelete(row.original.id)}
            disabled={deleteChecklist.isPending}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [pinnedIds, togglePin, deleteChecklist.isPending]);

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && data.length === 0) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex justify-center py-8">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none", {
      "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
    })}>
      <CardTableToolbar
        title='Recent New Hire Plan'
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        sortOptions={[
          { label: "Department", value: "department" },
          { label: "Date of Creation", value: "dateOfCreation" },
          { label: "Status", value: "status" },
          { label: "Assigned by", value: "assignedBy" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<NewHireRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[1.2fr_1fr_1fr_0.8fr_1.2fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1fr_0.8fr_1.2fr_0.8fr] cursor-pointer"}
        onRowClick={(row) => handleRowClick(row.original)}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


