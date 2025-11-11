import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createManager, 
  deleteManager, 
  getManager, 
  listManagers, 
  updateManager
} from "@/services/managers";
import type { ManagerCreateRequest, ManagerUpdateRequest } from "@/types/managers";

export function useManagers(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["managers", params],
    queryFn: () => listManagers(params),
    staleTime: 60_000,
  });
}

export function useManager(id: number | string) {
  return useQuery({
    queryKey: ["managers", id],
    queryFn: () => getManager(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManagerCreateRequest) => createManager(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateManager(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManagerUpdateRequest) => updateManager(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      qc.invalidateQueries({ queryKey: ["managers", id] });
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteManager(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}