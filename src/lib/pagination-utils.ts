/**
 * Utility functions for handling server-side pagination
 */

export interface PaginationInfo {
  count: number;
  page: number;
  page_size: number;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

/**
 * Calculate total number of pages based on count and page size
 */
export function calculateTotalPages(count: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.ceil(count / pageSize);
}

/**
 * Generate page numbers array for pagination display
 * Shows first page, last page, current page and surrounding pages with ellipsis
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 3
): (number | "...")[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | "...")[] = [];
  const halfVisible = Math.floor(maxVisiblePages / 2);
  
  // Always show first page
  pages.push(0);
  
  // Calculate start and end of middle section
  let start = Math.max(1, currentPage - halfVisible + 1);
  let end = Math.min(totalPages - 2, currentPage + halfVisible - 1);
  
  // Adjust if we're near the beginning
  if (currentPage < halfVisible) {
    end = Math.min(totalPages - 2, maxVisiblePages - 2);
  }
  
  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    start = Math.max(1, totalPages - maxVisiblePages + 1);
  }
  
  // Add ellipsis before middle section if needed
  if (start > 1) {
    pages.push("...");
  }
  
  // Add middle pages
  for (let i = start; i <= end; i++) {
    if (i > 0 && i < totalPages - 1) {
      pages.push(i);
    }
  }
  
  // Add ellipsis after middle section if needed
  if (end < totalPages - 2) {
    pages.push("...");
  }
  
  // Always show last page (if there's more than one page)
  if (totalPages > 1) {
    pages.push(totalPages - 1);
  }
  
  return pages;
}

/**
 * Convert zero-based page index to one-based page number for API
 */
export function pageIndexToPageNumber(pageIndex: number): number {
  return pageIndex + 1;
}

/**
 * Convert one-based page number from API to zero-based page index
 */
export function pageNumberToPageIndex(pageNumber: number): number {
  return Math.max(0, pageNumber - 1);
}

/**
 * Generate query parameters for API pagination
 */
export function generatePaginationParams(
  pageIndex: number,
  pageSize: number
): Record<string, string> {
  return {
    page: pageIndexToPageNumber(pageIndex).toString(),
    page_size: pageSize.toString(),
  };
}

/**
 * Check if pagination info indicates there are more pages
 */
export function hasNextPage(paginationInfo: PaginationInfo): boolean {
  const totalPages = calculateTotalPages(paginationInfo.count, paginationInfo.page_size);
  return paginationInfo.page < totalPages;
}

/**
 * Check if pagination info indicates there are previous pages
 */
export function hasPreviousPage(paginationInfo: PaginationInfo): boolean {
  return paginationInfo.page > 1;
}