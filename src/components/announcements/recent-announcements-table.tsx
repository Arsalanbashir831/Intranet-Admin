"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAnnouncements, useDeleteAnnouncement } from "@/hooks/queries/use-announcements";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmPopover } from "@/components/common/confirm-popover";

export type AnnouncementRow = {
  id: string;
  title: string;
  access: string;
  date: string;
  type: string;
  status: "Published" | "Draft";
};

export function RecentAnnouncementsTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("title");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  
  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use search parameters when there's a search query
  const searchParams = React.useMemo(() => ({
    search: debouncedSearchQuery,
  }), [debouncedSearchQuery]);

  const { data: apiData, isFetching } = useAnnouncements(
    debouncedSearchQuery ? searchParams : undefined,
    undefined,
    {
      placeholderData: (previousData) => previousData,
    }
  );
      
  const deleteAnnouncement = useDeleteAnnouncement();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const router = useRouter();

  const data = React.useMemo<AnnouncementRow[]>(() => {
    // Handle AnnouncementListResponse structure: { announcements: { results: Announcement[] } }
    const list = Array.isArray(apiData?.announcements?.results)
      ? apiData.announcements.results
      : (Array.isArray(apiData) ? apiData : []);
    
    return (list as Array<{
      id: number;
      title: string;
      permitted_employees?: number[];
      permitted_branches?: number[];
      permitted_departments?: number[];
      created_at: string;
      type: string;
      is_active: boolean;
    }>).map((announcement) => ({
      id: String(announcement.id),
      title: String(announcement.title ?? ""),
      access: announcement.permitted_employees?.length === 0 && 
               announcement.permitted_branches?.length === 0 && 
               announcement.permitted_departments?.length === 0 
        ? "All Employees" 
        : "Restricted Access",
      date: new Date(announcement.created_at).toLocaleDateString(),
      type: announcement.type === "policy" ? "Policy" : "Announcement",
      status: announcement.is_active ? "Published" : "Draft",
    }));
  }, [apiData]);

  const { pinnedIds, togglePin, ordered } = usePinnedRows<AnnouncementRow>(data);

  const handleRowClick = (row: AnnouncementRow) => {
    // Navigate to company hub edit page for announcements
    router.push(ROUTES.ADMIN.COMPANY_HUB_EDIT_ID(row.id));
  };

  React.useEffect(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const key = sortedBy as keyof AnnouncementRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
  }, [data, sortedBy]);
  const columns: ColumnDef<AnnouncementRow>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => <span className="text-sm font-medium text-[#1D1F2C]">{row.original.title}</span>,
    },
    {
      accessorKey: "access",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Access Level" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className={row.original.access === "Restricted Access" ? "bg-blue-50 text-blue-700 border-0" : "bg-pink-50 text-pink-700 border-0"}>
          {row.original.access}
        </Badge>
      ),
    },
    { 
      accessorKey: "date", 
      header: ({ column }) => <CardTableColumnHeader column={column} title="Date Posted" />,
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span>
    },
    { 
      accessorKey: "type", 
      header: ({ column }) => <CardTableColumnHeader column={column} title="Type" />,
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span>
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
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span onClick={(e) => e.stopPropagation()}>
            <ConfirmPopover
              title="Delete announcement?"
              description="This action cannot be undone."
              confirmText="Delete"
              onConfirm={async () => {
                const id = row.original.id;
                try {
                  setDeletingId(id);
                  await deleteAnnouncement.mutateAsync(id);
                  toast.success("Announcement deleted");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete announcement");
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id || deleteAnnouncement.isPending}
            >
              <Button size="icon" variant="ghost" className="text-[#D64575]">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmPopover>
          </span>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none">
      <CardTableToolbar
        title="Recent Announcements"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        sortOptions={[
          { label: "Title", value: "title" },
          { label: "Access Level", value: "access" },
          { label: "Date Posted", value: "date" },
          { label: "Type", value: "type" },
          { label: "Status", value: "status" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        className={cn(isFetching && "opacity-70")}
      />
      <CardTable<AnnouncementRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[1.2fr_1fr_1.1fr_0.9fr_0.9fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1.1fr_0.9fr_0.9fr_0.8fr] cursor-pointer"}
        onRowClick={(row) => handleRowClick(row.original)}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


