import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from "@/services/roles";
import type { RoleCreateRequest, RoleUpdateRequest } from "@/types/roles";

// Helper: make params stable in the query key
const normalizeParams = (params?: Record<string, string | number | boolean>) => {
  if (!params) return undefined;
  const entries = Object.entries(params).sort(([a], [b]) => (a > b ? 1 : -1));
  return Object.fromEntries(entries);
};

// ---- Queries ----

export function useRoles(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const keyParams = normalizeParams(params);
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["roles", keyParams, keyPagination],
    queryFn: () => listRoles(keyParams, keyPagination),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useSearchRoles(
  searchQuery: string,
  pagination?: { page?: number; pageSize?: number }
) {
  const trimmed = (searchQuery ?? "").trim();
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["roles", "search", trimmed, keyPagination],
    queryFn: () => listRoles(trimmed ? { search: trimmed } : undefined, keyPagination),
    enabled: trimmed.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

// ---- Mutations ----

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleCreateRequest) => createRole(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"], exact: false });
    },
  });
}

export function useUpdateRole(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleUpdateRequest) => updateRole(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"], exact: false });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"], exact: false });
    },
  });
}

