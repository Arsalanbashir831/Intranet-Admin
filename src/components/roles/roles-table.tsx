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
import { useRoles, useDeleteRole } from "@/hooks/queries/use-roles";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";
import type { Role } from "@/services/roles";
import { EditRoleModal } from "./edit-role-modal";

export type RoleRow = {
  id: string;
  name: string;
  is_manager: boolean;
  is_executive: boolean;
};

export function RolesTable() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [serverPagination, setServerPagination] = React.useState({ page: 1, pageSize: 10 });
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

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

  const { data: apiData, isLoading, error, isFetching } = useRoles(searchParams, serverPagination);
  const deleteRole = useDeleteRole();

  const data = React.useMemo<RoleRow[]>(() => {
    if (!apiData) return [];

    const roles = apiData.roles?.results || [];

    return roles.map((role: Role) => ({
      id: String(role.id),
      name: role.name,
      is_manager: role.is_manager,
      is_executive: role.is_executive,
    }));
  }, [apiData]);

  const paginationInfo = React.useMemo(() => {
    if (!apiData?.roles) return undefined;
    return {
      count: apiData.roles.count,
      page: apiData.roles.page,
      page_size: apiData.roles.page_size,
    };
  }, [apiData]);

  const { pinnedIds, togglePin } = usePinnedRows<RoleRow>(data);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    // Reset pagination when searching
    setServerPagination({ page: 1, pageSize: serverPagination.pageSize });
  }, [serverPagination.pageSize]);

  const handleEditClick = React.useCallback((e: React.MouseEvent, row: RoleRow) => {
    e.stopPropagation();
    // Find the role from API data
    const role = apiData?.roles?.results?.find((r: Role) => String(r.id) === row.id);
    if (role) {
      setSelectedRole(role);
      setEditModalOpen(true);
    }
  }, [apiData]);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = React.useMemo<ColumnDef<RoleRow>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Role Name" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-[#1D1F2C]">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "is_manager",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Is Manager" />
      ),
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"} className={getValue() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {getValue() ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "is_executive",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Is Executive" />
      ),
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"} className={getValue() ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
          {getValue() ? "Yes" : "No"}
        </Badge>
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
                title="Delete role?"
                description="This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                  const id = row.original.id;
                  try {
                    setDeletingId(id);
                    await deleteRole.mutateAsync(id);
                    toast.success("Role deleted successfully");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to delete role");
                  } finally {
                    setDeletingId(null);
                  }
                }}
                disabled={deletingId === row.original.id || deleteRole.isPending}
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
  ], [isSuperuser, deletingId, deleteRole.isPending, deleteRole, handleEditClick]);

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && !data.length) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[#667085]">Loading roles...</div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-red-600">Error loading roles: {error.message}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none", {
      "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery,
    })}>
      <CardTableToolbar
        title='Roles'
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        showSortOptions={false}
        showFilters={false}
      />
      <CardTable<RoleRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[2fr_1fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[2fr_1fr_1fr_0.8fr]"}
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
      <EditRoleModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        role={selectedRole}
      />
    </Card>
  );
}

