import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from "@/services/employees";

/** Ensure params are stable in the query key (avoid refetches from key identity churn). */
const normalizeParams = (params?: Record<string, string | number | boolean>) => {
  if (!params) return undefined as undefined;
  const entries = Object.entries(params).sort(([a], [b]) => (a > b ? 1 : -1));
  return Object.fromEntries(entries) as Record<string, string | number | boolean>;
};

/** Consistent detail key (stringify id). */
const employeeDetailKey = (id: number | string) => ["employees", String(id)] as const;

/* =========================
   Queries
   ========================= */

export function useEmployees(params?: Record<string, string | number | boolean>) {
  const keyParams = normalizeParams(params);
  return useQuery({
    queryKey: ["employees", keyParams],
    queryFn: () => listEmployees(keyParams),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // keep prior page while fetching
  });
}

export function useAllEmployees(params?: Record<string, string | number | boolean>) {
  const keyParams = normalizeParams(params);
  return useQuery({
    queryKey: ["all-employees", keyParams],
    queryFn: () => listAllEmployees(keyParams),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
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
    enabled: trimmed.length > 0,          // only fetch if there's a query
    staleTime: 30_000,                    // slightly fresher for search
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,    // avoid blinking when typing
  });
}

export function useEmployee(id: number | string) {
  const key = employeeDetailKey(id);
  return useQuery({
    queryKey: key,
    queryFn: () => getEmployee(id),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // keeps old detail while refreshing
  });
}

/* =========================
   Mutations
   ========================= */

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeCreateRequest) => createEmployee(payload),
    onSuccess: () => {
      // broad invalidations for any list/search variants
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
    },
  });
}

export function useUpdateEmployee(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeUpdateRequest) => updateEmployee(id, payload),
    onSuccess: () => {
      // keep lists + searches fresh, and the detail page for this id
      qc.invalidateQueries({ queryKey: ["employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["all-employees"], exact: false });
      qc.invalidateQueries({ queryKey: ["search-employees"], exact: false });
      qc.invalidateQueries({ queryKey: employeeDetailKey(id) });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteEmployee(id),
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
