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
      <div className="flex items-center justify-between rounded-md border border-[#D1CECE] bg-white p-4 cursor-pointer h-[120px]" onClick={() => onEdit?.(item)}>
        <div className="flex items-start gap-2 min-w-0 flex-1 overflow-hidden">
          <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-[#D1CECE]">
            <Image src="/icons/clipboard-text-primary.svg" alt="note" width={24} height={24} />
          </span>
          <div className="leading-tight flex-1 min-w-0 overflow-hidden">
            <div className="text-base font-bold text-[#0D141C] mb-1 truncate">{item.title}</div>
            <div className="text-xs text-[#0D141C] leading-relaxed prose prose-sm sm:prose-base focus:outline-none prose-p:leading-relaxed prose-pre:p-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 [&_ul_li_p]:inline [&_ol_li_p]:inline [&_ul_li_p]:m-0 [&_ol_li_p]:m-0 line-clamp-3 overflow-hidden" dangerouslySetInnerHTML={{ __html: item.body }} />
            {item.deadline ? (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
              </div>
            ) : null}
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
        <Button size="icon" variant="ghost" className="text-[#D64575] shrink-0" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
          <Trash className="size-4" />
        </Button>
      </div>
    );
  }