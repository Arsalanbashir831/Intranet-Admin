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
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  useAnnouncements,
  useDeleteAnnouncement,
} from "@/hooks/queries/use-announcements";
import { AnnouncementRow } from "@/types/announcements";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { FilterDrawer } from "@/components/card-table/filter-drawer";
import { format } from "date-fns";
import {
  DepartmentFilter,
  BranchFilter,
} from "@/components/card-table/filter-components";
import { SelectFilter } from "../common/select-filter";

export function RecentAnnouncementsTable() {
  const { isManager } = useManagerScope();
  const [sortedBy, setSortedBy] = React.useState<string>("title");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    React.useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<Record<string, unknown>>({});

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build search params with filters
  const searchParams = React.useMemo(() => {
    const params: Record<string, string | number | boolean> = {};

    // Add search query
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }

    // Add include_inactive filter
    if (
      filters.includeInactive !== undefined &&
      filters.includeInactive !== "__all__"
    ) {
      params.include_inactive = filters.includeInactive === "true";
    } else {
      // Default to true to include drafts
      params.include_inactive = true;
    }

    // Add type filter
    if (filters.type && filters.type !== "__all__") {
      params.type = String(filters.type);
    }

    // Add branch filter
    if (filters.branch && filters.branch !== "__all__") {
      params.branch = String(filters.branch);
    }

    // Add department filter
    if (filters.department && filters.department !== "__all__") {
      params.department = String(filters.department);
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearchQuery, filters]);

  const { data: apiData, isFetching } = useAnnouncements(
    searchParams,
    undefined,
    {
      placeholderData: (previousData) => previousData,
      managerScope: isManager, // Pass manager scope if user is a manager
    }
  );

  const deleteAnnouncement = useDeleteAnnouncement(isManager);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const router = useRouter();

  const data = React.useMemo<AnnouncementRow[]>(() => {
    if (!apiData) return [];

    // Handle AnnouncementListResponse structure: { announcements: { results: Announcement[] } }
    const list =
      apiData.announcements && Array.isArray(apiData.announcements.results)
        ? apiData.announcements.results
        : Array.isArray(apiData)
        ? apiData
        : [];

    return (
      list as Array<{
        id: number;
        title: string;
        permitted_employees?: number[];
        permitted_branches?: number[];
        permitted_departments?: number[];
        permitted_branch_departments?: number[];
        permitted_branch_departments_details?: Array<{
          id: number;
          branch: {
            id: number;
            branch_name: string;
            location: string;
          };
          department: {
            id: number;
            dept_name: string;
          };
        }>;
        created_at: string;
        type: string;
        is_active: boolean;
      }>
    ).map((announcement) => {
      // Determine access level based on permissions
      let accessText = "All Employees";

      if (
        announcement.permitted_branch_departments &&
        announcement.permitted_branch_departments.length > 0
      ) {
        // Show generic text for branch departments
        accessText = "Specific Branch Dept";
      } else if (
        announcement.permitted_branches &&
        announcement.permitted_branches.length > 0
      ) {
        accessText = `${announcement.permitted_branches.length} Branch(es)`;
      } else if (
        announcement.permitted_departments &&
        announcement.permitted_departments.length > 0
      ) {
        accessText = `${announcement.permitted_departments.length} Department(s)`;
      } else if (
        announcement.permitted_employees &&
        announcement.permitted_employees.length > 0
      ) {
        accessText = `${announcement.permitted_employees.length} Employee(s)`;
      }

      return {
        id: String(announcement.id),
        title: String(announcement.title ?? ""),
        access: accessText,
        date: format(new Date(announcement.created_at), "dd/MM/yyyy"),
        type: announcement.type === "policy" ? "Policy" : "Announcement",
        status: announcement.is_active ? "Published" : "Draft",
      };
    });
  }, [apiData]);

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

  const handleResetFilters = () => {
    setFilters({});
    setIsFilterOpen(false);
  };

  const columns: ColumnDef<AnnouncementRow>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-[#1D1F2C]">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "access",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Access Level" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.access === "All Employees"
              ? "bg-pink-50 text-pink-700 border-0"
              : "bg-blue-50 text-blue-700 border-0"
          }>
          {row.original.access}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Date Posted" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.status === "Published"
              ? "bg-emerald-50 text-emerald-700 border-0"
              : "bg-orange-50 text-orange-700 border-0"
          }>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => (
        <span className="text-sm font-medium text-[#727272]">Action</span>
      ),
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
              disabled={
                deletingId === row.original.id || deleteAnnouncement.isPending
              }>
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
        onFilterClick={() => setIsFilterOpen(true)}
        className={cn(isFetching && "opacity-70")}
      />
      <CardTable<AnnouncementRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1.2fr_1fr_1.1fr_0.9fr_0.9fr_0.8fr]"
        rowClassName={() =>
          "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1.1fr_0.9fr_0.9fr_0.8fr] cursor-pointer"
        }
        onRowClick={(row) => handleRowClick(row.original)}
        footer={(table) => <CardTablePagination table={table} />}
      />

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onReset={handleResetFilters}
        showFilterButton={false}
        title="Filter Announcements"
        description="Filter announcements by various criteria">
        <div className="space-y-6 py-4">
          <SelectFilter
            label="Status"
            value={(filters.includeInactive as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, includeInactive: value }))
            }
            options={[
              { value: "__all__", label: "All Statuses" },
              { value: "true", label: "Include Drafts" },
              { value: "false", label: "Published Only" },
            ]}
          />
          <SelectFilter
            label="Type"
            value={(filters.type as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
            options={[
              { value: "__all__", label: "All Types" },
              { value: "announcement", label: "Announcement" },
              { value: "policy", label: "Policy" },
            ]}
          />
          <BranchFilter
            value={(filters.branch as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, branch: value }))
            }
          />
          <DepartmentFilter
            value={(filters.department as string) || "__all__"}
            onValueChange={(value: string) =>
              setFilters((prev) => ({ ...prev, department: value }))
            }
          />
        </div>
      </FilterDrawer>
    </Card>
  );
}
