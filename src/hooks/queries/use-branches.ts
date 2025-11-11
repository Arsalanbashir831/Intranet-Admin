import { useQuery, useMutation, useQueryClient, keepPreviousData  } from "@tanstack/react-query";
import {
  createBranch,
  deleteBranch,
  getBranch,
  listBranches,
  listAllBranches,
  updateBranch,
  listBranchDepartments,
} from "@/services/branches";
import type { BranchCreateRequest, BranchUpdateRequest } from "@/types/branches";

// Helper: make params stable in the query key
const normalizeParams = (params?: Record<string, string | number | boolean>) => {
  if (!params) return undefined;
  const entries = Object.entries(params).sort(([a], [b]) => (a > b ? 1 : -1));
  return Object.fromEntries(entries);
};

// ---- Queries ----

export function useBranches(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const keyParams = normalizeParams(params);
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["branches", keyParams, keyPagination],
    queryFn: () => listBranches(keyParams, keyPagination),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useAllBranches(params?: Record<string, string | number | boolean>) {
  const keyParams = normalizeParams(params);
  return useQuery({
    queryKey: ["all-branches", keyParams],
    queryFn: () => listAllBranches(keyParams),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useSearchBranches(
  searchQuery: string,
  pagination?: { page?: number; pageSize?: number }
) {
  const trimmed = (searchQuery ?? "").trim();
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["branches", "search", trimmed, keyPagination],
    queryFn: () => listBranches(trimmed ? { search: trimmed } : undefined, keyPagination),
    enabled: trimmed.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useBranch(id: number | string) {
  return useQuery({
    queryKey: ["branches", "detail", String(id)],
    queryFn: () => getBranch(id),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

// ---- Mutations ----

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchCreateRequest) => createBranch(payload),
    onSuccess: () => {
      // Invalidate any list/search/detail variants under "branches" + all-branches
      qc.invalidateQueries({ queryKey: ["branches"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-branches"], exact: false });
    },
  });
}

export function useUpdateBranch(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchUpdateRequest) => updateBranch(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-branches"], exact: false });
      qc.invalidateQueries({ queryKey: ["branches", "detail", String(id)] });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteBranch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-branches"], exact: false });
    },
  });
}

// ---- Branch Departments Queries ----

export function useBranchDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const keyParams = normalizeParams(params);
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 1000 }
      : undefined;

  return useQuery({
    queryKey: ["branch-departments", keyParams, keyPagination],
    queryFn: () => listBranchDepartments(keyParams, keyPagination),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useSearchBranchDepartments(
  searchQuery: string,
  pagination?: { page?: number; pageSize?: number }
) {
  const trimmed = (searchQuery ?? "").trim();
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 1000 }
      : undefined;

  return useQuery({
    queryKey: ["branch-departments", "search", trimmed, keyPagination],
    queryFn: () => listBranchDepartments(trimmed ? { search: trimmed } : undefined, keyPagination),
    enabled: trimmed.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
