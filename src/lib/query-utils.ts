/**
 * Query utility functions for React Query
 * Common utilities for building query keys, normalizing parameters, and default options
 */

import { keepPreviousData } from "@tanstack/react-query";

/**
 * Normalizes query parameters to ensure stable query keys
 * Sorts parameter entries by key to ensure consistent query key generation
 * @param params - Parameters object with string, number, or boolean values
 * @returns Normalized parameters object or undefined if params is empty
 */
export function normalizeParams(
  params?: Record<string, string | number | boolean>
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const entries = Object.entries(params).sort(([a], [b]) => (a > b ? 1 : -1));
  return Object.fromEntries(entries);
}

/**
 * Default query options for React Query
 * Provides consistent caching and refetching behavior across the application
 */
export const defaultQueryOptions = {
  staleTime: 60_000, // 1 minute
  refetchOnWindowFocus: false,
  placeholderData: keepPreviousData,
} as const;

/**
 * Builds pagination parameters for query keys
 * Normalizes pagination to ensure consistent query key generation
 * @param pagination - Pagination object with page and pageSize
 * @param defaultPageSize - Default page size if not provided
 * @returns Normalized pagination object or undefined
 */
export function normalizePagination(
  pagination?: { page?: number; pageSize?: number },
  defaultPageSize: number = 50
): { page: number; pageSize: number } | undefined {
  if (!pagination || (!pagination.page && !pagination.pageSize)) {
    return undefined;
  }
  return {
    page: pagination.page ?? 1,
    pageSize: pagination.pageSize ?? defaultPageSize,
  };
}

