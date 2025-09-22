"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { AccessLevelDropdown } from "@/components/card-table/access-level-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, Folder as FolderIcon, FileText } from "lucide-react";
import { TableContextMenu, RowContextMenu } from "@/components/knowledge-base/row-context-menus";
import { useUploadQueue } from "@/contexts/upload-queue-context";

export type FolderItemRow = {
  id: string;
  file: string;
  kind?: "folder" | "file"; // subfolder or file
  extension?: "pdf" | "doc" | "docx" | string; // for files
  createdByName?: string;
  createdByAvatar?: string;
  dateCreated?: string;
};

type Props = {
  title: string;
  data: FolderItemRow[];
  onNewFolder?: () => void;
  onNewFile?: () => void;
};

export function FolderDetailsTable({ title, data, onNewFolder, onNewFile }: Props) {
  const [sortedBy, setSortedBy] = React.useState<string>("file");
  const [rows, setRows] = React.useState<FolderItemRow[]>(data);
  const [accessFilter, setAccessFilter] = React.useState<string[]>([]);
  const { enqueueFiles } = useUploadQueue();

  React.useEffect(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const key = sortedBy as keyof FolderItemRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      return String(av).localeCompare(String(bv));
    });
    setRows(copy);
  }, [data, sortedBy]);

  // Listen to global queue to add finished items to table
  React.useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<{ id: string; name: string; targetPath?: string }>).detail;
      if (!item) return;
      // Only add to this table if it matches current folder title or no path provided
      if (!item.targetPath || item.targetPath === title) {
        setRows((prev) => [
          ...prev,
          { id: item.id, file: item.name, kind: "file", extension: item.name.split('.').pop()?.toLowerCase(), createdByName: "You", dateCreated: new Date().toISOString().slice(0, 10) },
        ]);
      }
    };
    window.addEventListener("kb:queue-finished-item", handler);
    return () => window.removeEventListener("kb:queue-finished-item", handler);
  }, []);

  const columns: ColumnDef<FolderItemRow>[] = [
    {
      accessorKey: "file",
      header: ({ column }) => <CardTableColumnHeader column={column} title="File" />,
      cell: ({ row }) => {
        const isFolder = (row.original.kind ?? "file") === "folder";
        const ext = (row.original.extension || "").toLowerCase();
        return (
          <div className="flex items-center gap-2">
            {isFolder ? (
              <FolderIcon className="size-4 text-[#475569]" />
            ) : (
              <FileText className="size-4 text-[#475569]" />
            )}
            <span className="text-sm text-[#1F2937] truncate">{row.original.file}</span>
            {!isFolder && ext ? (
              <span
                className={
                  "ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium " +
                  (ext === "pdf"
                    ? "bg-[#FEE2E2] text-[#B91C1C]"
                    : "bg-[#DBEAFE] text-[#1D4ED8]")
                }
              >
                {ext.toUpperCase()}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "createdByName",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Created By" />,
      cell: ({ row }) => {
        const name = row.original.createdByName;
        if (!name) return <span className="text-sm text-[#667085]">--</span>;
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
      accessorKey: "dateCreated",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Date Created" />,
      cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue() || "--")}</span>,
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: () => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-[#D64575]">
            <Trash2 className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-[#2563EB]">
            <Pencil className="size-4" />
          </Button>
          
        </div>
      ),
    },
  ];

  return (
    <TableContextMenu onNewFolder={onNewFolder} onNewFile={onNewFile}>
      <Card
        className="border-[#FFF6F6] p-5 shadow-none hover:bg-[#fffbfd]"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files || [])
            .filter((f) => /pdf$|doc$|docx$/i.test(f.name));
          if (files.length === 0) return;
          enqueueFiles(files, title);
        }}
      >
      <CardTableToolbar
        title={title}
        onSearchChange={() => {}}
        sortOptions={[{ label: "File", value: "file" }, { label: "Created By", value: "createdByName" }, { label: "Date Created", value: "dateCreated" }]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => {}}
        accessControl={<AccessLevelDropdown
          items={[
            { label: "Elanor Pera", value: "elanor" },
            { label: "Chantal Shelburne", value: "chantal" },
            { label: "Georgette Strobel", value: "georgette" },
            { label: "Charolette Hanlin", value: "charolette" },
          ]}
          selected={accessFilter}
          onChange={setAccessFilter}
        />}
      />
      <CardTable<FolderItemRow, unknown>
        columns={columns}
        data={rows}
        headerClassName="grid-cols-[1.4fr_1fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1fr_1fr_0.8fr] cursor-pointer"}
        wrapRow={(rowEl, row) => (
          <RowContextMenu
            key={row.id}
            onRename={() => {}}
            onDelete={() => {}}
          >
            {rowEl}
          </RowContextMenu>
        )}
        onRowClick={(row) => {
          const isFolder = (row.original.kind ?? "file") === "folder";
          if (isFolder) {
            // Emit a custom event for the consumer to navigate
            const event = new CustomEvent("kb:open-folder", { detail: row.original });
            window.dispatchEvent(event);
          }
        }}
        footer={() => null}
        noResultsContent={(
          <div className="text-center">
            <div className="text-[13px] font-medium text-[#111827]">This folder is empty</div>
            <div className="text-[11px] text-[#6B7280]">Drag and drop files onto this window to upload</div>
          </div>
        )}
      />
      </Card>
    </TableContextMenu>
  );
}


