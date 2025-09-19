import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/api-routes";

// Types based on the API schema
export interface UserProfile {
  readonly id: number;
  username: string;
  readonly email: string;
  first_name?: string;
  last_name?: string;
  readonly full_name: string;
  phone_number?: string;
  gender?: "M" | "F" | "O" | "";
  date_of_birth?: string | null;
  city?: string;
  country?: string;
  postal_code?: string;
  readonly role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  readonly status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  about?: string;
  profile_picture?: string | null;
  readonly profile_picture_url: string;
  readonly email_verified: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: "M" | "F" | "O" | "";
  date_of_birth?: string | null;
  city?: string;
  country?: string;
  postal_code?: string;
  about?: string;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
  users_by_role: {
    admin: number;
    manager: number;
    employee: number;
  };
}

// Profile service functions
export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get(API_ROUTES.PROFILE.GET);
  return response.data;
};

export const updateProfile = async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
  const response = await api.put(API_ROUTES.PROFILE.UPDATE, data);
  return response.data;
};

export const updateProfilePartial = async (data: Partial<UserProfileUpdateRequest>): Promise<UserProfile> => {
  const response = await api.patch(API_ROUTES.PROFILE.UPDATE, data);
  return response.data;
};

export const getExtendedProfile = async (): Promise<unknown> => {
  const response = await api.get(API_ROUTES.PROFILE.EXTENDED);
  return response.data;
};

export const createExtendedProfile = async (data: unknown): Promise<unknown> => {
  const response = await api.post(API_ROUTES.PROFILE.EXTENDED, data);
  return response.data;
};

export const getProfilePicture = async (): Promise<Blob> => {
  const response = await api.get(API_ROUTES.PROFILE.PICTURE, {
    responseType: 'blob'
  });
  return response.data;
};

export const uploadProfilePicture = async (file: File): Promise<unknown> => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  const response = await api.post(API_ROUTES.PROFILE.PICTURE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProfilePicture = async (): Promise<void> => {
  await api.delete(API_ROUTES.PROFILE.PICTURE);
};

export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response = await api.get(API_ROUTES.PROFILE.STATISTICS);
  return response.data;
};
