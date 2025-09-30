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
  const { data: apiData } = useExecutives();
  const deleteExecutive = useDeleteExecutive();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  
  const data = React.useMemo<ExecutiveMemberRow[]>(() => {
    const executivesContainer = (apiData as any)?.executives;
    const list = Array.isArray(executivesContainer?.results)
      ? executivesContainer.results
      : (Array.isArray(apiData) ? apiData : (apiData?.results ?? []));
    
    return (list as any[]).map((e) => ({
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

  const handleRowClick = (row: { original: ExecutiveMemberRow }) => {
    router.push(ROUTES.ADMIN.EXECUTIVE_MEMBERS_ID(row.original.id));
  };

  React.useEffect(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const key = sortedBy as keyof ExecutiveMemberRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
  }, [data, sortedBy]);

  const columns: ColumnDef<ExecutiveMemberRow>[] = [
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
  ];

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none">
      <CardTableToolbar
        title="Recent Additions"
        onSearchChange={() => { }}
        sortOptions={[
          { label: "Executive Name", value: "name" },
          { label: "Executive Email", value: "email" },
          { label: "Role", value: "role" },
          { label: "City", value: "city" },
          { label: "Phone", value: "phone" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
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
