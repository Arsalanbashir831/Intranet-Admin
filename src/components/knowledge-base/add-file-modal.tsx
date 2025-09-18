"use client";

import * as React from "react";
import { AppModal } from "@/components/common/app-modal";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { useUploadQueue } from "@/contexts/upload-queue-context";

export function AddFileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { enqueueFiles } = useUploadQueue();
  const [targetPath, setTargetPath] = React.useState<string | undefined>(undefined);
  const [selected, setSelected] = React.useState<File[]>([]);

  const handleSelect = (files: FileList | null) => {
    if (!files) return;
    setSelected(Array.from(files));
  };

  const handleConfirm = () => {
    if (selected.length) enqueueFiles(selected, targetPath);
    onOpenChange(false);
  };
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New File"
      description="Add New File"
      icon="/icons/building-2.svg"
      confirmText="Add"
      onConfirm={handleConfirm}
    >
      <div className="space-y-4 px-6 py-4">
        <div className="flex items-start gap-6">
          <Label className="w-28 pt-2">Attachments:</Label>
          <Dropzone className="flex-1" accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple onFileSelect={handleSelect} showPreview={false} />
        </div>
        {selected.length > 0 && (
          <div className="ml-28 space-y-2">
            {selected.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span className="truncate pr-3">{f.name}</span>
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setSelected((prev) => prev.filter((_, i) => i !== idx))}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppModal>
  );
}


