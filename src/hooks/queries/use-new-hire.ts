import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createChecklist, 
  deleteChecklist, 
  getChecklist, 
  listChecklists,
  updateChecklist,
  createAttachment,
  deleteAttachment,
  getAttachment,
  listAttachments,
  updateAttachment,
  createAttachmentFile,
  deleteAttachmentFile,
  getAttachmentFile,
  listAttachmentFiles
} from "@/services/new-hire";
import type { 
  ChecklistCreateRequest, 
  ChecklistUpdateRequest,
  AttachmentCreateRequest,
  AttachmentUpdateRequest,
  AttachmentFileCreateRequest 
} from "@/services/new-hire";

// Checklist hooks
export function useChecklists(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["checklists", params, pagination],
    queryFn: () => listChecklists(params, pagination),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useChecklist(id: number | string) {
  return useQuery({
    queryKey: ["checklists", id],
    queryFn: () => getChecklist(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: ChecklistCreateRequest) => createChecklist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
}

export function useUpdateChecklist(id: number | string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: ChecklistUpdateRequest) => updateChecklist(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists", id] });
      queryClient.invalidateQueries({ queryKey: ["checklists", String(id)] }); // Handle both string and number ids
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteChecklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
}

// Attachment hooks
export function useAttachments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["attachments", params, pagination],
    queryFn: () => listAttachments(params, pagination),
    staleTime: 60_000,
  });
}

export function useChecklistAttachments(checklistId: number | string) {
  return useQuery({
    queryKey: ["attachments", "checklist", checklistId],
    queryFn: () => listAttachments({ checklist: checklistId }),
    enabled: !!checklistId,
    staleTime: 60_000,
  });
}

export function useAttachment(id: number | string) {
  return useQuery({
    queryKey: ["attachments", id],
    queryFn: () => getAttachment(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AttachmentCreateRequest) => createAttachment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["attachments", "checklist", variables.checklist] });
      queryClient.invalidateQueries({ queryKey: ["checklists", variables.checklist] });
    },
  });
}

export function useUpdateAttachment(id: number | string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AttachmentUpdateRequest) => updateAttachment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["attachments", id] });
      queryClient.invalidateQueries({ queryKey: ["attachments", String(id)] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
}

// Attachment File hooks
export function useAttachmentFiles(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["attachment-files", params, pagination],
    queryFn: () => listAttachmentFiles(params, pagination),
    staleTime: 60_000,
  });
}

export function useAttachmentFilesForAttachment(attachmentId: number | string) {
  return useQuery({
    queryKey: ["attachment-files", "attachment", attachmentId],
    queryFn: () => listAttachmentFiles({ attachment: attachmentId }),
    enabled: !!attachmentId,
    staleTime: 60_000,
  });
}

export function useAttachmentFile(id: number | string) {
  return useQuery({
    queryKey: ["attachment-files", id],
    queryFn: () => getAttachmentFile(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateAttachmentFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AttachmentFileCreateRequest) => createAttachmentFile(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attachment-files"] });
      queryClient.invalidateQueries({ queryKey: ["attachment-files", "attachment", variables.attachment] });
      queryClient.invalidateQueries({ queryKey: ["attachments", variables.attachment] });
    },
  });
}

export function useDeleteAttachmentFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteAttachmentFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachment-files"] });
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });
}

// Hook to track attachments to be deleted
export function useAttachmentDeletions() {
  const [deletedAttachmentIds, setDeletedAttachmentIds] = React.useState<number[]>([]);
  
  const markForDeletion = (id: number) => {
    setDeletedAttachmentIds(prev => [...prev, id]);
  };
  
  const unmarkForDeletion = (id: number) => {
    setDeletedAttachmentIds(prev => prev.filter(deletedId => deletedId !== id));
  };
  
  const clearDeletions = () => {
    setDeletedAttachmentIds([]);
  };
  
  return {
    deletedAttachmentIds,
    markForDeletion,
    unmarkForDeletion,
    clearDeletions
  };
}

// Hook to track attachment files to be deleted
export function useAttachmentFileDeletions() {
  const [deletedFileIds, setDeletedFileIds] = React.useState<number[]>([]);
  
  const markForDeletion = (id: number) => {
    setDeletedFileIds(prev => [...prev, id]);
  };
  
  const unmarkForDeletion = (id: number) => {
    setDeletedFileIds(prev => prev.filter(deletedId => deletedId !== id));
  };
  
  const clearDeletions = () => {
    setDeletedFileIds([]);
  };
  
  return {
    deletedFileIds,
    markForDeletion,
    unmarkForDeletion,
    clearDeletions
  };
}