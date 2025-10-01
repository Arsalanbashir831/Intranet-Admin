import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listExecutives,
  getExecutive,
  createExecutive,
  updateExecutive,
  deleteExecutive,
  uploadExecutiveProfilePicture,
  deleteExecutiveProfilePicture,
  type ExecutiveListResponse,
  type ExecutiveDetailResponse,
  type ExecutiveCreateRequest,
  type ExecutiveUpdateRequest,
} from "@/services/executive-members";

export function useExecutives(params?: Record<string, string | number | boolean>) {
  return useQuery<ExecutiveListResponse>({
    queryKey: ["executives", params],
    queryFn: () => listExecutives(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useExecutive(id: number | string) {
  return useQuery<ExecutiveDetailResponse>({
    queryKey: ["executives", id],
    queryFn: () => getExecutive(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateExecutive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ExecutiveCreateRequest) => createExecutive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executives"] });
    },
  });
}

export function useUpdateExecutive(id: number | string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ExecutiveUpdateRequest) => updateExecutive(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executives"] });
      queryClient.invalidateQueries({ queryKey: ["executives", id] });
    },
  });
}

export function useDeleteExecutive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteExecutive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executives"] });
    },
  });
}

export function useUploadExecutiveProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file }: { id: number | string; file: File }) =>
      uploadExecutiveProfilePicture(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["executives"] });
      queryClient.invalidateQueries({ queryKey: ["executives", id] });
    },
  });
}

export function useDeleteExecutiveProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteExecutiveProfilePicture(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["executives"] });
      queryClient.invalidateQueries({ queryKey: ["executives", id] });
    },
  });
}
