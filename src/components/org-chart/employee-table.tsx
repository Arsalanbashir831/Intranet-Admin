"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash2, Pin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { PinRowButton } from "../card-table/pin-row-button";

export type EmployeeRow = {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  email: string;
  department: string;
  role: string;
  reportingTo: string | null;
  reportingAvatar?: string;
  staffCount?: number;
};

export function EmployeeTable({ rows }: { rows: EmployeeRow[] }) {
  const [sortedBy, setSortedBy] = React.useState<string>("name");
  const [data, setData] = React.useState<EmployeeRow[]>(rows);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<EmployeeRow>(data);

  React.useEffect(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const key = sortedBy as keyof EmployeeRow;
      const av = (a[key] ?? "") as any;
      const bv = (b[key] ?? "") as any;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [rows, sortedBy]);
  const columns: ColumnDef<EmployeeRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Employee Name" />
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
    { accessorKey: "location", header: ({ column }) => <CardTableColumnHeader column={column} title="Branch/location" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    { accessorKey: "email", header: ({ column }) => <CardTableColumnHeader column={column} title="Employee Email" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    {
      accessorKey: "department",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Department" />,
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {String(getValue())}
        </Badge>
      ),
    },
    { accessorKey: "role", header: ({ column }) => <CardTableColumnHeader column={column} title="Role" />, cell: ({ getValue }) => <span className="text-sm text-[#1D1F2C]">{String(getValue())}</span> },
    {
      accessorKey: "reportingTo",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Reporting to" />,
      cell: ({ row }) => {
        const name = row.original.reportingTo;
        if (!name || name === "--") {
          return <span className="text-sm text-[#667085]">--</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={row.original.reportingAvatar} alt={name} />
              <AvatarFallback className="text-[10px]">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#667085]">{name}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-[#D64575]">
            <Trash2 className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-[#667085]">
            <EllipsisVertical className="size-4" />
          </Button>
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
          { label: "Employee Name", value: "name" },
          { label: "Branch/location", value: "location" },
          { label: "Employee Email", value: "email" },
          { label: "Department", value: "department" },
          { label: "Role", value: "role" },
          { label: "Reporting to", value: "reportingTo" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<EmployeeRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[1.2fr_1fr_1.2fr_0.9fr_0.8fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.2fr_1fr_1.2fr_0.9fr_0.8fr_1fr_0.8fr]"}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


