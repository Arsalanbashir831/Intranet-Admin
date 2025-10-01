import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllFolders,
  getFolders,
  getFolder,
  getFolderTree,
  createFolder,
  updateFolder,
  patchFolder,
  deleteFolder,
  searchFolders,
  FolderCreateRequest,
  FolderUpdateRequest,
  FolderPatchRequest,
  FolderListParams,
} from "@/services/knowledge-folders";

// Query keys
export const folderKeys = {
  all: ["knowledge-folders"] as const,
  lists: () => [...folderKeys.all, "list"] as const,
  list: (params?: FolderListParams) => [...folderKeys.lists(), params] as const,
  details: () => [...folderKeys.all, "detail"] as const,
  detail: (id: number | string) => [...folderKeys.details(), id] as const,
  tree: (employeeId?: number | string) => [...folderKeys.all, "tree", employeeId] as const,
};

// Query hooks
export const useGetFolders = (params?: FolderListParams) => {
  return useQuery({
    queryKey: folderKeys.list(params),
    queryFn: () => getFolders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetAllFolders = () => {
  return useQuery({
    queryKey: folderKeys.lists(),
    queryFn: getAllFolders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

export const useSearchFolders = (params?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: [...folderKeys.lists(), params],
    queryFn: () => searchFolders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

export const useGetFolder = (id: number | string, enabled: boolean = true) => {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => getFolder(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetFolderTree = (employeeId?: number | string) => {
  return useQuery({
    queryKey: folderKeys.tree(employeeId),
    queryFn: () => getFolderTree(employeeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderData: FolderCreateRequest) => createFolder(folderData),
    onSuccess: () => {
      // Invalidate and refetch folder queries
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      toast.success("Folder created successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to create folder";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: FolderUpdateRequest }) =>
      updateFolder(id, data),
    onSuccess: (data, variables) => {
      // Update the specific folder in cache
      queryClient.setQueryData(folderKeys.detail(variables.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success("Folder updated successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to update folder";
      toast.error(errorMessage);
    },
  });
};

export const usePatchFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: FolderPatchRequest }) =>
      patchFolder(id, data),
    onSuccess: (data, variables) => {
      // Update the specific folder in cache
      queryClient.setQueryData(folderKeys.detail(variables.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success("Folder updated successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to update folder";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteFolder(id),
    onSuccess: (_, id) => {
      // Remove the deleted folder from cache
      queryClient.removeQueries({ queryKey: folderKeys.detail(id) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success("Folder deleted successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to delete folder";
      toast.error(errorMessage);
    },
  });
};