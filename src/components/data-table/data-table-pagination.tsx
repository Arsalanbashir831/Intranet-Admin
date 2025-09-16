"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Table as ReactTable } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

function getPages(current: number, total: number): (number | "dots")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "dots", total - 1, total];
  if (current >= total - 3) return [1, 2, "dots", total - 4, total - 3, total - 2, total - 1, total];
  return [1, 2, "dots", current - 1, current, current + 1, "dots", total - 1, total];
}

export function DataTablePagination<TData>({ table }: { table: ReactTable<TData> }) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex + 1;
  const pages = getPages(pageIndex, pageCount);

  const goTo = (p: number) => table.setPageIndex(p - 1);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 px-2 py-4">
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-[4px] border-[#C4CDD5] text-[#C4CDD5] disabled:opacity-50 hover:text-primary"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      {pages.map((p, idx) =>
        p === "dots" ? (
          <div
            key={`dots-${idx}`}
            className="size-10 rounded-[4px] border text-[#C4CDD5] grid place-items-center border-[#C4CDD5]"
          >
            <span className="tracking-widest">…</span>
          </div>
        ) : (
          <Button
            variant="outline"
            key={p}
            onClick={() => goTo(p as number)}
            className={cn(
              "size-10 rounded-[4px] border grid place-items-center font-semibold hover:text-primary",
              pageIndex === p
                ? "border-[#D64575] text-[#D64575]"
                : "border-[#C4CDD5] text-[#C4CDD5]"
            )}
            aria-current={pageIndex === p ? "page" : undefined}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-[4px] border-[#C4CDD5] text-[#C4CDD5] disabled:opacity-50 hover:text-primary"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}


