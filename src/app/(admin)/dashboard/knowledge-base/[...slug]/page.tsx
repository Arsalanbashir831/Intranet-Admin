"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import { FolderDetailsTable, FolderItemRow } from "@/components/knowledge-base/folder-details-table";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { AddFileModal } from "@/components/knowledge-base/add-file-modal";
import { useRouter } from "next/navigation";
import { useGetFolder, useGetAllFolders } from "@/hooks/queries/use-knowledge-folders";
import { useGetAllFiles } from "@/hooks/queries/use-knowledge-files";
import { KnowledgeFolder } from "@/services/knowledge-folders";
import { KnowledgeFile } from "@/services/knowledge-files";
import { format } from "date-fns";

// Helper function to transform API data to table row format
const transformFolderData = (folders: KnowledgeFolder[], files: KnowledgeFile[]): FolderItemRow[] => {
  const items: FolderItemRow[] = [];
  
  // Add subfolders
  folders.forEach(folder => {
    items.push({
      id: `folder-${folder.id}`,
      file: folder.name,
      kind: "folder",
      createdByName: "Admin", // TODO: Get actual creator name
      dateCreated: format(new Date(folder.created_at), "yyyy-MM-dd"),
      originalId: folder.id.toString(),
    });
  });
  
  // Add files
  files.forEach(file => {
    const extension = file.name.split('.').pop()?.toLowerCase() || "";
    items.push({
      id: `file-${file.id}`,
      file: file.name,
      kind: "file",
      extension,
      createdByName: "Admin", // TODO: Get actual uploader name
      dateCreated: format(new Date(file.uploaded_at), "yyyy-MM-dd"),
      originalId: file.id.toString(),
    });
  });
  
  return items;
};

export default function KnowledgeBaseFolderCatchAll({ params }: { params: Promise<{ slug?: string[] }> }) {
  const router = useRouter();
  const { slug } = React.use(params);
  const segments = slug ?? [];
  const decodedSegments = React.useMemo(() => segments.map((s) => {
    try { return decodeURIComponent(s); } catch { return s; }
  }), [segments]);

  // For now, we'll use the first segment as the folder ID
  // In a more sophisticated setup, you might want to resolve the full path
  const folderId = segments[0] ? parseInt(segments[0]) : undefined;
  
  const { data: folderData, isLoading: folderLoading, error: folderError, refetch: refetchFolder } = useGetFolder(
    folderId || 0, 
    !!folderId
  );
  const { data: filesData, isLoading: filesLoading, refetch: refetchFiles } = useGetAllFiles(folderId);
  const { data: subfoldersData, isLoading: subfoldersLoading, refetch: refetchSubfolders } = useGetAllFolders();

  // Filter subfolders to only show those that are children of the current folder
  const subfolders = React.useMemo(() => {
    if (!subfoldersData?.folders.results) return [];
    return subfoldersData.folders.results.filter(folder => 
      folder.parent === folderId
    );
  }, [subfoldersData, folderId]);
  
  const files = filesData?.files.results || [];
  
  const handleRefreshContents = React.useCallback(() => {
    refetchFiles();
    refetchSubfolders();
    if (folderId) {
      refetchFolder();
    }
  }, [refetchFiles, refetchSubfolders, refetchFolder, folderId]);
  
  const items = React.useMemo(() => {
    return transformFolderData(subfolders, files);
  }, [subfolders, files]);

  const folderName = folderData?.folder.name || decodedSegments[decodedSegments.length - 1] || "Root";

  // Build breadcrumbs with actual folder names including full hierarchy
  const crumbs = React.useMemo(() => {
    const baseCrumbs: Array<{ label: string; href: string }> = [
      { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
      { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE },
    ];
    
    // If we have a current folder, build the full hierarchy path
    if (folderId && folderData?.folder) {
      const buildFolderPath = (folder: KnowledgeFolder): Array<{ label: string; href: string }> => {
        const path: Array<{ label: string; href: string }> = [];
        
        // If this folder has a parent, find it and build path recursively
        if (folder.parent && subfoldersData?.folders.results) {
          const parentFolder = subfoldersData.folders.results.find(f => f.id === folder.parent);
          if (parentFolder) {
            path.push(...buildFolderPath(parentFolder));
          }
        }
        
        // Add current folder to path
        path.push({
          label: folder.name,
          href: `/dashboard/knowledge-base/${folder.id}`,
        });
        
        return path;
      };
      
      baseCrumbs.push(...buildFolderPath(folderData.folder));
    }
    
    return baseCrumbs;
  }, [folderId, folderData, subfoldersData]);

  const { open: openNewFolder, setOpen: setOpenNewFolder, openModal: openNewFolderModal } = useAddFolderModal();
  const [openNewFile, setOpenNewFile] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const row = (e as CustomEvent<FolderItemRow>).detail;
      if (!row || row.kind !== "folder" || !row.originalId) return;
      // Navigate to the subfolder using its ID
      router.push(`/dashboard/knowledge-base/${row.originalId}`);
    };
    window.addEventListener("kb:open-folder", handler);
    return () => window.removeEventListener("kb:open-folder", handler);
  }, [router]);

  if (folderError) {
    return (
      <>
        <PageHeader title="Knowledge Base" crumbs={crumbs} />
        <div className="px-4 md:px-12 py-4">
          <div className="text-center py-8 text-red-600">
            Error loading folder: {folderError.message}
          </div>
        </div>
      </>
    );
  }

  if (folderLoading || filesLoading || subfoldersLoading) {
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
      <PageHeader title="Knowledge Base" crumbs={crumbs} />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <FolderDetailsTable
            title={folderName}
            data={items}
            onNewFolder={openNewFolderModal}
            onNewFile={() => setOpenNewFile(true)}
          />
        </div>
      {/* </ScrollArea> */}
      <AddFolderModal open={openNewFolder} onOpenChange={setOpenNewFolder} parentFolderId={folderId} />
      <AddFileModal 
        open={openNewFile} 
        onOpenChange={setOpenNewFile} 
        folderId={folderId}
        onFileUploaded={handleRefreshContents}
      />
    </>
  );
}


