
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export function SortingDropdown({ sortOptions, activeSort, onSortChange }: { sortOptions: { label: string; value: string }[], activeSort: string, onSortChange: (value: string) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                    <SlidersHorizontal className="size-4" /> Sort By
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {sortOptions && sortOptions.length > 0 ? (
                    sortOptions.map((opt) => (
                        <DropdownMenuCheckboxItem
                            key={opt.value}
                            checked={activeSort === opt.value}
                            onCheckedChange={() => onSortChange?.(opt.value)}
                            className="py-2 text-[15px]"
                        >
                            {opt.label}
                        </DropdownMenuCheckboxItem>
                    ))
                ) : (
                    <DropdownMenuLabel className="text-sm text-muted-foreground">No sort options</DropdownMenuLabel>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
