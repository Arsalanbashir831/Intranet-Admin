import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllFiles,
  getFiles,
  getFile,
  createFile,
  updateFile,
  patchFile,
  deleteFile,
  bulkUploadFiles,
} from "@/services/knowledge-files";
import type { FileCreateRequest, FileUpdateRequest, FileListParams, PatchedKnowledgeFile } from "@/types/knowledge";

// Query keys
export const fileKeys = {
  all: ["knowledge-files"] as const,
  lists: () => [...fileKeys.all, "list"] as const,
  list: (params?: FileListParams) => [...fileKeys.lists(), params] as const,
  details: () => [...fileKeys.all, "detail"] as const,
  detail: (id: number | string) => [...fileKeys.details(), id] as const,
  byFolder: (folderId: number) => [...fileKeys.all, "folder", folderId] as const,
};

// Query hooks
export const useGetFiles = (params?: FileListParams) => {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => getFiles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetAllFiles = (folderId?: number) => {
  return useQuery({
    queryKey: folderId ? fileKeys.byFolder(folderId) : fileKeys.lists(),
    queryFn: () => getAllFiles(folderId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetFile = (id: number | string, enabled: boolean = true) => {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => getFile(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
export const useCreateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FileCreateRequest) => createFile(data),
    onSuccess: () => {
      // Invalidate and refetch file queries
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
      // Also invalidate folder queries since files belong to folders
      queryClient.invalidateQueries({ queryKey: ["knowledge-folders"] });
      // Invalidate folder tree queries (used by folder details table)
      queryClient.invalidateQueries({ queryKey: ["knowledge-folders", "tree"] });
      toast.success("File uploaded successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to upload file";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: FileUpdateRequest }) =>
      updateFile(id, data),
    onSuccess: (data, variables) => {
      // Update the specific file in cache
      queryClient.setQueryData(fileKeys.detail(variables.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
      toast.success("File updated successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to update file";
      toast.error(errorMessage);
    },
  });
};

export const usePatchFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: FileUpdateRequest | PatchedKnowledgeFile }) => {
      // Convert to PatchedKnowledgeFile - handle type differences
      const patchData: PatchedKnowledgeFile = {
        folder: data.folder,
        name: data.name,
        description: data.description,
        inherits_parent_permissions: data.inherits_parent_permissions,
        // Convert string[] to number[] if needed (FileUpdateRequest uses string[], PatchedKnowledgeFile uses number[])
        permitted_branches: data.permitted_branches 
          ? (typeof data.permitted_branches[0] === 'string' 
              ? (data.permitted_branches as string[]).map(Number).filter(n => !isNaN(n))
              : data.permitted_branches as number[])
          : undefined,
        permitted_departments: data.permitted_departments
          ? (typeof data.permitted_departments[0] === 'string'
              ? (data.permitted_departments as string[]).map(Number).filter(n => !isNaN(n))
              : data.permitted_departments as number[])
          : undefined,
        permitted_employees: data.permitted_employees
          ? (typeof data.permitted_employees[0] === 'string'
              ? (data.permitted_employees as string[]).map(Number).filter(n => !isNaN(n))
              : data.permitted_employees as number[])
          : undefined,
        // Only include file if it's a string (URL), not a File object
        file: data.file && typeof data.file === 'string' ? data.file : undefined,
      };
      return patchFile(id, patchData);
    },
    onSuccess: (data, variables) => {
      // Update the specific file in cache
      queryClient.setQueryData(fileKeys.detail(variables.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
      toast.success("File updated successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to patch file";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteFile(id),
    onSuccess: (_, id) => {
      // Remove the deleted file from cache
      queryClient.removeQueries({ queryKey: fileKeys.detail(id) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
      // Invalidate folder tree queries (used by folder details table)
      queryClient.invalidateQueries({ queryKey: ["knowledge-folders", "tree"] });
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to delete file";
      toast.error(errorMessage);
    },
  });
};

export const useBulkUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, folderId }: { files: File[]; folderId: number }) =>
      bulkUploadFiles(files, folderId),
    onSuccess: () => {
      // Invalidate and refetch file queries
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
      // Also invalidate folder queries since files belong to folders
      queryClient.invalidateQueries({ queryKey: ["knowledge-folders"] });
      toast.success("Files uploaded successfully");
    },
    onError: (error: Error) => {
      const errorMessage = error?.message || "Failed to upload files";
      toast.error(errorMessage);
    },
  });
};