"use client";

import * as React from "react";
import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Dropzone } from "@/components/ui/dropzone";

export type NewTaskModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate?: (task: { title: string; detail: string; files?: File[] }) => void;
  onUpdate?: (id: string, task: { title: string; detail: string; files?: File[]; deletedFileIds?: number[] }) => void;
  type?: "task" | "training";
  editItem?: {
    id: string;
    title: string;
    body: string;
    existingFiles?: Array<{
      id: number;
      attachment: number;
      file: string;
      uploaded_at: string;
    }>;
    initialPreviewUrls?: string[]; // Add this property
  } | null;
};

export function NewTaskModal({ open, setOpen, onCreate, onUpdate, type = "task", editItem }: NewTaskModalProps) {
  const isTraining = type === "training";
  const isEditing = !!editItem;
  const [title, setTitle] = React.useState(editItem?.title || (isTraining ? "Training 1" : "Task 1"));
  const [detail, setDetail] = React.useState(editItem?.body || "");
  const [files, setFiles] = React.useState<File[]>([]);
  const [deletedFileIds, setDeletedFileIds] = React.useState<number[]>([]);
  const [blobUrls, setBlobUrls] = React.useState<string[]>([]); // Track blob URLs for cleanup

  // Update form when editItem changes
  React.useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDetail(editItem.body);
      // Don't reset files when editing - preserve them
      // setFiles([]); // Reset files when editing
      setDeletedFileIds([]); // Reset deleted file IDs when editing
    } else {
      setTitle(isTraining ? "Training 1" : "Task 1");
      setDetail("");
      setFiles([]);
      setDeletedFileIds([]);
      // Clean up blob URLs when switching to create mode
      blobUrls.forEach(url => URL.revokeObjectURL(url));
      setBlobUrls([]);
    }
  }, [editItem, isTraining]);

  // Clean up blob URLs when component unmounts
  React.useEffect(() => {
    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  const handleConfirm = () => {
    if (isEditing && editItem && onUpdate) {
      onUpdate(editItem.id, { 
        title, 
        detail, 
        files: files.length > 0 ? files : undefined,
        deletedFileIds: deletedFileIds.length > 0 ? deletedFileIds : undefined
      });
    } else {
      onCreate?.({ title, detail, files: files.length > 0 ? files : undefined });
    }
    setTitle(isTraining ? "Training 1" : "Task 1");
    setDetail("");
    setFiles([]);
    setDeletedFileIds([]);
    // Clean up blob URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
    setBlobUrls([]);
    setOpen(false);
  };

  const handleCancel = () => {
    setTitle(isTraining ? "Training 1" : "Task 1");
    setDetail("");
    setFiles([]);
    setDeletedFileIds([]);
    // Clean up blob URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
    setBlobUrls([]);
    setOpen(false);
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title={isEditing ? (isTraining ? "Edit Training" : "Edit Task") : (isTraining ? "Add New Training" : "Add New Task")}
      description={isEditing ? (isTraining ? "Edit Training details" : "Edit Task details") : (isTraining ? "Add New Training to the list" : "Add New Task to the list")}
      icon="/icons/clipboard-text.svg"
      confirmText={isEditing ? "Update" : "Add"}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div className="space-y-4 px-6 py-4">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Label className="w-28 pt-2">{isTraining ? "Training Title:" : "Task Title:"}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isTraining ? "Training title" : "Task title"}
            className="border-[#E2E8F0] w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <Label className="w-28 pt-2">{isTraining ? "Training Detail" : "Task Detail"}</Label>
          <RichTextEditor
            content={detail}
            onChange={setDetail}
            minHeight="160px"
            maxHeight="260px"
            className="w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <Label className="w-28 pt-2">Attachments:</Label>
          <div className="flex-1 space-y-3">
            <Dropzone
              className="w-full"
              accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onFileSelect={(fileList) => {
                if (fileList) {
                  const newFiles = Array.from(fileList);
                  setFiles(prev => [...prev, ...newFiles]);
                  // Create blob URLs for the new files and track them
                  const newBlobUrls = newFiles.map(file => URL.createObjectURL(file));
                  setBlobUrls(prev => [...prev, ...newBlobUrls]);
                }
              }}
              onClear={() => {
                setFiles([]);
                // Clean up blob URLs
                blobUrls.forEach(url => URL.revokeObjectURL(url));
                setBlobUrls([]);
              }}
              onImageRemove={(url) => {
                // Check if this is an existing file (not a blob URL)
                if (!url.startsWith('blob:') && isEditing && editItem?.existingFiles) {
                  // Find the file in existingFiles
                  const existingFile = editItem.existingFiles.find(file => file.file === url);
                  if (existingFile) {
                    // Add to deleted file IDs
                    setDeletedFileIds(prev => [...prev, existingFile.id]);
                    return;
                  }
                }
                // Handle removal of newly added files
                // Find the file in the files state and remove it
                const fileIndex = files.findIndex(file => URL.createObjectURL(file) === url);
                if (fileIndex !== -1) {
                  const newFiles = [...files];
                  newFiles.splice(fileIndex, 1);
                  setFiles(newFiles);
                  // Clean up the blob URL
                  URL.revokeObjectURL(url);
                  setBlobUrls(prev => prev.filter(blobUrl => blobUrl !== url));
                }
              }}
              multiple
              initialPreviewUrls={isEditing && editItem?.initialPreviewUrls ? editItem.initialPreviewUrls : []}
              showPreview={true}
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
}


