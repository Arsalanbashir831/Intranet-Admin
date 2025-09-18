"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Column } from "@tanstack/react-table";

type Props<TData> = {
  column: Column<TData, unknown>;
  title: string;
};

export function CardTableColumnHeader<TData>({ column, title }: Props<TData>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }
  const direction = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      className="h-auto p-0 text-sm font-medium text-[#727272] hover:text-primary"
      onClick={() => column.toggleSorting(direction === "asc")}
    >
      {title}
      <ChevronsUpDown className="size-4" />
    </Button>
  );
}


