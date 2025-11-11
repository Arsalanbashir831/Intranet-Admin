"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { FolderIcon, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useGetFolderTree, useDeleteFolder } from "@/hooks/queries/use-knowledge-folders";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { cn } from "@/lib/utils";
import { FolderTreeItem, KnowledgeBaseRow } from "@/types/knowledge";

// Helper function to determine access level from access_level field
const getAccessLevel = (folder: FolderTreeItem): "Specific Branch Departments" | "Specific Departments" | "Specific Branches" | "Specific Employees" | "All Employees" => {
  // Check branch_departments first (new field)
  if (folder.access_level.branch_departments && folder.access_level.branch_departments.length > 0) {
    return "Specific Branch Departments";
  }
  // Check branches
  if (folder.access_level.branches && folder.access_level.branches.length > 0) {
    return "Specific Branches";
  }
  // Check departments
  if (folder.access_level.departments && folder.access_level.departments.length > 0) {
    return "Specific Departments";
  }
  // Check employees
  if (folder.access_level.employees && folder.access_level.employees.length > 0) {
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
    createdByName: folder.created_by?.emp_name || "Admin",
    createdByAvatar: process.env.NEXT_PUBLIC_API_BASE_URL + folder.created_by?.profile_picture || undefined,
    accessLevel: getAccessLevel(folder),
    accessLevelDetails: {
      employees: (folder.access_level.employees || []) as Array<{ id: number; emp_name: string; email: string; profile_picture?: string }>,
      branchDepartments: (folder.access_level.branch_departments || []) as Array<{ id: number; branch: { branch_name: string }; department: { dept_name: string } }>,
      departments: (folder.access_level.departments || []) as Array<{ id: number; dept_name: string }>,
      branches: (folder.access_level.branches || []) as Array<{ id: number; branch_name: string }>,
    },
    dateCreated: format(new Date(folder.created_at), "yyyy-MM-dd"),
    originalData: folder,
  };
};

export function KnowledgeBaseTable() {
  const { user } = useAuth();
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
        const accessLevelDetails = row.original.accessLevelDetails;

        // Helper function to render avatars with count using AvatarStack
        const renderAvatarsWithCount = (items: Array<{ emp_name?: string; branch_name?: string; dept_name?: string; profile_picture?: string | null }>, maxAvatars: number = 3) => {
          const visibleItems = items.slice(0, maxAvatars);
          const remainingCount = items.length - maxAvatars;

          const avatarElements = visibleItems.map((item, index) => {
            const name = item.emp_name || item.branch_name || item.dept_name || '?';
            const initials = name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Avatar key={index} className="size-5">
                <AvatarImage src={item.profile_picture || undefined} alt={name} />
                <AvatarFallback className="text-[8px] bg-primary/70 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            );
          });

          return (
            <div className="flex items-center gap-2">
              <AvatarStack size={24} className="shrink-0">
                {avatarElements}
              </AvatarStack>
              {remainingCount > 0 && (
                <span className="text-xs text-[#667085]">
                  +{remainingCount}
                </span>
              )}
            </div>
          );
        };

        if (accessLevel === "Specific Branch Departments") {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#ffdfdf] text-[#D64545] border-0">
                {accessLevelDetails.branchDepartments.slice(0, 3).map((bd, index) => (
                  <div key={index} className="text-xs">
                    {bd.branch?.branch_name}
                  </div>
                ))}
              </Badge>
            </div>
          );
        } else if (accessLevel === "Specific Departments") {
          return (
            <div className="flex items-center gap-2">
              {renderAvatarsWithCount(accessLevelDetails.departments)}
            </div>
          );
        } else if (accessLevel === "Specific Branches") {
          return (
            <div className="flex items-center gap-2">
              {renderAvatarsWithCount(accessLevelDetails.branches)}
            </div>
          );
        } else if (accessLevel === "Specific Employees") {
          return (
            <div className="flex items-center gap-2">
              {renderAvatarsWithCount(accessLevelDetails.employees)}
            </div>
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
      cell: ({ row }) => {
        // Check if current user can edit/delete this folder
        const folderCreatedByAdmin = row.original.originalData.created_by?.is_admin === true;
        const currentUserIsAdmin = user?.isAdmin;

        // Access control check: admin can edit/delete any folder, non-admin can only edit/delete non-admin folders

        // If folder was created by admin, only admins can edit/delete it
        // If folder was created by manager, both admins and managers can edit/delete it
        const canEditDelete = currentUserIsAdmin || !folderCreatedByAdmin;

        if (!canEditDelete) {
          return (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground border-0">
              Admin Only
            </Badge>
          );
        }

        return (
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
        );
      },
    },
  ];

  if (error) {
    // Check if it's a 403 Forbidden error
    const isForbidden = error.message && (
      error.message.toLowerCase().includes('access denied') ||
      error.message.toLowerCase().includes('forbidden') ||
      error.message.toLowerCase().includes("don't have permission")
    );

    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none">
        <div className="text-center py-8">
          {isForbidden ? (
            <div className="space-y-2">
              <div className="text-red-600 font-medium">
                Access Denied
              </div>
              <div className="text-sm text-muted-foreground">
                You don&apos;t have permission to access the knowledge base. Please contact your administrator if you believe this is an error.
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              Error loading folders: {error.message}
            </div>
          )}
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