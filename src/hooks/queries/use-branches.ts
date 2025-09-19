import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBranch, deleteBranch, getBranch, listBranches, updateBranch } from "@/services/branches";
import type { BranchCreateRequest, BranchUpdateRequest } from "@/services/branches";

export function useBranches(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["branches", params],
    queryFn: () => listBranches(params),
    staleTime: 60_000,
  });
}

export function useBranch(id: number | string) {
  return useQuery({
    queryKey: ["branches", id],
    queryFn: () => getBranch(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchCreateRequest) => createBranch(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranch(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchUpdateRequest) => updateBranch(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      qc.invalidateQueries({ queryKey: ["branches", id] });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteBranch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}
