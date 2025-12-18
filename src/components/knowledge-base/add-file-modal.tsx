"use client";

import * as React from "react";
import { AppModal } from "@/components/common/app-modal";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { useUploadQueue } from "@/contexts/upload-queue-context";
import { useBulkUploadFiles } from "@/hooks/queries/use-knowledge-files";
import { AddFileModalProps } from "@/types/knowledge-base";

export function AddFileModal({
  open,
  onOpenChange,
  folderId,
  onFileUploaded,
}: AddFileModalProps) {
  const { enqueueFiles } = useUploadQueue();
  const [selected, setSelected] = React.useState<File[]>([]);

  const bulkUploadFiles = useBulkUploadFiles();

  const handleSelect = (files: FileList | null) => {
    if (!files) return;
    setSelected(Array.from(files));
  };

  const canCreate = selected.length > 0 && folderId;

  const handleConfirm = async () => {
    if (!canCreate) return;

    // If using old upload queue system
    if (!folderId) {
      enqueueFiles(selected);
      onOpenChange(false);
      return;
    }

    // Use bulk upload API for multiple files
    try {
      await bulkUploadFiles.mutateAsync({
        files: selected,
        folderId: folderId,
      });

      // Reset form and notify parent
      setSelected([]);
      onOpenChange(false);
      onFileUploaded?.(); // Notify parent to refresh
    } catch {
      // Error is handled by the mutation hook
    }
  };
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New File"
      description="Upload files to this folder"
      icon="/icons/building-2.svg"
      confirmText="Upload"
      confirmDisabled={!canCreate || bulkUploadFiles.isPending}
      onConfirm={handleConfirm}>
      <div className="space-y-5 px-6 py-4">
        <div className="flex items-start gap-6">
          <Label className="w-28 pt-2">Select Files:</Label>
          <Dropzone
            className="flex-1"
            accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onFileSelect={handleSelect}
            showPreview={false}
          />
        </div>

        {selected.length > 0 && (
          <div className="ml-28 space-y-2">
            {selected.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span className="truncate pr-3">{f.name}</span>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setSelected((prev) => prev.filter((_, i) => i !== idx))
                  }>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppModal>
  );
}
