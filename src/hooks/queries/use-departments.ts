import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment, deleteDepartment, getDepartment, listDepartments, updateDepartment } from "@/services/departments";
import type { DepartmentCreateRequest, DepartmentUpdateRequest } from "@/services/departments";

export function useDepartments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => listDepartments(params),
    staleTime: 60_000,
  });
}

export function useDepartment(id: number | string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => getDepartment(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentCreateRequest) => createDepartment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentUpdateRequest) => updateDepartment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: ["departments", id] });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteDepartment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
