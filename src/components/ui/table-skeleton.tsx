"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  /**
   * Number of skeleton rows to display
   * @default 5
   */
  rows?: number;
  /**
   * Number of columns to display
   * @default 4
   */
  columns?: number;
  /**
   * Custom grid column classes for proper alignment
   * @example "grid-cols-[1.2fr_1.5fr_0.8fr_0.8fr]"
   */
  headerClassName?: string;
  /**
   * Custom row classes for proper alignment
   * @example "grid-cols-[1.2fr_1.5fr_0.8fr_0.8fr]"
   */
  rowClassName?: string;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Show header skeleton
   * @default true
   */
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  headerClassName,
  rowClassName,
  className,
  showHeader = true,
}: TableSkeletonProps) {
  // Generate default grid classes based on column count
  const defaultGridClass = React.useMemo(() => {
    if (columns <= 2) return "grid-cols-2";
    if (columns === 3) return "grid-cols-3";
    if (columns === 4) return "grid-cols-4";
    if (columns === 5) return "grid-cols-5";
    if (columns === 6) return "grid-cols-6";
    return "grid-cols-4"; // fallback
  }, [columns]);

  const headerClass = headerClassName || `grid ${defaultGridClass} gap-4 px-4 py-3`;
  const rowClass = rowClassName || `grid ${defaultGridClass} gap-4 px-4 py-3`;

  return (
    <div className={cn("w-full", className)}>
      {/* Header Skeleton */}
      {showHeader && (
        <div className={cn("border-b border-gray-200", headerClass)}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4 w-20" />
          ))}
        </div>
      )}

      {/* Row Skeletons */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className={cn("hover:bg-gray-50", rowClass)}>
            {Array.from({ length: columns }).map((_, colIndex) => {
              // Vary skeleton widths for more realistic appearance
              const widths = ["w-full", "w-3/4", "w-1/2", "w-2/3", "w-5/6"];
              const randomWidth = widths[colIndex % widths.length];
              
              return (
                <div key={`cell-${rowIndex}-${colIndex}`} className="flex items-center">
                  {colIndex === 0 ? (
                    // First column often has avatar + text
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className={cn("h-4", randomWidth)} />
                    </div>
                  ) : colIndex === columns - 1 ? (
                    // Last column often has action buttons
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ) : (
                    // Regular content columns
                    <Skeleton className={cn("h-4", randomWidth)} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A more specific skeleton for card tables that matches the CardTable structure
 */
export function CardTableSkeleton({
  rows = 5,
  columns = 4,
  headerClassName,
  rowClassName,
  className,
}: Omit<TableSkeletonProps, 'showHeader'>) {
  return (
    <TableSkeleton
      rows={rows}
      columns={columns}
      headerClassName={headerClassName}
      rowClassName={rowClassName}
      className={className}
      showHeader={true}
    />
  );
}