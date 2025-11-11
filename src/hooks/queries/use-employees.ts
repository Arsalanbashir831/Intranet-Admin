import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  listAllEmployees,
  searchEmployees,
  updateEmployee,
  uploadEmployeeProfilePicture,
  deleteEmployeeProfilePicture,
} from "@/services/employees";
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from "@/types/employees";
import { normalizeParams, defaultQueryOptions } from "@/lib/query-utils";

/** Consistent detail key (stringify id). */
const employeeDetailKey = (id: number | string) => ["employees", String(id)] as const;

/* =========================
   Queries
   ========================= */

export function useEmployees(
  params?: Record<string, string | number | boolean>,
  managerScope?: boolean
) {
  const keyParams = normalizeParams(params);
  return useQuery({
    queryKey: ["employees", keyParams, managerScope],
    queryFn: () => listEmployees(keyParams, undefined, managerScope),
    ...defaultQueryOptions,
  });
}

export function useAllEmployees(params?: Record<string, string | number | boolean>) {
  const keyParams = normalizeParams(params);
  return useQuery({
    queryKey: ["all-employees", keyParams],
    queryFn: () => listAllEmployees(keyParams),
    ...defaultQueryOptions,
  });
}

export function useSearchEmployees(
  searchQuery: string,
  params?: Record<string, string | number | boolean>
) {
  const trimmed = (searchQuery ?? "").trim();
  const keyParams = normalizeParams(params);

  return useQuery({
    queryKey: ["search-employees", trimmed, keyParams],
    queryFn: () => searchEmployees(trimmed, keyParams),
    enabled: trimmed.length > 0,
    ...defaultQueryOptions,
    staleTime: 30_000, // Override: slightly fresher for search
  });
}

export function useEmployee(id: number | string, managerScope?: boolean) {
  const key = employeeDetailKey(id);
  return useQuery({
    queryKey: [...key, managerScope],
    queryFn: () => getEmployee(id, managerScope),
    enabled: !!id,
    ...defaultQueryOptions,
  });
}

/* =========================
   Mutations
   ========================= */

export function useCreateEmployee(managerScope?: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeCreateRequest) => createEmployee(payload, managerScope),
    onSuccess: () => {
      // broad invalidations for any list/search variants
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
    },
  });
}

export function useUpdateEmployee(id: number | string, managerScope?: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeUpdateRequest) => updateEmployee(id, payload, managerScope),
    onSuccess: () => {
      // keep lists + searches fresh, and the detail page for this id
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
      qc.invalidateQueries({ queryKey: employeeDetailKey(id) });
    },
  });
}

export function useDeleteEmployee(managerScope?: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteEmployee(id, managerScope),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
      // also invalidate detail in case you were on the profile
      qc.invalidateQueries({ queryKey: employeeDetailKey(id) });
    },
  });
}

export function useUploadEmployeeProfilePicture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number | string; file: File }) =>
      uploadEmployeeProfilePicture(id, file),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
      qc.invalidateQueries({ queryKey: employeeDetailKey(id) });
    },
  });
}

export function useDeleteEmployeeProfilePicture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteEmployeeProfilePicture(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
      qc.invalidateQueries({ queryKey: employeeDetailKey(id) });
    },
  });
}
