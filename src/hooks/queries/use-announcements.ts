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
  options?: { placeholderData?: (previousData?: AnnouncementListResponse) => AnnouncementListResponse | undefined }
) {
  return useQuery({
    queryKey: ["announcements", params, pagination],
    queryFn: () => {
      // Always include inactive announcements (drafts) in the results
      const queryParams = {
        ...params,
        include_inactive: true
      };
      return listAnnouncements(queryParams, pagination);
    },
    staleTime: 60_000,
    placeholderData: options?.placeholderData,
  });
}

export function useAnnouncement(id: number | string) {
  return useQuery({
    queryKey: ["announcements", id],
    queryFn: () => getAnnouncement(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AnnouncementCreateRequest) => createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useUpdateAnnouncement(id: number | string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AnnouncementUpdateRequest) => updateAnnouncement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements", id] });
      queryClient.invalidateQueries({ queryKey: ["announcements", String(id)] }); // Handle both string and number ids
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => deleteAnnouncement(id),
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