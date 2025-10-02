import Image from "next/image";
import { Button } from "../ui/button";
import { Trash, Paperclip } from "lucide-react";
import { ChecklistItemData } from "./new-hire-plan-form";
import * as React from "react";

export function ChecklistItem({ 
  item, 
  onDelete, 
  onEdit 
}: { 
  item: ChecklistItemData; 
  onDelete: (id: string) => void; 
  onEdit?: (item: ChecklistItemData) => void; 
}) {
    // Calculate the number of files excluding deleted ones
    const fileCount = React.useMemo(() => {
      const newFilesCount = item.files?.length || 0;
      const existingFilesCount = item.existingFiles?.length || 0;
      const deletedFilesCount = item.deletedFileIds?.length || 0;
      
      // Total files minus deleted files
      return newFilesCount + existingFilesCount - deletedFilesCount;
    }, [item.files, item.existingFiles, item.deletedFileIds]);

    return (
      <div className="flex items-center justify-between rounded-md border border-[#D1CECE] bg-white p-4 cursor-pointer" onClick={() => onEdit?.(item)}>
        <div className="flex items-start gap-2">
          <span className="grid size-9 place-items-center rounded-sm border border-[#D1CECE]">
            <Image src="/icons/clipboard-text-primary.svg" alt="note" width={24} height={24} />
          </span>
          <div className="leading-tight flex-1">
            <div className="text-[13px] font-medium text-[#0D141C]">{item.title}</div>
            <div className="text-xs text-[#0D141C]" dangerouslySetInnerHTML={{ __html: item.body }} />
            {fileCount > 0 ? (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Paperclip className="size-3" />
                <span>
                  {fileCount} file{fileCount !== 1 ? 's' : ''} attached
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <Button size="icon" variant="ghost" className="text-[#D64575]" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
          <Trash className="size-4" />
        </Button>
      </div>
    );
  }