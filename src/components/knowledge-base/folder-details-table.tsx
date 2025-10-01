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
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { useDeleteFolder } from "@/hooks/queries/use-knowledge-folders";
import { useDeleteFile } from "@/hooks/queries/use-knowledge-files";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";

export type FolderItemRow = {
  id: string;
  file: string;
  kind?: "folder" | "file"; // subfolder or file
  extension?: "pdf" | "doc" | "docx" | string; // for files
  createdByName?: string;
  createdByAvatar?: string;
  dateCreated?: string;
  originalId?: string; // Store the actual API ID
};

type Props = {
  title: string;
  data: FolderItemRow[];
  folderId?: number; // Add folderId for bulk upload
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onFilesUploaded?: () => void; // Callback when files are uploaded
};

export function FolderDetailsTable({ title, data, folderId, onNewFolder, onNewFile, onFilesUploaded }: Props) {
  const [sortedBy, setSortedBy] = React.useState<string>("file");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [rows, setRows] = React.useState<FolderItemRow[]>(data);
  const [accessFilter, setAccessFilter] = React.useState<string[]>([]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
  const { enqueueFiles, uploadFiles } = useUploadQueue();
  const deleteFolder = useDeleteFolder();
  const deleteFile = useDeleteFile();
  const { open: editModalOpen, setOpen: setEditModalOpen, openModal: openEditModal } = useAddFolderModal();

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort data based on search query and sort option
  React.useEffect(() => {
    let filteredData = [...data];
    
    // Apply client-side search filter
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.file.toLowerCase().includes(searchLower) ||
        item.createdByName?.toLowerCase().includes(searchLower) ||
        item.dateCreated?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filteredData.sort((a, b) => {
      const key = sortedBy as keyof FolderItemRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      return String(av).localeCompare(String(bv));
    });
    
    setRows(filteredData);
  }, [data, sortedBy, debouncedSearchQuery]);

  const handleEdit = (item: FolderItemRow) => {
    if (item.kind === "folder" && item.originalId) {
      setEditingFolderId(item.originalId);
      openEditModal();
    }
  };

  const handleEditComplete = () => {
    setEditingFolderId(null);
    setEditModalOpen(false);
    // Optionally refresh data here
  };

  const handleDelete = async (item: FolderItemRow) => {
    if (!item.originalId) return;
    
    try {
      setDeletingId(item.id);
      if (item.kind === "folder") {
        await deleteFolder.mutateAsync(item.originalId);
      } else {
        await deleteFile.mutateAsync(item.originalId);
      }
      // Remove item from local state
      setRows(prev => prev.filter(row => row.id !== item.id));
    } catch {
      // Error is handled by the mutation hooks
    } finally {
      setDeletingId(null);
    }
  };

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
  }, [title]);

  const columns: ColumnDef<FolderItemRow>[] = [
    {
      accessorKey: "file",
      header: ({ column }) => <CardTableColumnHeader column={column} title="File" />,
      cell: ({ row }) => {
        const isFolder = (row.original.kind ?? "file") === "folder";
        return (
          <div className="flex items-center gap-2">
            {isFolder ? (
              <FolderIcon className="size-5" />
            ) : (
              <FileText className="size-5" />
            )}
            <span className="text-sm text-[#1F2937] truncate">{row.original.file}</span>
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
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span onClick={(e) => e.stopPropagation()}>
            <ConfirmPopover
              title={`Delete ${row.original.kind === "folder" ? "folder" : "file"}?`}
              description={`This action cannot be undone. ${row.original.kind === "folder" ? "All files in this folder will also be deleted." : ""}`}
              confirmText="Delete"
              onConfirm={() => handleDelete(row.original)}
              disabled={deletingId === row.original.id || deleteFolder.isPending || deleteFile.isPending}
            >
              <Button size="icon" variant="ghost" className="text-[#D64575]">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmPopover>
          </span>
          {row.original.kind === "folder" && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-[#2563EB]"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.original);
              }}
            >
              <Pencil className="size-4" />
            </Button>
          )}
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
        onDrop={async (e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files || [])
            .filter((f) => /pdf$|doc$|docx$/i.test(f.name));
          if (files.length === 0) return;
          
          // If we have a folderId, use the upload queue with real API
          if (folderId) {
            uploadFiles(files, folderId, onFilesUploaded);
          } else {
            // Fallback to queue system
            enqueueFiles(files, title);
          }
        }}
      >
      <CardTableToolbar
        title={title}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
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
          } else {
            // For files, we could implement file preview/download
            // For now, we'll just log the action
            console.log('File clicked:', row.original);
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
      
      <AddFolderModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        folderId={editingFolderId ? parseInt(editingFolderId) : undefined}
        onComplete={handleEditComplete}
        isEditMode={true}
      />
    </TableContextMenu>
  );
}


