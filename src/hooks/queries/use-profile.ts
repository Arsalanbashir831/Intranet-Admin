import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  updateProfilePartial,
  getExtendedProfile,
  createExtendedProfile,
  getProfilePicture,
  uploadProfilePicture,
  deleteProfilePicture,
  getUserStatistics,
} from "@/services/profile";

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'profile'] as const,
  extended: () => [...profileKeys.all, 'extended'] as const,
  picture: () => [...profileKeys.all, 'picture'] as const,
  statistics: () => [...profileKeys.all, 'statistics'] as const,
};

function hasAccessToken(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith('accessToken='));
}

// Get current user profile
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: getProfile,
    enabled: hasAccessToken(),
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number } };
      // Do not retry on 401/403
      const status = err?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper to clear profile cache on logout
export function useClearProfileOnLogout() {
  const qc = useQueryClient();
  React.useEffect(() => {
    const handler = () => {
      qc.removeQueries({ queryKey: profileKeys.all });
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [qc]);
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.profile(), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Update user profile (partial)
export function useUpdateProfilePartial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfilePartial,
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.profile(), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Get extended profile
export function useExtendedProfile() {
  return useQuery({
    queryKey: profileKeys.extended(),
    queryFn: getExtendedProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create/update extended profile
export function useCreateExtendedProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExtendedProfile,
    onSuccess: () => {
      // Invalidate extended profile query
      queryClient.invalidateQueries({ queryKey: profileKeys.extended() });
    },
  });
}

// Get profile picture
export function useProfilePicture() {
  return useQuery({
    queryKey: profileKeys.picture(),
    queryFn: getProfilePicture,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: false, // Don't fetch automatically
  });
}

// Upload profile picture
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: () => {
      // Invalidate profile and picture queries
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: profileKeys.picture() });
    },
  });
}

// Delete profile picture
export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProfilePicture,
    onSuccess: () => {
      // Invalidate profile and picture queries
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: profileKeys.picture() });
    },
  });
}

// Get user statistics (admin only)
export function useUserStatistics() {
  return useQuery({
    queryKey: profileKeys.statistics(),
    queryFn: getUserStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
