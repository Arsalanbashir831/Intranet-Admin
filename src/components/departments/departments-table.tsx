"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { PinRowButton } from "../card-table/pin-row-button";

export type DepartmentRow = {
  id: string;
  department: string;
  location: string;
  managerName: string;
  managerAvatar?: string;
  staffCount: number;
};

const departments: DepartmentRow[] = [
  { id: "1", department: "HR", location: "Bochum", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 492 },
  { id: "2", department: "Marketing", location: "Wuppertal", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 357 },
  { id: "3", department: "Finance", location: "Greensboro (NC)", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 738 },
  { id: "4", department: "Marketing", location: "Greensboro (NC)", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 357 },
  { id: "5", department: "Executive", location: "Hampton (VA)", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 703 },
  { id: "6", department: "Marketing", location: "Hampton (VA)", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 357 },
  { id: "7", department: "Legal", location: "Rubtsovsk,", managerName: "Albert Flores", managerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60", staffCount: 154 },
];

export function DepartmentsTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("department");
  const [data, setData] = React.useState<DepartmentRow[]>(departments);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<DepartmentRow>(data);

  React.useEffect(() => {
    const copy = [...departments];
    copy.sort((a, b) => {
      const key = sortedBy as keyof DepartmentRow;
      const av = (a[key] ?? "") as any;
      const bv = (b[key] ?? "") as any;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [departments, sortedBy]);
  const columns: ColumnDef<DepartmentRow>[] = [
    {
      accessorKey: "department",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Department" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {row.original.department}
        </Badge>
      ),
    },
    { accessorKey: "location", header: ({ column }) => <CardTableColumnHeader column={column} title="Branch/Location" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    {
      accessorKey: "managerName",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Manager" />,
      cell: ({ row }) => {
        const name = row.original.managerName;
        if (!name) {
          return <span className="text-sm text-[#667085]">--</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={row.original.managerAvatar} alt={name} />
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
    { accessorKey: "staffCount", header: ({ column }) => <CardTableColumnHeader column={column} title="Staff Count" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
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
        title="Departments"
        onSearchChange={() => { }}
        sortOptions={[
          { label: "Department", value: "department" },
          { label: "Branch/Location", value: "location" },
          { label: "Manager", value: "managerName" },
          { label: "Staff Count", value: "staffCount" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<DepartmentRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[0.9fr_1.4fr_1.2fr_0.8fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[0.9fr_1.4fr_1.2fr_0.8fr_0.8fr]"}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


