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
import { useExecutives, useDeleteExecutive } from "@/hooks/queries/use-executive-members";
import { toast } from "sonner";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";
// import type { ExecutiveMember } from "@/services/executive-members";

export type ExecutiveMemberRow = {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: string;
  city: string;
  phone: string;
};

export function ExecutiveMembersTable() {
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
  
  const { data: apiData, isLoading, error, isFetching } = useExecutives(searchParams);
  const deleteExecutive = useDeleteExecutive();
  
  const data = React.useMemo<ExecutiveMemberRow[]>(() => {
    // Handle the paginated response structure
    if (!apiData) return [];
    
    const list = apiData.results || [];
    
    return list.map((e: { id: number; name?: string; email?: string; role?: string; city?: string; phone?: string; profile_picture?: string | null }) => ({
      id: String(e.id),
      name: String(e.name ?? ""),
      email: String(e.email ?? ""),
      role: String(e.role ?? ""),
      city: String(e.city ?? ""),
      phone: String(e.phone ?? ""),
      avatar: e.profile_picture ?? undefined,
    }));
  }, [apiData]);
  
  const { pinnedIds, togglePin } = usePinnedRows<ExecutiveMemberRow>(data);

  const handleRowClick = React.useCallback((row: { original: ExecutiveMemberRow }) => {
    router.push(ROUTES.ADMIN.EXECUTIVE_MEMBERS_ID(row.original.id));
  }, [router]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Remove client-side sorting since we're using API search
  // The API should handle sorting on the server side
  React.useEffect(() => {
    // This effect can be used for additional client-side operations if needed
    // For now, we rely on the API to return sorted and filtered data
  }, [data, sortedBy]);

  // Memoize the columns to prevent unnecessary re-renders - MOVED BEFORE CONDITIONAL RETURNS
  const columns = React.useMemo<ColumnDef<ExecutiveMemberRow>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Executive Name" />
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
      accessorKey: "email",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Executive Email" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {String(getValue())}
        </Badge>
      ),
    },
    { 
      accessorKey: "city", 
      header: ({ column }) => <CardTableColumnHeader column={column} title="City" />, 
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> 
    },
    { 
      accessorKey: "phone", 
      header: ({ column }) => <CardTableColumnHeader column={column} title="Phone" />, 
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> 
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span onClick={(e) => e.stopPropagation()}>
            <ConfirmPopover
              title="Delete executive member?"
              description="This action cannot be undone."
              confirmText="Delete"
              onConfirm={async () => {
                const id = row.original.id;
                try {
                  setDeletingId(id);
                  await deleteExecutive.mutateAsync(id);
                  toast.success("Executive member deleted");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete executive member");
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id || deleteExecutive.isPending}
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
  ], [deletingId, deleteExecutive.isPending, pinnedIds, togglePin]);

  // Show loading state only on initial load (no search query and no existing data)
  if (isLoading && !debouncedSearchQuery && !data.length) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[#667085]">Loading executive members...</div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-red-600">Error loading executive members: {error.message}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none", {
      "opacity-75 pointer-events-none": isFetching && debouncedSearchQuery, // Subtle loading state
    })}>
      <CardTableToolbar
        title='Recent Additions'
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        showSortOptions={false}
        showFilters={false}
      />
      <CardTable<ExecutiveMemberRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1.2fr_1.5fr_0.8fr_0.8fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1.5fr_0.8fr_0.8fr_1fr_0.8fr] cursor-pointer"}
        onRowClick={handleRowClick}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}
