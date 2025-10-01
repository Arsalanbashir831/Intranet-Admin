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
import { FolderIcon, Trash2, Pencil } from "lucide-react";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { PinRowButton } from "@/components/card-table/pin-row-button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useGetAllFolders, useDeleteFolder, useSearchFolders } from "@/hooks/queries/use-knowledge-folders";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { KnowledgeFolder } from "@/services/knowledge-folders";
import { format } from "date-fns";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";

export type KnowledgeBaseRow = {
  id: string;
  folder: string;
  createdByName: string;
  createdByAvatar?: string;
  accessLevel: "Department Level" | "Employees Level" | "Admin Level";
  dateCreated: string; // YYYY-MM-DD
  originalData: KnowledgeFolder;
};



// Helper function to determine access level from permissions
const getAccessLevel = (folder: KnowledgeFolder): "Department Level" | "Employees Level" | "Admin Level" => {
  // If permitted_departments have values then show department level
  if (folder.permitted_departments && folder.permitted_departments.length > 0) {
    return "Department Level";
  }
  // If permitted_employees have values then show employees level
  if (folder.permitted_employees && folder.permitted_employees.length > 0) {
    return "Employees Level";
  }
  // If both are empty then show admin level
  return "Admin Level";
};

// Helper function to transform API data to table row format
const transformFolderToRow = (folder: KnowledgeFolder): KnowledgeBaseRow => {
  return {
    id: folder.id.toString(),
    folder: folder.name,
    createdByName: "Admin", // TODO: Replace with actual creator name when available
    createdByAvatar: undefined,
    accessLevel: getAccessLevel(folder),
    dateCreated: format(new Date(folder.created_at), "yyyy-MM-dd"),
    originalData: folder,
  };
};

export function KnowledgeBaseTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("folder");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  
  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use search API when there's a search query, otherwise use regular API
  const searchParams = React.useMemo(() => ({
    search: debouncedSearchQuery,
  }), [debouncedSearchQuery]);

  const { data: foldersData, isLoading, error, isFetching } = debouncedSearchQuery
    ? useSearchFolders(searchParams)
    : useGetAllFolders();
      
  const deleteFolder = useDeleteFolder();
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
  const { open: editModalOpen, setOpen: setEditModalOpen, openModal: openEditModal } = useAddFolderModal();

  // Transform API data to table format
  const apiData = React.useMemo(() => {
    if (!foldersData?.folders.results) return [];
    return foldersData.folders.results.map(transformFolderToRow);
  }, [foldersData]);

  // Apply sorting
  const [data, setData] = React.useState<KnowledgeBaseRow[]>([]);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<KnowledgeBaseRow>(data);

  React.useEffect(() => {
    const copy = [...apiData];
    copy.sort((a, b) => {
      const key = sortedBy as keyof KnowledgeBaseRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (key === "dateCreated") return String(av).localeCompare(String(bv));
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [sortedBy, apiData]);

  const handleDeleteFolder = async (folderId: string) => {
    try {
      setDeletingId(folderId);
      await deleteFolder.mutateAsync(folderId);
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (row: KnowledgeBaseRow) => {
    setEditingFolderId(row.id);
    openEditModal();
  };

  const handleEditComplete = () => {
    setEditingFolderId(null);
    setEditModalOpen(false);
    // Data will be automatically refresed via React Query invalidation
  };

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
      cell: ({ row }) => {
        const accessLevel = row.original.accessLevel;
        if (accessLevel === "Department Level") {
          return (
            <Badge variant="secondary" className="bg-[#FFF1F1] text-[#D64545] border-0">
              Department Level
            </Badge>
          );
        } else if (accessLevel === "Employees Level") {
          return (
            <Badge variant="secondary" className="bg-[#EEF3FF] text-[#2F5DD1] border-0">
              Employees Level
            </Badge>
          );
        } else {
          return (
            <Badge variant="secondary" className="bg-[#F0FDF4] text-[#166534] border-0">
              Admin Level
            </Badge>
          );
        }
      },
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
          <span onClick={(e) => e.stopPropagation()}>
            <ConfirmPopover
              title="Delete folder?"
              description="This action cannot be undone. All files in this folder will also be deleted."
              confirmText="Delete"
              onConfirm={() => handleDeleteFolder(row.original.id)}
              disabled={deletingId === row.original.id || deleteFolder.isPending}
            >
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-[#D64575]"
              >
                <Trash2 className="size-4" />
              </Button>
            </ConfirmPopover>
          </span>
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
          <PinRowButton row={row} pinnedIds={pinnedIds} togglePin={togglePin} />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="text-center py-8 text-red-600">
          Error loading folders: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none">
      <CardTableToolbar
        title="Knowledge Base"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        sortOptions={[
          { label: "Folder", value: "folder" },
          { label: "Created By", value: "createdByName" },
          { label: "Access Level", value: "accessLevel" },
          { label: "Date Created", value: "dateCreated" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
        className={cn(isFetching && "opacity-70")}
      />
      <CardTable<KnowledgeBaseRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] cursor-pointer"}
        onRowClick={(row) => router.push(ROUTES.ADMIN.KNOWLEDGE_BASE_FOLDER_ID(row.original.id))}
        footer={(table) => <CardTablePagination table={table} />}
      />
      
      <AddFolderModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        folderId={editingFolderId ? parseInt(editingFolderId) : undefined}
        onComplete={handleEditComplete}
        isEditMode={true}
      />
    </Card>
  );
}


