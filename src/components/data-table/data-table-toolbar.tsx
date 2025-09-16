"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { Filter, SortDesc } from "lucide-react";

type ToolbarProps = {
  tableName?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  rightContent?: React.ReactNode;
};

export function DataTableToolbar({tableName, searchPlaceholder = "Search", onSearchChange, rightContent }: ToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2 py-3 justify-between">
      {tableName && (
      <p className="text-xl font-medium tracking-tight">{tableName}</p>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <DataTableSearch placeholder={searchPlaceholder} onChange={(v) => onSearchChange?.(v)} />
        </div>
          <Button variant="outline" size="sm">
            <SortDesc className="mr-2 size-4" />
            Sort By
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 size-4" />
            Filter
          </Button>
          {rightContent}
        </div>
    </div>
  );
}


