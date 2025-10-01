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
  onUpdate?: (id: string, task: { title: string; detail: string; files?: File[] }) => void;
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
  } | null;
};

export function NewTaskModal({ open, setOpen, onCreate, onUpdate, type = "task", editItem }: NewTaskModalProps) {
  const isTraining = type === "training";
  const isEditing = !!editItem;
  const [title, setTitle] = React.useState(editItem?.title || (isTraining ? "Training 1" : "Task 1"));
  const [detail, setDetail] = React.useState(editItem?.body || "");
  const [files, setFiles] = React.useState<File[]>([]);

  // Update form when editItem changes
  React.useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDetail(editItem.body);
      setFiles([]); // Reset files when editing
    } else {
      setTitle(isTraining ? "Training 1" : "Task 1");
      setDetail("");
      setFiles([]);
    }
  }, [editItem, isTraining]);

  const handleConfirm = () => {
    if (isEditing && editItem && onUpdate) {
      onUpdate(editItem.id, { title, detail, files: files.length > 0 ? files : undefined });
    } else {
      onCreate?.({ title, detail, files: files.length > 0 ? files : undefined });
    }
    setTitle(isTraining ? "Training 1" : "Task 1");
    setDetail("");
    setFiles([]);
    setOpen(false);
  };

  const handleCancel = () => {
    setTitle(isTraining ? "Training 1" : "Task 1");
    setDetail("");
    setFiles([]);
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
            className="border-[#E2E8F0]"
          />
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <Label className="w-28 pt-2">{isTraining ? "Training Detail" : "Task Detail"}</Label>
          <div className="flex-1 min-w-0 max-w-full">
            <RichTextEditor
              content={detail}
              onChange={setDetail}
              minHeight="160px"
              maxHeight="260px"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <Label className="w-28 pt-2">Attachments:</Label>
          <div className="flex-1 space-y-3">
            <Dropzone 
              className="w-full" 
              accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onFileSelect={(fileList) => {
                if (fileList) {
                  setFiles(prev => [...prev, ...Array.from(fileList)]);
                }
              }}
              onClear={() => setFiles([])}
              multiple
              initialPreviewUrls={isEditing && editItem?.existingFiles ? 
                editItem.existingFiles
                  .filter(file => file.file.match(/\.(jpg|jpeg|png|gif|svg)$/i)) // Only show image files as previews
                  .map(file => file.file) 
                : []
              }
            />
            {isEditing && editItem?.existingFiles && editItem.existingFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Existing Files:</div>
                {editItem.existingFiles.map((file) => {
                  const fileName = file.file.split('/').pop();
                  const isImage = file.file.match(/\.(jpg|jpeg|png|gif|svg)$/i);
                  return (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600 flex-1">
                        {fileName} {!isImage && '(Non-image file)'}
                      </span>
                      <a 
                        href={file.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
}


