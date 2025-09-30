import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createDepartment, 
  deleteDepartment, 
  getDepartment, 
  listDepartments, 
  updateDepartment,
  getBranchDepartmentEmployees
} from "@/services/departments";
import type { DepartmentCreateRequest, DepartmentUpdateRequest } from "@/services/departments";

export function useDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["departments", params, pagination],
    queryFn: () => listDepartments(params, pagination),
    staleTime: 60_000,
  });
}

export function useSearchDepartments(
  searchQuery: string,
  pagination?: { page?: number; pageSize?: number }
) {
  const params = searchQuery ? { search: searchQuery } : undefined;
  return useQuery({
    queryKey: ["departments", "search", searchQuery, pagination],
    queryFn: () => listDepartments(params, pagination),
    enabled: !!searchQuery,
    staleTime: 60_000,
  });
}

export function useBranchDepartmentEmployees(
  branchDepartmentId: number | string,
  pagination?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["branch-department-employees", branchDepartmentId, pagination],
    queryFn: () => getBranchDepartmentEmployees(branchDepartmentId, pagination),
    enabled: !!branchDepartmentId,
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
