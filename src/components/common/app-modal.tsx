"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import Image from "next/image";

export type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  // Accept either a React node (e.g., Lucide icon) or a string path to a public icon
  icon?: React.ReactNode | string;
  children?: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  confirmDisabled?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  footerSlot?: React.ReactNode; // fully custom footer overrides default
};

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  className,
  showFooter = true,
  cancelText = "Cancel",
  confirmText = "Create",
  confirmVariant = "default",
  confirmDisabled = false,
  onConfirm,
  onCancel,
  footerSlot,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[720px] p-0", className)}>
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="grid size-9 place-items-center rounded bg-[#008285] text-white overflow-hidden">
                {typeof icon === "string" ? (
                  // If a string path is provided, render as an image from public/
                  <Image src={icon} alt="icon" className="size-5" width={20} height={20} />
                ) : (
                  icon
                )}
              </div>
            ) : null}
            <div className="min-w-0">
              <DialogTitle className="truncate">{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <Separator className="w-full bg-[#E9EAEB]" />

        <div className="py-2 max-h-[65vh] overflow-y-auto px-0">{children}</div>

        <Separator className="mb-2 w-full bg-[#E9EAEB]" />

        {footerSlot ? (
          <div className="mt-4">{footerSlot}</div>
        ) : showFooter ? (
          <DialogFooter className="gap-2 sm:justify-between p-6 pt-0">
            <DialogClose asChild>
              <Button variant="outline" onClick={onCancel} className="basis-1/2">
                {cancelText}
              </Button>
            </DialogClose>
            <Button
              onClick={onConfirm}
              disabled={confirmDisabled}
              variant={confirmVariant}
              className="basis-1/2"
            >
              {confirmText}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Convenience wrapper for uncontrolled open state if needed
export function useAppModalControls(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const openModal = React.useCallback(() => setOpen(true), []);
  const closeModal = React.useCallback(() => setOpen(false), []);
  return { open, setOpen, openModal, closeModal } as const;
}


