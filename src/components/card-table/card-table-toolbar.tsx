"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSearch } from "./table-search";
import { SortingDropdown } from "./sorting-dropdown";

export type CardTableToolbarProps = {
  title: string;
  placeholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
  showSortOptions?: boolean;
  showFilters?: boolean;
  sortOptions?: { label: string; value: string }[];
  activeSort?: string;
  accessControl?: React.ReactNode; // optional control like AccessLevelDropdown
};

export function CardTableToolbar({
  title,
  placeholder = "Search",
  searchValue,
  onSearchChange,
  showSortOptions = true,
  onSortChange,
  showFilters = true,
  onFilterClick,
  className,
  sortOptions = [
    { label: "Name", value: "name" },
  ],
  activeSort,
  accessControl,
}: CardTableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TableSearch
          placeholder={placeholder ?? "Search"}
          value={searchValue}
          onChange={onSearchChange ?? (() => {})}
        />

        {accessControl}

        {showSortOptions && (
        <SortingDropdown
          sortOptions={sortOptions}
          activeSort={activeSort ?? "name"}
          onSortChange={onSortChange ?? (() => {})}
        />
        )}

        {showFilters && (
        <Button variant="outline" className="gap-1" onClick={onFilterClick ?? (() => {})}>
          <Filter className="size-4" /> Filter
        </Button>
        )}
        
      </div>
    </div>
  );
}


