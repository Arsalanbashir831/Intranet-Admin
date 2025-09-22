import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listExecutiveMembers,
  getExecutiveMember,
  createExecutiveMember,
  updateExecutiveMember,
  deleteExecutiveMember,
  type ExecutiveMemberListResponse,
  type ExecutiveMemberDetailResponse,
  type ExecutiveMemberCreateRequest,
  type ExecutiveMemberUpdateRequest,
} from "@/services/executive-members";

export function useExecutiveMembers(params?: Record<string, unknown>) {
  return useQuery<ExecutiveMemberListResponse>({
    queryKey: ["executive-members", params],
    queryFn: () => listExecutiveMembers(params),
  });
}

export function useExecutiveMember(id: number | string) {
  return useQuery<ExecutiveMemberDetailResponse>({
    queryKey: ["executive-member", id],
    queryFn: () => getExecutiveMember(id),
    enabled: !!id,
  });
}

export function useCreateExecutiveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ExecutiveMemberCreateRequest) => createExecutiveMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executive-members"] });
    },
  });
}

export function useUpdateExecutiveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ExecutiveMemberUpdateRequest }) =>
      updateExecutiveMember(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["executive-members"] });
      queryClient.invalidateQueries({ queryKey: ["executive-member", id] });
    },
  });
}

export function useDeleteExecutiveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteExecutiveMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executive-members"] });
    },
  });
}
