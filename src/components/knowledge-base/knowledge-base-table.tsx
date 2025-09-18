"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { EllipsisVertical, FolderIcon, Pencil, Trash2 } from "lucide-react";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { PinRowButton } from "@/components/card-table/pin-row-button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export type KnowledgeBaseRow = {
  id: string;
  folder: string;
  createdByName: string;
  createdByAvatar?: string;
  accessLevel: "All Employees" | "Admin Only";
  dateCreated: string; // YYYY-MM-DD
};

const rows: KnowledgeBaseRow[] = [
  {
    id: "1",
    folder: "Folder 1",
    createdByName: "Albert Flores",
    createdByAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    accessLevel: "All Employees",
    dateCreated: "2024-07-26",
  },
  {
    id: "2",
    folder: "Folder 2",
    createdByName: "Albert Flores",
    createdByAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    accessLevel: "All Employees",
    dateCreated: "2024-07-26",
  },
  {
    id: "3",
    folder: "Folder 3",
    createdByName: "Albert Flores",
    createdByAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    accessLevel: "Admin Only",
    dateCreated: "2024-07-26",
  },
];

export function KnowledgeBaseTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("folder");
  const [data, setData] = React.useState<KnowledgeBaseRow[]>(rows);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<KnowledgeBaseRow>(data);
  const router = useRouter();

  React.useEffect(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const key = sortedBy as keyof KnowledgeBaseRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (key === "dateCreated") return String(av).localeCompare(String(bv));
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [sortedBy]);

  const columns: ColumnDef<KnowledgeBaseRow>[] = [
    {
      accessorKey: "folder",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Folder" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FolderIcon className="size-5" />
          <span className="text-sm text-[#1F2937]">{row.original.folder}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdByName",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Created By" />,
      cell: ({ row }) => {
        const name = row.original.createdByName;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={row.original.createdByAvatar} alt={name} />
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
      accessorKey: "accessLevel",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Access Level" />,
      cell: ({ row }) => (
        row.original.accessLevel === "All Employees" ? (
          <Badge variant="secondary" className="bg-[#FFF1F1] text-[#D64545] border-0">All Employees</Badge>
        ) : (
          <Badge variant="secondary" className="bg-[#EEF3FF] text-[#2F5DD1] border-0">Admin Only</Badge>
        )
      ),
    },
    {
      accessorKey: "dateCreated",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Date Created" />,
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span>,
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-[#D64575]">
            <Trash2 className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-[#2563EB]">
            <Pencil className="size-4" />
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
        title="Knowledge Base"
        onSearchChange={() => { }}
        sortOptions={[
          { label: "Folder", value: "folder" },
          { label: "Created By", value: "createdByName" },
          { label: "Access Level", value: "accessLevel" },
          { label: "Date Created", value: "dateCreated" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<KnowledgeBaseRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] cursor-pointer"}
        onRowClick={(row) => router.push(ROUTES.ADMIN.KNOWLEDGE_BASE_FOLDER_ID(row.original.id))}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


