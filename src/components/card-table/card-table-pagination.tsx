"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateTotalPages,
  generatePageNumbers,
  pageIndexToPageNumber,
  pageNumberToPageIndex,
  PaginationInfo,
} from "@/lib/pagination-utils";

export interface CardTablePaginationProps<TData> {
  table: Table<TData>;
  /**
   * Server-side pagination info from API response
   * If provided, will use server-side pagination instead of client-side
   */
  paginationInfo?: PaginationInfo;
  /**
   * Callback for server-side pagination page changes
   * Called with new page number (1-based) and page size
   */
  onPageChange?: (page: number, pageSize: number) => void;
}

export function CardTablePagination<TData>({
  table,
  paginationInfo,
  onPageChange,
}: CardTablePaginationProps<TData>) {
  // Use server-side pagination if paginationInfo is provided
  const isServerSide = !!paginationInfo;
  
  const pageCount = isServerSide 
    ? calculateTotalPages(paginationInfo!.count, paginationInfo!.page_size)
    : table.getPageCount();
    
  const pageIndex = isServerSide 
    ? pageNumberToPageIndex(paginationInfo!.page)
    : table.getState().pagination.pageIndex;
    
  const pageSize = isServerSide 
    ? paginationInfo!.page_size
    : table.getState().pagination.pageSize;

  const canPreviousPage = isServerSide 
    ? paginationInfo!.page > 1
    : table.getCanPreviousPage();
    
  const canNextPage = isServerSide 
    ? paginationInfo!.page < pageCount
    : table.getCanNextPage();

  const goToPage = (targetPageIndex: number) => {
    if (isServerSide && onPageChange) {
      const pageNumber = pageIndexToPageNumber(targetPageIndex);
      onPageChange(pageNumber, pageSize);
    } else {
      table.setPageIndex(targetPageIndex);
    }
  };

  const goToPreviousPage = () => {
    if (isServerSide && onPageChange) {
      const newPage = Math.max(1, paginationInfo!.page - 1);
      onPageChange(newPage, pageSize);
    } else {
      table.previousPage();
    }
  };

  const goToNextPage = () => {
    if (isServerSide && onPageChange) {
      const newPage = Math.min(pageCount, paginationInfo!.page + 1);
      onPageChange(newPage, pageSize);
    } else {
      table.nextPage();
    }
  };

  const numbers = React.useMemo(() => {
    return generatePageNumbers(pageIndex, pageCount);
  }, [pageCount, pageIndex]);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={goToPreviousPage}
        disabled={!canPreviousPage}
        className="size-9 rounded-[4px] border-[#C4CDD5] text-[#C4CDD5]"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {numbers.map((n, i) =>
        n === "..." ? (
          <div key={`dots-${i}`} className="size-9 rounded-[4px] border grid place-items-center text-[#C4CDD5] border-[#C4CDD5]">
            …
          </div>
        ) : (
          <Button
            key={n}
            variant="outline"
            onClick={() => goToPage(n)}
            className={cn(
              "size-9 rounded-[4px] border grid place-items-center font-semibold hover:text-primary",
              pageIndex === n ? "border-[#D64575] text-[#D64575]" : "border-[#C4CDD5] text-[#C4CDD5]"
            )}
          >
            {n + 1}
          </Button>
        )
      )}
      <Button
        size="icon"
        variant="outline"
        onClick={goToNextPage}
        disabled={!canNextPage}
        className="size-9 rounded-[4px] border-[#C4CDD5] text-[#C4CDD5]"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}


