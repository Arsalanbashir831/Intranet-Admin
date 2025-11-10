"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, Folder as FolderIcon, FileText, Download } from "lucide-react";
import { TableContextMenu } from "@/components/knowledge-base/row-context-menus";
import { useUploadQueue } from "@/contexts/upload-queue-context";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { useDeleteFolder, useGetFolderTree } from "@/hooks/queries/use-knowledge-folders";
import { useDeleteFile } from "@/hooks/queries/use-knowledge-files";
import type { FolderTreeItem } from "@/services/knowledge-folders";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";
import { useRouter } from "next/navigation";


export type FolderItemRow = {
  id: string;
  file: string;
  kind?: "folder" | "file"; // subfolder or file
  extension?: "pdf" | "doc" | "docx" | string; // for files
  createdByName?: string;
  createdByAvatar?: string;
  dateCreated?: string;
  originalId?: string; // Store the actual API ID
  fileSize?: number; // For files
};

type Props = {
  title: string;
  folderId?: number; // Add folderId for bulk upload
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onFilesUploaded?: () => void; // Callback when files are uploaded
  canAddContent?: boolean; // Whether user can add new content to this folder
};

export function FolderDetailsTable({ title, folderId, onNewFolder, onNewFile, onFilesUploaded, canAddContent = true }: Props) {
  const { user } = useAuth();
  const [sortedBy, setSortedBy] = React.useState<string>("file");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [rows, setRows] = React.useState<FolderItemRow[]>([]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
  const { enqueueFiles, uploadFiles } = useUploadQueue();
  const deleteFolder = useDeleteFolder();
  const deleteFile = useDeleteFile();
  const { open: editModalOpen, setOpen: setEditModalOpen, openModal: openEditModal } = useAddFolderModal();
  const router = useRouter();

  // Use folder tree API to get folder and file data
  const { data: folderTreeData, isLoading, error, refetch } = useGetFolderTree();

  // Find the current folder in the tree data
  const currentFolder = React.useMemo(() => {
    if (!folderTreeData?.folders || folderId === undefined) return null;

    const findFolder = (folders: FolderTreeItem[]): FolderTreeItem | null => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder;
        }
        const found = findFolder(folder.folders);
        if (found) return found;
      }
      return null;
    };

    return findFolder(folderTreeData.folders);
  }, [folderTreeData, folderId]);

  // Transform folder tree data to table rows
  React.useEffect(() => {
    if (!currentFolder) {
      setRows([]);
      return;
    }

    const newRows: FolderItemRow[] = [];

    // Add subfolders
    currentFolder.folders.forEach(folder => {
      newRows.push({
        id: `folder-${folder.id}`,
        file: folder.name,
        kind: "folder",
        createdByName: folder.created_by?.emp_name || "Admin",
        createdByAvatar: process.env.NEXT_PUBLIC_API_BASE_URL + folder.created_by?.profile_picture || undefined,
        dateCreated: folder.created_at ? format(new Date(folder.created_at), "yyyy-MM-dd") : undefined,
        originalId: folder.id.toString(),
      });
    });

    // Add files
    currentFolder.files.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || "";
      // Extract uploaded_by details if it's an object
      const uploadedBy = typeof file.uploaded_by === 'object' && file.uploaded_by !== null 
        ? file.uploaded_by 
        : null;
      newRows.push({
        id: `file-${file.id}`,
        file: file.name,
        kind: "file",
        extension,
        createdByName: uploadedBy?.emp_name || "Admin",
        createdByAvatar: uploadedBy?.profile_picture || undefined,
        dateCreated: file.uploaded_at ? format(new Date(file.uploaded_at), "yyyy-MM-dd") : undefined,
        originalId: file.id.toString(),
        fileSize: file.size,
      });
    });

    setRows(newRows);
  }, [currentFolder, folderTreeData]);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort data based on search query and sort option
  const filteredAndSortedRows = React.useMemo(() => {
    let filteredData = [...rows];

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

    return filteredData;
  }, [rows, sortedBy, debouncedSearchQuery]);

  const handleEdit = (item: FolderItemRow) => {
    if (item.kind === "folder" && item.originalId) {
      setEditingFolderId(item.originalId);
      openEditModal();
    }
  };

  const handleEditComplete = () => {
    setEditingFolderId(null);
    setEditModalOpen(false);
    // Refresh the folder tree data
    refetch();
  };

  const handleDelete = async (item: FolderItemRow) => {
    if (!item.originalId) return;

    try {
      setDeletingId(item.id);
      if (item.kind === "folder") {
        await deleteFolder.mutateAsync(parseInt(item.originalId));
      } else {
        await deleteFile.mutateAsync(parseInt(item.originalId));
      }
      // Refresh the folder tree data
      refetch();
    } catch {
      // Error is handled by the mutation hooks
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (row: FolderItemRow) => {
    if (row.kind === "file" && row.originalId) {
      // Find the file data to get the file_url
      if (currentFolder) {
        const file = currentFolder.files.find(f => f.id.toString() === row.originalId);
        if (file && file.file_url) {
          try {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = file.file_url;
            link.download = file.name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(file.file_url, '_blank', 'noopener,noreferrer');
          }
        } else {
          console.error('File not found or no file_url available');
        }
      } else {
        console.error('Current folder data not available');
      }
    }
  };

  // Listen to global queue to add finished items to table
  React.useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<{ id: string; name: string; targetPath?: string }>).detail;
      if (!item) return;
      // Only add to this table if it matches current folder title or no path provided
      if (!item.targetPath || item.targetPath === title) {
        // Refresh the folder tree data when new files are uploaded
        refetch();
      }
    };
    window.addEventListener("kb:queue-finished-item", handler);
    return () => window.removeEventListener("kb:queue-finished-item", handler);
  }, [title, refetch]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const row = (e as CustomEvent<{ id: string; kind: string; originalId: string; }>).detail;
      if (!row || row.kind !== "folder" || !row.originalId) return;
      // Navigate to the subfolder using its ID
      router.push(`/dashboard/knowledge-base/${row.originalId}`);
    };
    window.addEventListener("kb:open-folder", handler);
    return () => window.removeEventListener("kb:open-folder", handler);
  }, [router]);

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
      cell: ({ row }) => {
        // Check if the current user can edit/delete based on who created the parent folder
        let canEditDelete = true;

        if (row.original.kind === "folder") {
          // For folders, find the specific folder data to check who created it
          if (currentFolder) {
            const folder = currentFolder.folders.find(f => f.id.toString() === row.original.originalId);
            if (folder) {
              const folderCreatedByAdmin = folder.created_by?.is_admin === true;
              const currentUserIsAdmin = user?.isAdmin;
              canEditDelete = currentUserIsAdmin || !folderCreatedByAdmin;

              // Debug logging for folder access control
              console.log('Folder access control:', {
                folderName: row.original.file,
                folderCreatedByAdmin,
                currentUserIsAdmin,
                canEditDelete,
                folderCreator: folder.created_by?.emp_name
              });
            }
          }
        } else if (row.original.kind === "file") {
          // For files, check the parent folder's creator
          if (currentFolder) {
            const parentFolderCreatedByAdmin = currentFolder.created_by?.is_admin === true;
            const currentUserIsAdmin = user?.isAdmin;
            canEditDelete = currentUserIsAdmin || !parentFolderCreatedByAdmin;
          }
        }

        return (
          <div className="flex items-center gap-1">
            {row.original.kind === "file" && (
              <Button
                size="icon"
                variant="ghost"
                className="text-[#059669]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(row.original);
                }}
              >
                <Download className="size-4" />
              </Button>
            )}
             
              <span onClick={(e) => e.stopPropagation()}>
                <ConfirmPopover
                  title={`Delete ${row.original.kind === "folder" ? "folder" : "file"}?`}
                  description={`This action cannot be undone. ${row.original.kind === "folder" ? "All files in this folder will also be deleted." : ""}`}
                  confirmText="Delete"
                  onConfirm={() => handleDelete(row.original)}
                  disabled={deletingId === row.original.id || deleteFolder.isPending || deleteFile.isPending}
                >
                  <Button size="icon" variant="ghost" className="text-[#D64575]" disabled={!canEditDelete}>
                    <Trash2 className="size-4" />
                  </Button>
                </ConfirmPopover>
              </span>
            
            {row.original.kind === "folder" && (
              <Button
                size="icon"
                variant="ghost"
                className="text-[#2563EB]"
                disabled={!canEditDelete}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row.original);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            )}
           
          </div>
        );
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <TableContextMenu onNewFolder={onNewFolder} onNewFile={onNewFile}>
        <Card className="border-[#FFF6F6] p-5 shadow-none hover:bg-[#fffbfd]">
          <div className="text-center py-8">
            Loading folder contents...
          </div>
        </Card>
      </TableContextMenu>
    );
  }

  // Show error state
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
                You don&apos;t have permission to access this folder. Please contact your administrator if you believe this is an error.
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              Error loading folder: {error.message}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
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
            uploadFiles(files, folderId, () => {
              onFilesUploaded?.();
              // Refresh the folder tree data after upload
              refetch();
            });
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
          showFilters={false}
          showSortOptions={false}
        />
        {canAddContent ? (
          <TableContextMenu onNewFolder={onNewFolder} onNewFile={onNewFile}>
            <CardTable<FolderItemRow, unknown>
              columns={columns}
              data={filteredAndSortedRows}
              headerClassName="grid-cols-[1.4fr_1fr_1fr_0.8fr]"
              rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1fr_1fr_0.8fr] cursor-pointer"}
              // wrapRow={(rowEl, row) => (
              //   <RowContextMenu
              //     key={row.id}
              //     onRename={() => {}}
              //     onDelete={() => {}}
              //   >
              //     {rowEl}
              //   </RowContextMenu>
              // )}
              onRowClick={(row) => {
                const isFolder = (row.original.kind ?? "file") === "folder";
                if (isFolder) {
                  // Emit a custom event for the consumer to navigate
                  const event = new CustomEvent("kb:open-folder", { detail: row.original });
                  window.dispatchEvent(event);
                } else {
                  // For files, open in new tab
                  const fileRow = row.original;
                  if (fileRow.originalId) {
                    const file = currentFolder?.files.find(f => f.id.toString() === fileRow.originalId);
                    if (file) {
                      window.open(file.file_url, '_blank');
                    }
                  }
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
          </TableContextMenu>
        ) : (
          <CardTable<FolderItemRow, unknown>
            columns={columns}
            data={filteredAndSortedRows}
            headerClassName="grid-cols-[1.4fr_1fr_1fr_0.8fr]"
            rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1fr_1fr_0.8fr] cursor-pointer"}
            onRowClick={(row) => {
              if (row.original.kind === "folder" && row.original.originalId) {
                window.dispatchEvent(new CustomEvent("kb:open-folder", { detail: row.original }));
              }
            }}
            footer={() => null}
            noResultsContent={(
              <div className="text-center">
                <div className="text-[13px] font-medium text-[#111827]">This folder is empty</div>
              </div>
            )}
          />
        )}
      </Card>

      <AddFolderModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        folderId={editingFolderId ? parseInt(editingFolderId) : undefined}
        onComplete={handleEditComplete}
        isEditMode={true}
        showAccessOptions={false}
      />
    </>
  );
}