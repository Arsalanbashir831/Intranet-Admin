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

export type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
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
      <DialogContent className={cn("sm:max-w-[580px]", className)}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="grid size-8 place-items-center rounded bg-[#E6F4F1] text-[#0F766E]">
                {icon}
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

        <div className="py-2">{children}</div>

        {footerSlot ? (
          <div className="mt-4">{footerSlot}</div>
        ) : showFooter ? (
          <DialogFooter className="gap-2 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" onClick={onCancel}>
                {cancelText}
              </Button>
            </DialogClose>
            <Button
              onClick={onConfirm}
              disabled={confirmDisabled}
              variant={confirmVariant}
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


