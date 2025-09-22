"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderDetailsTable, FolderItemRow } from "@/components/knowledge-base/folder-details-table";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";
import { AddFileModal } from "@/components/knowledge-base/add-file-modal";
import { useRouter } from "next/navigation";

// Mock API/data resolver for a given folder path
function getFolderData(pathSegments: string[]): { name: string; items: FolderItemRow[] } {
  const name = pathSegments[pathSegments.length - 1] || "Root";
  // For demo: generate nested content based on depth
  const depth = pathSegments.length;
  const items: FolderItemRow[] = [
    { id: `sf-${depth}-1`, file: `Sub ${depth}.1`, kind: "folder", createdByName: "Albert Flores", dateCreated: "2024-07-26" },
    { id: `f-${depth}-1`, file: `File ${depth}.pdf`, kind: "file", extension: "pdf", createdByName: "Jenny Wilson", dateCreated: "2024-07-25" },
    { id: `f-${depth}-2`, file: `Doc ${depth}.docx`, kind: "file", extension: "docx", createdByName: "Jacob Jones", dateCreated: "2024-07-22" },
  ];
  return { name, items };
}

export default function KnowledgeBaseFolderCatchAll({ params }: { params: Promise<{ slug?: string[] }> }) {
  const router = useRouter();
  const { slug } = React.use(params);
  const segments = slug ?? [];
  const decodedSegments = React.useMemo(() => segments.map((s) => {
    try { return decodeURIComponent(s); } catch { return s; }
  }), [segments]);
  const { name, items } = getFolderData(decodedSegments);

  const crumbs = [
    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
    { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE },
    ...decodedSegments.map((seg, idx) => ({
      label: seg,
      href: `/dashboard/knowledge-base/${segments.slice(0, idx + 1).join("/")}`,
    })),
  ];

  const { open: openNewFolder, setOpen: setOpenNewFolder, openModal: openNewFolderModal } = useAddFolderModal();
  const [openNewFile, setOpenNewFile] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const row = (e as CustomEvent<FolderItemRow>).detail;
      if (!row || row.kind !== "folder") return;
      const encodedName = encodeURIComponent(row.file);
      router.push(`/dashboard/knowledge-base/${[...segments, encodedName].join("/")}`);
    };
    window.addEventListener("kb:open-folder", handler);
    return () => window.removeEventListener("kb:open-folder", handler);
  }, [segments, router]);

  return (
    <>
      <PageHeader title="Knowledge Base" crumbs={crumbs} />
      {/* <ScrollArea className="h-[calc(100vh-10rem)]"> */}
        <div className="px-4 md:px-12 py-4">
          <FolderDetailsTable
            title={name}
            data={items}
            onNewFolder={openNewFolderModal}
            onNewFile={() => setOpenNewFile(true)}
          />
        </div>
      {/* </ScrollArea> */}
      <AddFolderModal open={openNewFolder} onOpenChange={setOpenNewFolder} />
      <AddFileModal open={openNewFile} onOpenChange={setOpenNewFile} />
    </>
  );
}


