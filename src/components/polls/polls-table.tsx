"use client";

import * as React from "react";
import { ColumnDef, Table } from "@tanstack/react-table";
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
import { cn } from "@/lib/utils";
import { usePolls } from "@/hooks/queries/use-polls";
import type { Poll } from "@/types/polls";
import { FilterDrawer } from "@/components/card-table/filter-drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDeletePoll } from "@/hooks/queries/use-polls";
import { ConfirmPopover } from "@/components/common/confirm-popover";

// Custom Poll Type Filter Component
function PollTypeFilter({
  value,
  onValueChange,
  placeholder = "Select poll type",
}: {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="poll-type">Poll Type</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="poll-type" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Types</SelectItem>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="private">Private</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// Custom Status Filter Component
function StatusFilter({
  value,
  onValueChange,
  placeholder = "Select status",
}: {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="status" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function PollsTable({ className }: { className?: string }) {
  const router = useRouter();
  const deletePollMutation = useDeletePoll();

  // State for filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pollTypeFilter, setPollTypeFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);

  // Build query parameters
  const queryParams = React.useMemo(() => {
    const params: Record<string, string | number | boolean> = {};

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (pollTypeFilter && pollTypeFilter !== "__all__") {
      params.poll_type = pollTypeFilter;
    }

    if (statusFilter && statusFilter !== "__all__") {
      if (statusFilter === "active") {
        params.is_active = true;
        params.include_expired = false;
      } else if (statusFilter === "draft") {
        params.is_active = false;
      } else if (statusFilter === "expired") {
        params.include_expired = true;
        params.is_expired = true;
      }
    }

    return params;
  }, [searchQuery, pollTypeFilter, statusFilter]);

  const { data: pollsData, isLoading } = usePolls(queryParams, {
    page,
    pageSize,
  });

  const polls = React.useMemo(() => {
    if (!pollsData) return [];
    return pollsData.polls?.results || [];
  }, [pollsData]);

  const { togglePin, isPinned } = usePinnedRows(
    polls.map((poll) => ({ id: poll.id.toString() }))
  );

  const handleDelete = React.useCallback(
    async (id: number) => {
      try {
        await deletePollMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete poll:", error);
      }
    },
    [deletePollMutation]
  );

  const columns: ColumnDef<Poll>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
          const poll = row.original;
          return (
            <div className="space-y-1">
              <div className="font-medium">{poll.title}</div>
              {poll.subtitle && (
                <div className="text-sm text-muted-foreground">
                  {poll.subtitle}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "question",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Question" />
        ),
        cell: ({ row }) => {
          const question = row.getValue("question") as string;
          return (
            <div className="max-w-[300px] truncate" title={question}>
              {question}
            </div>
          );
        },
      },
      {
        accessorKey: "poll_type",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
          const type = row.getValue("poll_type") as string;
          const typeColors = {
            public: "bg-blue-100 text-blue-800",
            private: "bg-orange-100 text-orange-800",
          };
          return (
            <Badge
              className={cn(
                "capitalize",
                typeColors[type as keyof typeof typeColors]
              )}
            >
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const poll = row.original;
          const isExpired = poll.is_expired;
          const isActive = poll.is_active;

          if (isExpired) {
            return <Badge variant="destructive">Expired</Badge>;
          } else if (isActive) {
            return <Badge variant="default">Published</Badge>;
          } else {
            return <Badge variant="secondary">Draft</Badge>;
          }
        },
      },
      {
        accessorKey: "expires_at",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) => {
          const expiresAt = row.getValue("expires_at") as string;
          const date = new Date(expiresAt);
          return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "total_votes",
        header: ({ column }) => (
          <CardTableColumnHeader column={column} title="Votes" />
        ),
        cell: ({ row }) => {
          const votes = row.getValue("total_votes") as number;
          return <div className="text-sm font-medium">{votes}</div>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const poll = row.original;
          return (
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <ConfirmPopover
                  onConfirm={() => {
                    handleDelete(poll.id);
                  }}
                  title="Delete Poll"
                  description="Are you sure you want to delete this poll? This action cannot be undone."
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </ConfirmPopover>
              </div>
            </div>
          );
        },
      },
    ],
    [handleDelete]
  );

  const [filterOpen, setFilterOpen] = React.useState(false);

  const toolbar = (
    <CardTableToolbar
      title="Polls"
      placeholder="Search polls..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterClick={() => setFilterOpen(true)}
    />
  );

  const footer = (table: Table<Poll>) => (
    <CardTablePagination table={table} onPageChange={setPage} />
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading polls...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn("border-[#FFF6F6] p-5 shadow-none", {
        "opacity-75 pointer-events-none": isLoading, // Subtle loading state
      })}
    >
      <CardTable
        columns={columns}
        data={polls}
        className={className}
        headerClassName="grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr]"
        toolbar={toolbar}
        footer={footer}
        onRowClick={(row) =>
          router.push(ROUTES.ADMIN.POLLS_ID(row.original.id.toString()))
        }
        rowClassName={(row) =>
          cn(
            "hover:bg-[#FAFAFB] grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr] cursor-pointer",
            isPinned(row.id.toString()) && "bg-muted"
          )
        }
        wrapRow={(rowElement, row) => (
          <div key={row.id} className="relative">
            {rowElement}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                togglePin(row.original.id.toString());
              }}
            >
              {isPinned(row.original.id.toString()) ? "📌" : "📍"}
            </Button>
          </div>
        )}
      />

      <FilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Polls"
        onReset={() => {
          setPollTypeFilter("");
          setStatusFilter("");
        }}
      >
        <div className="space-y-4">
          <PollTypeFilter
            value={pollTypeFilter}
            onValueChange={setPollTypeFilter}
          />
          <StatusFilter value={statusFilter} onValueChange={setStatusFilter} />
        </div>
      </FilterDrawer>
    </Card>
  );
}
