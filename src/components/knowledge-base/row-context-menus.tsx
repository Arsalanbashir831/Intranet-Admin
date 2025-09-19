"use client";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderPlus, FilePlus, Pen, Trash2 } from "lucide-react";

export function TableContextMenu({ children, onNewFolder, onNewFile }: {
  children: React.ReactNode;
  onNewFolder?: () => void;
  onNewFile?: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={onNewFolder} className="gap-2">
          <FolderPlus className="size-4" />
          New Folder
        </ContextMenuItem>
        <ContextMenuItem onSelect={onNewFile} className="gap-2">
          <FilePlus className="size-4" />
          New File
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function RowContextMenu({ children, onRename, onDelete }: {
  children: React.ReactNode;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={onRename} className="gap-2">
          <Pen className="size-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDelete} className="gap-2 text-[#D64575]">
          <Trash2 className="size-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}


