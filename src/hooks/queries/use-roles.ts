import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from "@/services/roles";
import type { RoleCreateRequest, RoleUpdateRequest } from "@/types/roles";
import { normalizeParams, defaultQueryOptions } from "@/lib/query-utils";

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
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
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

