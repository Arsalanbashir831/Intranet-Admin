"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { useBranches, useDeleteBranch } from "@/hooks/queries/use-branches";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import type { Branch } from "@/services/branches";
import { EditBranchModal } from "./edit-branch-modal";

export type BranchRow = {
  id: string;
  branch_name: string;
  employee_count: number;
  departments: string;
};

export function BranchesTable() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [serverPagination, setServerPagination] = React.useState({ page: 1, pageSize: 10 });
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);

  const isSuperuser = user?.isSuperuser === true;

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

  const { data: apiData, isLoading, error, isFetching } = useBranches(searchParams, serverPagination);
  const deleteBranch = useDeleteBranch();

  const data = React.useMemo<BranchRow[]>(() => {
    // Handle the paginated response structure
    if (!apiData) return [];

    const branches = apiData.branches?.results || [];

    return branches.map((branch: Branch) => ({
      id: String(branch.id),
      branch_name: branch.branch_name,
      employee_count: branch.employee_count,
      departments: branch.departments?.map(d => d.dept_name).join(", ") || "--",
    }));
  }, [apiData]);

  const paginationInfo = React.useMemo(() => {
    if (!apiData?.branches) return undefined;
    return {
      count: apiData.branches.count,
      page: apiData.branches.page,
      page_size: apiData.branches.page_size,
    };
  }, [apiData]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    // Reset pagination when searching
    setServerPagination({ page: 1, pageSize: serverPagination.pageSize });
  }, [serverPagination.pageSize]);

  const handleEditClick = React.useCallback((e: React.MouseEvent, row: BranchRow) => {
    e.stopPropagation();
    // Find the branch from API data
    const branch = apiData?.branches?.results?.find((b: Branch) => String(b.id) === row.id);
    if (branch) {
      setSelectedBranch(branch);
      setEditModalOpen(true);
    }
  }, [apiData]);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = React.useMemo<ColumnDef<BranchRow>[]>(() => [
    {
      accessorKey: "branch_name",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Branch Name" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-[#1D1F2C]">
          {row.original.branch_name}
        </span>
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
    {
      accessorKey: "departments",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Departments" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        isSuperuser ? (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-[#D64575]"
              onClick={(e) => handleEditClick(e, row.original)}
            >
              <Edit2 className="size-4" />
            </Button>
            <span onClick={(e) => e.stopPropagation()}>
              <ConfirmPopover
                title="Delete branch?"
                description="This action cannot be undone. All associated departments will also be affected."
                confirmText="Delete"
                onConfirm={async () => {
                  const id = row.original.id;
                  try {
                    setDeletingId(id);
                    await deleteBranch.mutateAsync(id);
                    toast.success("Branch deleted successfully");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to delete branch");
                  } finally {
                    setDeletingId(null);
                  }
                }}
                disabled={deletingId === row.original.id || deleteBranch.isPending}
              >
                <Button size="icon" variant="ghost" className="text-[#D64575]">
                  <Trash2 className="size-4" />
                </Button>
              </ConfirmPopover>
            </span>
          </div>
        ) : null
      ),
    },
  ], [isSuperuser, deletingId, deleteBranch.isPending, deleteBranch, handleEditClick]);

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && !data.length) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[#667085]">Loading branches...</div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-red-600">Error loading branches: {error.message}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none", {
      "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
    })}>
      <CardTableToolbar
        title='Branches'
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        showSortOptions={false}
        showFilters={false}
      />
      <CardTable<BranchRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1fr_1fr_2fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1fr_1fr_2fr_0.8fr] cursor-pointer"}
        onRowClick={(row) => router.push(ROUTES.ADMIN.BRANCHES_ID(row.original.id))}
        footer={(table) => (
          <CardTablePagination
            table={table}
            paginationInfo={paginationInfo}
            onPageChange={(page, pageSize) => {
              setServerPagination({ page, pageSize });
            }}
          />
        )}
      />
      <EditBranchModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        branch={selectedBranch}
      />
    </Card>
  );
}

