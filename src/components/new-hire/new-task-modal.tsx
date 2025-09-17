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
  onCreate?: (task: { title: string; detail: string }) => void;
  type?: "task" | "training";
};

export function NewTaskModal({ open, setOpen, onCreate, type = "task" }: NewTaskModalProps) {
  const isTraining = type === "training";
  const [title, setTitle] = React.useState(isTraining ? "Training 1" : "Task 1");
  const [detail, setDetail] = React.useState("");

  const handleConfirm = () => {
    onCreate?.({ title, detail });
    setOpen(false);
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title={isTraining ? "Add New Training" : "Add New Task"}
      description={isTraining ? "Add New Training to the list" : "Add New Task to the list"}
      icon="/icons/clipboard-text.svg"
      confirmText="Add"
      onConfirm={handleConfirm}
      onCancel={() => setOpen(false)}
    >
      <div className="space-y-4 px-6 py-4">
        <div className="flex items-start gap-6">
          <Label className="w-28 pt-2">{isTraining ? "Training Title:" : "Task Title:"}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isTraining ? "Training title" : "Task title"}
            className="border-[#E2E8F0]"
          />
        </div>

        <div className="flex items-start gap-6">
          <Label className="w-28 pt-2">{isTraining ? "Training Detail" : "Task Detail"}</Label>
          <div className="flex-1 min-w-0">
            <RichTextEditor
              content={detail}
              onChange={setDetail}
              minHeight="160px"
              maxHeight="260px"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-start gap-6">
          <Label className="w-28 pt-2">Attachments:</Label>
          <Dropzone className="flex-1" accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
        </div>
      </div>
    </AppModal>
  );
}


