"use client";

import { KnowledgeBaseTable } from "@/components/knowledge-base/knowledge-base-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import { AddFolderModal, useAddFolderModal } from "@/components/knowledge-base/add-folder-modal";

export default function KnowledgeBasePage() {
  const { open, setOpen, openModal } = useAddFolderModal();
  return (
    <>
      <PageHeader
        title="Knowledge Base"
        crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE }]}
        action={<Button onClick={openModal} className="bg-[#FF0F6D] hover:bg-[#e20d60]">Create Folder</Button>}
      />
      <div className="px-4 md:px-12 py-4">
        <KnowledgeBaseTable />
      </div>
      <AddFolderModal open={open} onOpenChange={setOpen} showAccessOptions={true} />
    </>
  );
}