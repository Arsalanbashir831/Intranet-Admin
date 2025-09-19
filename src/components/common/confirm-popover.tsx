"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type ConfirmPopoverProps = {
  children: React.ReactNode; // trigger
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
};

export function ConfirmPopover({
  children,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  disabled,
}: ConfirmPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setPending(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <span aria-disabled={disabled}>{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
              {cancelText}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={pending}>
              {pending ? "Working..." : confirmText}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


