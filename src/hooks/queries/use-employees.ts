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
  deleteEmployeeProfilePicture
} from "@/services/employees";
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from "@/services/employees";

export function useEmployees(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => listEmployees(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useAllEmployees(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ["all-employees", params],
    queryFn: () => listAllEmployees(params),
    staleTime: 60_000,
  });
}

export function useSearchEmployees(searchQuery: string, params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ["search-employees", searchQuery, params],
    queryFn: () => searchEmployees(searchQuery, params),
    enabled: !!searchQuery && searchQuery.length > 0, // Only search if query exists
    staleTime: 30_000, // Shorter stale time for search results
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
      qc.invalidateQueries({ queryKey: ["all-employees"] });
    },
  });
}

export function useUpdateEmployee(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeUpdateRequest) => updateEmployee(id, payload),
    onSuccess: () => {
      // Invalidate both list and detail to ensure profile picture updates are reflected
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["all-employees"] });
      qc.invalidateQueries({ queryKey: ["employees", id] });
      qc.invalidateQueries({ queryKey: ["employees", String(id)] }); // Handle both string and number ids
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["all-employees"] });
    },
  });
}

export function useUploadEmployeeProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file }: { id: number | string; file: File }) =>
      uploadEmployeeProfilePicture(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["all-employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees", id] });
    },
  });
}

export function useDeleteEmployeeProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteEmployeeProfilePicture(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["all-employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees", id] });
    },
  });
}


