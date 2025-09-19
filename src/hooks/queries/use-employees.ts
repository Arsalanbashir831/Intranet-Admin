import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, deleteEmployee, getEmployee, listEmployees, updateEmployee } from "@/services/employees";
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from "@/services/employees";

export function useEmployees(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => listEmployees(params),
    staleTime: 60_000,
  });
}

export function useEmployee(id: number | string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeCreateRequest) => createEmployee(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeUpdateRequest) => updateEmployee(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employees", id] });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}


