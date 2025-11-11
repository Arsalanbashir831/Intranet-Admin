import * as React from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments,
  getBranchDepartmentEmployees,
  getDepartmentEmployees,
  updateDepartment,
} from "@/services/departments";
import { listAllBranches } from "@/services/branches";
import type {
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
} from "@/types/departments";

// Helpers
const normalizeParams = (params?: Record<string, string | number | boolean>) => {
  if (!params) return undefined;
  const entries = Object.entries(params).sort(([a], [b]) => (a > b ? 1 : -1));
  return Object.fromEntries(entries);
};

// ---- Queries ----

export function useDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const keyParams = normalizeParams(params);
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["departments", keyParams, keyPagination],
    queryFn: () => listDepartments(keyParams, keyPagination),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useSearchDepartments(
  searchQuery: string,
  pagination?: { page?: number; pageSize?: number }
) {
  const trimmed = (searchQuery ?? "").trim();
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["departments", "search", trimmed, keyPagination],
    queryFn: () => listDepartments(trimmed ? { search: trimmed } : undefined, keyPagination),
    enabled: trimmed.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useDepartmentEmployees(
  departmentId: string,
  pagination?: { page?: number; pageSize?: number },
  params?: Record<string, string | number | boolean>
) {
  const keyParams = normalizeParams(params);
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["department-employees", String(departmentId), keyPagination, keyParams],
    queryFn: () => getDepartmentEmployees(departmentId, keyPagination, keyParams),
    enabled: !!departmentId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useBranchDepartmentEmployees(
  branchDepartmentId: number | string,
  pagination?: { page?: number; pageSize?: number },
  params?: Record<string, string | number | boolean>
) {
  const keyParams = normalizeParams(params);
  const keyPagination =
    pagination && (pagination.page || pagination.pageSize)
      ? { page: pagination.page ?? 1, pageSize: pagination.pageSize ?? 50 }
      : undefined;

  return useQuery({
    queryKey: ["branch-department-employees", String(branchDepartmentId), keyPagination, keyParams],
    queryFn: () => getBranchDepartmentEmployees(branchDepartmentId, keyPagination, keyParams),
    enabled: !!branchDepartmentId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useBranchDepartments(params?: Record<string, string | number | boolean>) {
  // Fetch branches to get branch departments since departments no longer have branch_departments
  const { data: branchesData, isLoading, error } = useQuery({
    queryKey: ["all-branches-for-branch-departments", params],
    queryFn: () => listAllBranches(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Flatten branch departments from branches
  const allBranchDepartments = React.useMemo(() => {
    if (!branchesData?.branches?.results) return [];
    
    const branchDepartments: Array<{
      id: number;
      branch: { branch_name: string };
      department: { dept_name: string };
    }> = [];
    
    branchesData.branches.results.forEach((branch) => {
      branch.departments?.forEach((dept) => {
        branchDepartments.push({
          id: dept.branch_department_id,
          branch: { branch_name: branch.branch_name },
          department: { dept_name: dept.dept_name },
        });
      });
    });
    
    return branchDepartments;
  }, [branchesData]);

  return { data: allBranchDepartments, isLoading, error };
}

export function useDepartment(id: number | string) {
  return useQuery({
    queryKey: ["departments", "detail", String(id)],
    queryFn: () => getDepartment(id),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

// ---- Mutations ----

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentCreateRequest) => createDepartment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"], exact: false });
    },
  });
}

export function useUpdateDepartment(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentUpdateRequest) => updateDepartment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"], exact: false });
      qc.invalidateQueries({ queryKey: ["departments", "detail", String(id)] });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteDepartment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"], exact: false });
    },
  });
}
