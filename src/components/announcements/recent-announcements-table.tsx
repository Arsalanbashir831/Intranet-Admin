"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EllipsisVertical, Pin, Trash } from "lucide-react";

export type Announcement = {
    id: string;
    name: string;
    access: "All Employees" | "Admin Only";
    date: string;
    type: string;
    status: "Published" | "Draft";
};

function usePinnedRows<TItem extends { id: string }>(rows: TItem[]) {
    const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(new Set());

    const togglePin = React.useCallback((id: string) => {
        setPinnedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const ordered = React.useMemo(() => {
        return [...rows].sort((a, b) => {
            const ap = pinnedIds.has(a.id) ? 1 : 0;
            const bp = pinnedIds.has(b.id) ? 1 : 0;
            return bp - ap; // pinned first
        });
    }, [rows, pinnedIds]);

    return { pinnedIds, togglePin, ordered } as const;
}

export function RecentAnnouncementsTable({ initialData }: { initialData: Announcement[] }) {
    const { pinnedIds, togglePin, ordered } = usePinnedRows(initialData);

    const columns: ColumnDef<Announcement>[] = [
        { accessorKey: "name", header: ({ column }) => (<DataTableColumnHeader column={column} title="Name" />), cell: ({ row }) => <span className="font-medium">{row.original.name}</span>, size: 420 },
        {
            accessorKey: "access",
            header: ({ column }) => (<DataTableColumnHeader column={column} title="Access Level" />),
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={
                        row.original.access === "Admin Only"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-pink-50 text-pink-700 border-pink-200"
                    }
                >
                    {row.original.access}
                </Badge>
            ),
        },
        { accessorKey: "date", header: ({ column }) => (<DataTableColumnHeader column={column} title="Date Posted" />) },
        { accessorKey: "type", header: ({ column }) => (<DataTableColumnHeader column={column} title="Type" />) },
        {
            accessorKey: "status",
            header: ({ column }) => (<DataTableColumnHeader column={column} title="Status" />),
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={
                        row.original.status === "Published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                    }
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const isPinned = pinnedIds.has(row.original.id);
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-primary">
                            <Trash className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <EllipsisVertical className="size-4" />
                        </Button>
                        <Button
                            variant="link"
                            size="icon"
                            className={`text-primary hover:text-primary/80 opacity-0 transition-opacity group-hover:opacity-100 ${isPinned ? "opacity-100" : ""}`}
                            onClick={() => togglePin(row.original.id)}
                            aria-label={isPinned ? "Unpin" : "Pin"}
                            title={isPinned ? "Unpin" : "Pin"}
                        >
                            <Pin className={`size-4 rotate-45 ${isPinned ? "fill-current" : ""}`} />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
            size: 140,
        },
    ];

    return (
            <DataTable
                columns={columns}
                data={ordered}
                toolbar={(table) => (
                    <DataTableToolbar
                        tableName="Recent Announcements"
                        searchPlaceholder="Search"
                        onSearchChange={(v) => table.getColumn("name")?.setFilterValue(v)}
                        rightContent={null}
                    />
                )}
                footer={(table) => <DataTablePagination table={table} />}
                className=""
            />
    );
}


