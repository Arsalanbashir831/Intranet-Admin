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
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useGetFolderTree, useDeleteFolder } from "@/hooks/queries/use-knowledge-folders"; // Added useDeleteFolder
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { format } from "date-fns";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";

// Types for folder tree data
type FolderTreeFile = {
  id: number;
  folder: number;
  name: string;
  description: string;
  file: string;
  file_url: string;
  inherits_parent_permissions: boolean;
  permitted_branches: number[];
  permitted_departments: number[];
  permitted_employees: number[];
  uploaded_by: number | null;
  uploaded_at: string;
  size: number;
  content_type: string;
  effective_permissions: {
    branches: number[];
    departments: number[];
    employees: number[];
  };
};

type FolderTreeItem = {
  id: number;
  name: string;
  description: string;
  parent: number | null;
  inherits_parent_permissions: boolean;
  effective_permissions: {
    branches: number[];
    departments: number[];
    employees: number[];
  };
  files: FolderTreeFile[];
  folders: FolderTreeItem[];
  created_at?: string;
};

export type KnowledgeBaseRow = {
  id: string;
  folder: string;
  createdByName: string;
  createdByAvatar?: string;
  accessLevel: "Specific Departments" | "Specific Branches" | "Specific Employees" | "All Employees";
  dateCreated: string; // YYYY-MM-DD
  originalData: FolderTreeItem; // Changed to FolderTreeItem
};

// Helper function to determine access level from permissions
const getAccessLevel = (folder: FolderTreeItem): "Specific Departments" | "Specific Branches" | "Specific Employees" | "All Employees" => {
  // Check branches first
  if (folder.effective_permissions.branches && folder.effective_permissions.branches.length > 0) {
    return "Specific Branches";
  }
  // Check departments
  if (folder.effective_permissions.departments && folder.effective_permissions.departments.length > 0) {
    return "Specific Departments";
  }
  // Check employees
  if (folder.effective_permissions.employees && folder.effective_permissions.employees.length > 0) {
    return "Specific Employees";
  }
  // If all are empty, it's accessible to all employees
  return "All Employees";
};

// Helper function to transform API data to table row format
const transformFolderToRow = (folder: FolderTreeItem): KnowledgeBaseRow => {
  return {
    id: folder.id.toString(),
    folder: folder.name,
    createdByName: "Admin", // TODO: Replace with actual creator name when available
    createdByAvatar: undefined,
    accessLevel: getAccessLevel(folder),
    dateCreated: folder.created_at ? format(new Date(folder.created_at), "yyyy-MM-dd") : "Unknown",
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

  // Use folder tree API instead of folders list
  const { data: folderTreeData, isFetching, error } = useGetFolderTree();
  
  const deleteFolder = useDeleteFolder();
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
  const { open: editModalOpen, setOpen: setEditModalOpen, openModal: openEditModal } = useAddFolderModal();

  // Transform API data to table format - only use top-level folders
  const apiData = React.useMemo(() => {
    if (!folderTreeData?.folders) return [];
    
    // Filter folders based on search query if provided
    let folders = folderTreeData.folders;
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      folders = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchLower)
      );
    }
    
    return folders.map(transformFolderToRow);
  }, [folderTreeData, debouncedSearchQuery]);

 
  React.useEffect(() => {
    const copy = [...apiData];
    copy.sort((a, b) => {
      const key = sortedBy as keyof KnowledgeBaseRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (key === "dateCreated") return String(av).localeCompare(String(bv));
      return String(av).localeCompare(String(bv));
    });
  }, [sortedBy, apiData]);

  const handleDeleteFolder = async (folderId: string) => {
    try {
      setDeletingId(folderId);
      await deleteFolder.mutateAsync(parseInt(folderId));
    } catch {
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
    // Data will be automatically refreshed via React Query invalidation
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
        if (accessLevel === "Specific Departments") {
          return (
            <Badge variant="secondary" className="bg-[#FFF1F1] text-[#D64545] border-0">
              Specific Departments
            </Badge>
          );
        } else if (accessLevel === "Specific Branches") {
          return (
            <Badge variant="secondary" className="bg-[#FFF1F1] text-[#D64545] border-0">
              Specific Branches
            </Badge>
          );
        } else if (accessLevel === "Specific Employees") {
          return (
            <Badge variant="secondary" className="bg-[#EEF3FF] text-[#2F5DD1] border-0">
              Specific Employees
            </Badge>
          );
        } else {
          return (
            <Badge variant="secondary" className="bg-[#F0FDF4] text-[#166534] border-0">
              All Employees
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
        showFilters={false}
        showSortOptions={false}
        className={cn(isFetching && "opacity-70")}
      />
      <CardTable<KnowledgeBaseRow, unknown>
        columns={columns}
        data={apiData}
        headerClassName="grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] cursor-pointer"
}
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