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
import { PinRowButton } from "../card-table/pin-row-button";
import { AvatarStack } from "@/components/ui/avatar-stack";

export type NewHireRow = {
  id: string;
  assignedTo: string[]; // avatar urls
  department: string;
  dateOfCreation: string; // e.g., 8/25/17
  status: "Published" | "Draft";
  assignedBy: string;
  assignedByAvatar?: string;
};

const AV1 = "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60";
const AV2 = "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=60";
const AV3 = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=60";
const AV4 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60";

const newHires: NewHireRow[] = [
  { id: "1", assignedTo: [AV1, AV2, AV3, AV4], department: "HR", dateOfCreation: "8/15/17", status: "Draft", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "2", assignedTo: [AV1, AV2, AV3], department: "Marketing", dateOfCreation: "8/2/19", status: "Published", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "3", assignedTo: [AV2, AV3], department: "Finance", dateOfCreation: "5/30/14", status: "Published", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "4", assignedTo: [AV1, AV4, AV3], department: "Executive", dateOfCreation: "7/18/17", status: "Draft", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "5", assignedTo: [AV2, AV1], department: "HR", dateOfCreation: "1/15/12", status: "Draft", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "6", assignedTo: [AV3, AV1, AV2], department: "Legal", dateOfCreation: "1/31/14", status: "Published", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "7", assignedTo: [AV1, AV2], department: "Marketing", dateOfCreation: "3/4/16", status: "Draft", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "8", assignedTo: [AV1, AV2, AV3], department: "Finance", dateOfCreation: "9/4/12", status: "Published", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
  { id: "9", assignedTo: [AV4, AV2], department: "Legal", dateOfCreation: "1/28/17", status: "Draft", assignedBy: "Albert Flores", assignedByAvatar: AV1 },
];

export function NewHireTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("department");
  const [data, setData] = React.useState<NewHireRow[]>(newHires);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<NewHireRow>(data);

  React.useEffect(() => {
    const copy = [...newHires];
    copy.sort((a, b) => {
      const key = sortedBy as keyof NewHireRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [newHires, sortedBy]);
  const columns: ColumnDef<NewHireRow>[] = [
    {
      accessorKey: "assignedTo",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Assigned to" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AvatarStack size={24} className="-space-x-2">
            {row.original.assignedTo.slice(0, 3).map((src, idx) => (
              <Avatar key={idx}>
                <AvatarImage src={src} alt="assignee" />
                <AvatarFallback>U</AvatarFallback>
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
          <Button size="icon" variant="ghost" className="text-[#D64575]">
            <Trash2 className="size-4" />
          </Button>
          
          <PinRowButton row={row} pinnedIds={pinnedIds} togglePin={togglePin} />
        </div>
      ),
    },
  ];

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none">
      <CardTableToolbar
        title="Recent New Hire Plan"
        onSearchChange={() => { }}
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
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1fr_0.8fr_1.2fr_0.8fr]"}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


