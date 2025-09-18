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
  Row,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSidebar } from "../ui/sidebar";

type CardTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  toolbar?: React.ReactNode;
  footer?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  rowClassName?: (row: TData) => string | undefined;
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  headerClassName?: string;
  onRowClick?: (row: Row<TData>) => void;
  noResultsContent?: React.ReactNode;
  wrapRow?: (rowElement: React.ReactNode, row: Row<TData>) => React.ReactNode;
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
  onRowClick,
  noResultsContent,
  wrapRow,
}: CardTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const setSorting = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
    if (onSortingChange) {
      const next =
        typeof updater === "function" ? updater(internalSorting) : updater;
      onSortingChange(next);
    } else {
      setInternalSorting(updater);
    }
  };

  const { isMobile } = useSidebar();

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

      <ScrollArea className={cn("w-full overflow-x-auto")}> 
        <div className={cn(isMobile && "min-w-[720px]")}> 
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
          <div className="mt-3 flex flex-col gap-3">
            {table.getRowModel().rows.map((row) => {
              const rowDiv = (
                <div
                  key={row.id}
                  className={cn(
                    "group grid grid-cols-4 items-center gap-3 rounded-lg border border-[#E4E4E4] bg-white px-4 py-3",
                    rowClassName?.(row.original)
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="min-w-0 truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              );
              return wrapRow ? wrapRow(rowDiv, row) : rowDiv;
            })}
            {table.getRowModel().rows.length === 0 && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="grid grid-cols-4 items-center gap-3 rounded-lg border border-[#E4E4E4] bg-white px-4 py-6" />
                ))}
                <div className={cn("flex items-center justify-center", noResultsContent ? "-mt-14 mb-5" : "-mt-12 mb-7")}>
                  <div className="text-center">
                    {noResultsContent ?? (<div className="text-center text-[13px] font-medium text-[#111827]">This folder is empty</div>)}
                  </div>
                </div>
                {[0, 1].map((i) => (
                  <div key={i} className="grid grid-cols-4 items-center gap-3 rounded-lg border border-[#E4E4E4] bg-white px-4 py-6" />
                ))}
              </div>

            )}
          </div>

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {footer ? <div className="mt-4">{footer(table)}</div> : null}
    </div>
  );
}


