"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

type CardTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  toolbar?: React.ReactNode;
  footer?: (table: any) => React.ReactNode;
  rowClassName?: (row: TData) => string | undefined;
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  headerClassName?: string;
};

export function CardTable<TData, TValue>({
  columns,
  data,
  className,
  toolbar,
  footer,
  rowClassName,
  sorting: controlledSorting,
  onSortingChange,
  headerClassName,
}: CardTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const setSorting = (updater: any) => {
    if (onSortingChange) {
      const next = typeof updater === "function" ? updater(internalSorting) : updater;
      onSortingChange(next);
    } else {
      setInternalSorting(updater);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  return (
    <div className={cn("w-full", className)}>
      {toolbar ? <div className="mb-3">{toolbar}</div> : null}

      {/* Header */}
      <div className={cn("grid grid-cols-4 items-center gap-3 rounded-md border border-[#EDEEF2] bg-[#F7F7F9] px-4 py-3 text-xs font-medium text-[#667085]", headerClassName)}>
        {table.getFlatHeaders().map((header) => (
          <div key={header.id} className="truncate select-none">
            {header.isPlaceholder
              ? null
              : flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="mt-3 space-y-3">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className={cn(
              "group grid grid-cols-4 items-center gap-3 rounded-lg border border-[#E4E4E4] bg-white px-4 py-3",
              rowClassName?.(row.original)
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <div key={cell.id} className="min-w-0 truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
        {table.getRowModel().rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#EDEEF2] bg-white px-4 py-10 text-center text-sm text-muted-foreground">
            No results
          </div>
        )}
      </div>

      {footer ? <div className="mt-4">{footer(table)}</div> : null}
    </div>
  );
}


