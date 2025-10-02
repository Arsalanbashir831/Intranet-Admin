import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createDepartment, 
  deleteDepartment, 
  getDepartment, 
  listDepartments,
  getBranchDepartmentEmployees,
  getDepartmentEmployees, // Add this import
  updateDepartment
} from "@/services/departments";
import type { DepartmentCreateRequest, DepartmentUpdateRequest, Department, BranchDepartment, DepartmentListResponse } from "@/services/departments";

export function useDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["departments", params, pagination],
    queryFn: () => listDepartments(params, pagination),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
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

export function useDepartmentEmployees(
  departmentId: string,
  pagination?: { page?: number; pageSize?: number },
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["department-employees", departmentId, pagination, params],
    queryFn: () => getDepartmentEmployees(departmentId, pagination, params),
    enabled: !!departmentId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useBranchDepartmentEmployees(
  branchDepartmentId: number | string,
  pagination?: { page?: number; pageSize?: number },
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["branch-department-employees", branchDepartmentId, pagination, params],
    queryFn: () => getBranchDepartmentEmployees(branchDepartmentId, pagination, params),
    enabled: !!branchDepartmentId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useBranchDepartments(params?: Record<string, string | number | boolean>) {
  const { data: departmentsData, isLoading, error } = useDepartments({ ...params, page_size: 1000 });
  
  // Extract branch departments from departments data
  const branchDepartments = Array.isArray(departmentsData)
    ? departmentsData
    : (departmentsData as DepartmentListResponse)?.departments?.results || [];
  
  // Flatten branch departments from all departments
  const allBranchDepartments = branchDepartments.flatMap((dept: Department) => {
    const deptName = dept.dept_name || (dept as Record<string, unknown>).name || 'Unknown Department';
    const branchDepartments = dept.branch_departments || [];
    
    return branchDepartments.map((bd: BranchDepartment) => ({
      id: bd.id,
      branch: bd.branch || { branch_name: (bd as Record<string, unknown>).branch_name || 'Unknown Branch' },
      department: { dept_name: deptName },
    }));
  });
  
  return {
    data: allBranchDepartments,
    isLoading,
    error,
  };
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