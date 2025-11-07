"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import { FolderDetailsTable } from "@/components/knowledge-base/folder-details-table";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { AddFileModal } from "@/components/knowledge-base/add-file-modal";
import { useRouter } from "next/navigation";
import { useGetFolderTree } from "@/hooks/queries/use-knowledge-folders";
import type { FolderTreeItem } from "@/services/knowledge-folders";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, FolderPlus, FilePlus } from "lucide-react";

export default function KnowledgeBaseFolderCatchAll({ params }: { params: Promise<{ slug?: string[] }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { slug } = React.use(params);
  const segments = React.useMemo(() => slug ?? [], [slug]);
  const decodedSegments = React.useMemo(() => segments.map((s) => {
    try { return decodeURIComponent(s); } catch { return s; }
  }), [segments]);

  // For now, we'll use the first segment as the folder ID
  // In a more sophisticated setup, you might want to resolve the full path
  const folderId = segments[0] ? parseInt(segments[0]) : undefined;

  // Use folder tree API instead of individual folder APIs
  const { data: folderTreeData, isLoading: treeLoading, error: treeError, refetch: refetchTree } = useGetFolderTree();

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

  const handleRefreshContents = React.useCallback(() => {
    refetchTree();
  }, [refetchTree]);

  const folderName = currentFolder?.name || decodedSegments[decodedSegments.length - 1] || "Root";

  // Build breadcrumbs with actual folder names including full hierarchy
  const crumbs = React.useMemo(() => {
    const baseCrumbs: Array<{ label: string; href: string }> = [
      { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
      { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE },
    ];

    // If we have a current folder, build the full hierarchy path
    if (folderId && currentFolder) {
      // For now, we'll just add the current folder to the breadcrumbs
      // A more sophisticated implementation would build the full path
      baseCrumbs.push({
        label: currentFolder.name,
        href: `/dashboard/knowledge-base/${currentFolder.id}`,
      });
    }

    return baseCrumbs;
  }, [folderId, currentFolder]);

  const { open: openNewFolder, setOpen: setOpenNewFolder, openModal: openNewFolderModal } = useAddFolderModal();
  const [openNewFile, setOpenNewFile] = React.useState(false);

  // Check if current user can add content to this folder
  const canAddContent = React.useMemo(() => {
    if (!currentFolder || !user) return false;

    const folderCreatedByAdmin = currentFolder.created_by?.is_admin === true;
    const currentUserIsAdmin = user.isAdmin;

    // If folder was created by admin, only admins can add content
    // If folder was created by manager, both admins and managers can add content
    return currentUserIsAdmin || !folderCreatedByAdmin;
  }, [currentFolder, user]);

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

  if (treeError) {
    return (
      <>
        <PageHeader title="Knowledge Base" crumbs={crumbs} />
        <div className="px-4 md:px-12 py-4">
          <div className="text-center py-8 text-red-600">
            Error loading folder: {treeError.message}
          </div>
        </div>
      </>
    );
  }

  if (treeLoading) {
    return (
      <>
        <PageHeader title="Knowledge Base" crumbs={crumbs} />
        <div className="px-4 md:px-12 py-4">
          <div className="text-center py-8">
            Loading folder contents...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        crumbs={crumbs}
        action={
          canAddContent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#FF0F6D] hover:bg-[#e20d60]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openNewFolderModal}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Add Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenNewFile(true)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>)
        }
      />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
      <div className="px-4 md:px-12 py-4">
          <FolderDetailsTable
            title={folderName}
            folderId={folderId}
            onNewFolder={openNewFolderModal}
            onNewFile={() => setOpenNewFile(true)}
            canAddContent={canAddContent}
          />
      </div>
      {/* </ScrollArea> */}
      <AddFolderModal
        open={openNewFolder}
        onOpenChange={setOpenNewFolder}
        parentFolderId={folderId}
        showAccessOptions={false}
      />
      <AddFileModal
        open={openNewFile}
        onOpenChange={setOpenNewFile}
        folderId={folderId}
        onFileUploaded={handleRefreshContents}
      />
    </>
  );
}