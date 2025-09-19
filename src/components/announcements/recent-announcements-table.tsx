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
import { PinRowButton } from "../card-table/pin-row-button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export type Announcement = {
  id: string;
  name: string;
  access: "All Employees" | "Admin Only";
  date: string; // YYYY-MM-DD
  type: string;
  status: "Published" | "Draft";
};

const announcements: Announcement[] = [
  { id: "1", name: "Announcement 1", access: "All Employees", date: "2024-07-26", type: "Policy", status: "Published" },
  { id: "2", name: "Announcement 2", access: "All Employees", date: "2024-07-26", type: "Policy", status: "Draft" },
  { id: "3", name: "Announcement 3", access: "Admin Only", date: "2024-07-26", type: "Policy", status: "Published" },
  { id: "4", name: "Announcement 4", access: "All Employees", date: "2024-07-26", type: "Policy", status: "Published" },
  { id: "5", name: "Announcement 5", access: "Admin Only", date: "2024-07-26", type: "Policy", status: "Draft" },
  { id: "6", name: "Announcement 6", access: "All Employees", date: "2024-07-26", type: "Policy", status: "Published" },
  { id: "7", name: "Announcement 7", access: "Admin Only", date: "2024-07-26", type: "Policy", status: "Draft" },
  { id: "8", name: "Announcement 8", access: "All Employees", date: "2024-07-26", type: "Policy", status: "Published" },
];

export function RecentAnnouncementsTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("name");
  const [data, setData] = React.useState<Announcement[]>(announcements);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<Announcement>(data);
  const router = useRouter();
  const handleRowClick = (row: Announcement) => {
    router.push(ROUTES.ADMIN.COMPANY_HUB_EDIT_ID(row.id));
  };

  React.useEffect(() => {
    const copy = [...announcements];
    copy.sort((a, b) => {
      const key = sortedBy as keyof Announcement;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [sortedBy]);
  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="text-sm font-medium text-[#1D1F2C]">{row.original.name}</span>,
    },
    {
      accessorKey: "access",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Access Level" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className={row.original.access === "Admin Only" ? "bg-blue-50 text-blue-700 border-0" : "bg-pink-50 text-pink-700 border-0"}>
          {row.original.access}
        </Badge>
      ),
    },
    { accessorKey: "date", header: ({ column }) => <CardTableColumnHeader column={column} title="Date Posted" /> },
    { accessorKey: "type", header: ({ column }) => <CardTableColumnHeader column={column} title="Type" /> },
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
        title="Recent Announcements"
        onSearchChange={() => {}}
        sortOptions={[
          { label: "Name", value: "name" },
          { label: "Access Level", value: "access" },
          { label: "Date Posted", value: "date" },
          { label: "Type", value: "type" },
          { label: "Status", value: "status" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
      />
      <CardTable<Announcement, unknown>
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


