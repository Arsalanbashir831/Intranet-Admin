"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CardTablePagination<TData>({ table }: { table: Table<TData> }) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  const go = (idx: number) => table.setPageIndex(idx);

  const numbers = React.useMemo(() => {
    const pages: (number | "...")[] = [];
    for (let i = 0; i < pageCount; i++) pages.push(i);
    if (pages.length <= 7) return pages;
    const cur = pageIndex;
    const start = Math.max(0, cur - 1);
    const end = Math.min(pageCount - 1, cur + 1);
    const res: (number | "...")[] = [0];
    if (start > 1) res.push("...");
    for (let i = start; i <= end; i++) if (i !== 0 && i !== pageCount - 1) res.push(i);
    if (end < pageCount - 2) res.push("...");
    res.push(pageCount - 1);
    return res;
  }, [pageCount, pageIndex]);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
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
            onClick={() => go(n)}
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
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="size-9 rounded-[4px] border-[#C4CDD5] text-[#C4CDD5]"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}


