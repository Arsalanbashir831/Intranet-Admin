/**
 * Reusable hook for table component state management
 * Handles search, pagination, debouncing, and edit/delete state
 */

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "./use-debounce";

export interface UseTableStateOptions {
  /**
   * Initial page number (default: 1)
   */
  initialPage?: number;
  /**
   * Initial page size (default: 10)
   */
  initialPageSize?: number;
  /**
   * Debounce delay in milliseconds (default: 300)
   */
  debounceDelay?: number;
}

export interface UseTableStateReturn<TItem> {
  // Search state
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  debouncedSearchQuery: string;
  searchParams: Record<string, string | number | boolean> | undefined;

  // Pagination state
  serverPagination: { page: number; pageSize: number };
  setServerPagination: (pagination: { page: number; pageSize: number }) => void;
  handlePageChange: (page: number, pageSize: number) => void;

  // Edit state
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  selectedItem: TItem | null;
  setSelectedItem: (item: TItem | null) => void;

  // Delete state
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;

  // Handlers
  handleSearchChange: (value: string) => void;
  resetFilters: () => void;
}

/**
 * Hook for managing table component state
 * @param options - Configuration options
 * @returns Table state and handlers
 */
export function useTableState<TItem = unknown>(
  options: UseTableStateOptions = {}
): UseTableStateReturn<TItem> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    debounceDelay = 300,
  } = options;

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  // Pagination state
  const [serverPagination, setServerPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
  });

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build search params - only include search if it has a value
  const searchParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {};
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearchQuery]);

  // Handle search change - resets pagination to page 1
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setServerPagination((prev) => ({ page: 1, pageSize: prev.pageSize }));
    },
    []
  );

  // Handle page change
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setServerPagination({ page, pageSize });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setServerPagination({ page: initialPage, pageSize: initialPageSize });
  }, [initialPage, initialPageSize]);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    searchParams,

    // Pagination state
    serverPagination,
    setServerPagination,
    handlePageChange,

    // Edit state
    editModalOpen,
    setEditModalOpen,
    selectedItem,
    setSelectedItem,

    // Delete state
    deletingId,
    setDeletingId,

    // Handlers
    handleSearchChange,
    resetFilters,
  };
}

