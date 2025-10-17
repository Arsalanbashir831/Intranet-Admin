import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createAnnouncement, 
  deleteAnnouncement, 
  getAnnouncement, 
  listAnnouncements,
  updateAnnouncement,
  createAnnouncementAttachment,
  deleteAnnouncementAttachment,
  listAnnouncementAttachments
} from "@/services/announcements";
import type { 
  AnnouncementCreateRequest, 
  AnnouncementUpdateRequest,
  AnnouncementAttachmentCreateRequest,
  AnnouncementListResponse
} from "@/services/announcements";

export function useAnnouncements(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number },
  options?: { 
    placeholderData?: (previousData?: AnnouncementListResponse) => AnnouncementListResponse | undefined;
    managerScope?: boolean;
  }
) {
  return useQuery({
    queryKey: ["announcements", params, pagination, options?.managerScope],
    queryFn: () => {
      // Only add include_inactive if not already specified in params
      const queryParams = {
        ...params,
        ...(params?.include_inactive === undefined && { include_inactive: true })
      };
      return listAnnouncements(queryParams, pagination, options?.managerScope);
    },
    staleTime: 60_000,
    placeholderData: options?.placeholderData,
  });
}

export function useAnnouncement(id: number | string, managerScope?: boolean) {
  return useQuery({
    queryKey: ["announcements", id, managerScope],
    queryFn: () => getAnnouncement(id, managerScope),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateAnnouncement(managerScope?: boolean) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AnnouncementCreateRequest) => createAnnouncement(payload, managerScope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useUpdateAnnouncement(id: number | string, managerScope?: boolean) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AnnouncementUpdateRequest) => updateAnnouncement(id, payload, managerScope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements", id] });
      queryClient.invalidateQueries({ queryKey: ["announcements", String(id)] }); // Handle both string and number ids
    },
  });
}

export function useDeleteAnnouncement(managerScope?: boolean) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteAnnouncement(id, managerScope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// Announcement Attachment hooks
export function useAnnouncementAttachments(
  announcementId: number | string,
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["announcement-attachments", announcementId, params],
    queryFn: () => listAnnouncementAttachments(announcementId, params),
    enabled: !!announcementId,
    staleTime: 60_000,
  });
}

export function useCreateAnnouncementAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AnnouncementAttachmentCreateRequest) => createAnnouncementAttachment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["announcement-attachments", variables.announcement] });
      queryClient.invalidateQueries({ queryKey: ["announcements", variables.announcement] });
    },
  });
}

export function useDeleteAnnouncementAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteAnnouncementAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-attachments"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
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