import { Pin } from "lucide-react";
import { Button } from "../ui/button";

type PinRowButtonProps = {
    row: any;
    pinnedIds: Set<string>;
    togglePin: (id: string) => void;
}

export function PinRowButton({ row, pinnedIds, togglePin }: PinRowButtonProps) {
    
    return (
        <Button variant="link" size="icon" className={`p-0 h-fit w-fit text-primary hover:text-primary/80 opacity-0 transition-opacity group-hover:opacity-100 ${pinnedIds.has(row.original.id) ? "opacity-100" : ""}`} onClick={() => togglePin(row.original.id)} aria-label={pinnedIds.has(row.original.id) ? "Unpin" : "Pin"} title={pinnedIds.has(row.original.id) ? "Unpin" : "Pin"}>
            <Pin className={`size-4 rotate-45 ${pinnedIds.has(row.original.id) ? "fill-current" : ""}`} />
        </Button>
    );
}
