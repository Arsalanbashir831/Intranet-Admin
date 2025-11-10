import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listPolls,
  getPoll,
  createPoll,
  deletePoll,
} from "@/services/polls";
import type { PollCreateRequest } from "@/types/polls";
import { useManagerScope } from "@/contexts/manager-scope-context";

export function usePolls(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const { isManager } = useManagerScope();
  
  return useQuery({
    queryKey: ["polls", params, pagination, isManager],
    queryFn: () => listPolls(params, pagination, isManager),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

export function usePoll(id: number | string) {
  return useQuery({
    queryKey: ["polls", id],
    queryFn: () => getPoll(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PollCreateRequest) => createPoll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll created successfully");
    },
    onError: (error) => {
      console.error("Poll creation failed:", error);
      toast.error("Failed to create poll");
    },
  });
}


export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deletePoll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll deleted successfully");
    },
    onError: (error) => {
      console.error("Poll deletion failed:", error);
      toast.error("Failed to delete poll");
    },
  });
}
