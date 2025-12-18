"use client";

import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { CardTableColumnHeaderProps } from "@/types/card-table";

export function CardTableColumnHeader<TData>({
  column,
  title,
}: CardTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }
  const direction = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      className="h-auto p-0! text-sm font-medium text-[#727272] hover:text-primary"
      onClick={() => column.toggleSorting(direction === "asc")}>
      {title}
      <ChevronsUpDown className="size-4" />
    </Button>
  );
}
