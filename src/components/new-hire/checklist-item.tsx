import Image from "next/image";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { ChecklistItemData } from "./new-hire-plan-form";

export function ChecklistItem({ item, onDelete, onOpen }: { item: ChecklistItemData; onDelete: (id: string) => void; onOpen?: () => void }) {
    return (
      <div className="flex items-center justify-between rounded-md border border-[#D1CECE] bg-white p-4 cursor-pointer" onClick={onOpen}>
        <div className="flex items-start gap-2">
          <span className="grid size-9 place-items-center rounded-sm border border-[#D1CECE]">
            <Image src="/icons/clipboard-text-primary.svg" alt="note" width={24} height={24} />
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-[#0D141C]">{item.title}</div>
            <div className="text-xs text-[#0D141C]">{item.body}</div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="text-[#D64575]" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
          <Trash className="size-4" />
        </Button>
      </div>
    );
  }
  