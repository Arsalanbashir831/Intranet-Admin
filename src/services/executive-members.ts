import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { components } from "@/types/api";

// Use generated types from OpenAPI
type Executive = components["schemas"]["Executive"];

export type ExecutiveListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Executive[];
};

export type ExecutiveDetailResponse = Executive;

// Form data request type for creating executives
export type ExecutiveCreateRequest = {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  role: string;
  education: string;
  profile_picture?: File | string | null;
};

export type ExecutiveCreateResponse = Executive;

// Form data request type for updating executives
export type ExecutiveUpdateRequest = {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  role?: string;
  education?: string;
  profile_picture?: File | string | null; // Support null for removal
};

export type ExecutiveUpdateResponse = Executive;

export async function listExecutives(params?: Record<string, string | number | boolean>) {
  const url = API_ROUTES.EXECUTIVE_MEMBERS.LIST;
  const query = params ? `?${new URLSearchParams(Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => { acc[k] = String(v); return acc; }, {}))}` : "";
  const res = await apiCaller<ExecutiveListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getExecutive(id: number | string) {
  const res = await apiCaller<ExecutiveDetailResponse>(API_ROUTES.EXECUTIVE_MEMBERS.DETAIL(id), "GET");
  return res.data;
}

export async function createExecutive(payload: ExecutiveCreateRequest) {
  // Create FormData for file upload support
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('address', payload.address);
  formData.append('city', payload.city);
  formData.append('phone', payload.phone);
  formData.append('email', payload.email);
  formData.append('role', payload.role);
  formData.append('education', payload.education);
  
  
  if (payload.profile_picture instanceof File) {
    formData.append('profile_picture', payload.profile_picture);
  } else if (payload.profile_picture) {
    formData.append('profile_picture', payload.profile_picture);
  }

  const res = await apiCaller<ExecutiveCreateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.CREATE, "POST", formData, {}, "formdata");
  return res.data;
}

export async function updateExecutive(id: number | string, payload: ExecutiveUpdateRequest) {
  // Check if we have a file to upload or if we're removing the picture
  const hasFile = payload.profile_picture instanceof File;
  const isRemovingPicture = payload.hasOwnProperty('profile_picture') && payload.profile_picture === null;
  
  if (hasFile) {
    // Create FormData for file upload support
    const formData = new FormData();
    
    if (payload.name) formData.append('name', payload.name);
    if (payload.address) formData.append('address', payload.address);
    if (payload.city) formData.append('city', payload.city);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.email) formData.append('email', payload.email);
    if (payload.role) formData.append('role', payload.role);
    if (payload.education) formData.append('education', payload.education);
    
    if (payload.profile_picture instanceof File) {
      formData.append('profile_picture', payload.profile_picture);
    }

    const res = await apiCaller<ExecutiveUpdateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.UPDATE(id), "PUT", formData, {}, "formdata");
    return res.data;
  } else if (isRemovingPicture) {
    // User is explicitly removing the profile picture
    const { profile_picture: _profile_picture, ...executiveData } = payload;
    
    // First update the executive data (FormData without picture)
    const formData = new FormData();
    if (executiveData.name) formData.append('name', executiveData.name);
    if (executiveData.address) formData.append('address', executiveData.address);
    if (executiveData.city) formData.append('city', executiveData.city);
    if (executiveData.phone) formData.append('phone', executiveData.phone);
    if (executiveData.email) formData.append('email', executiveData.email);
    if (executiveData.role) formData.append('role', executiveData.role);
    if (executiveData.education) formData.append('education', executiveData.education);
    
    const res = await apiCaller<ExecutiveUpdateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.UPDATE(id), "PUT", formData, {}, "formdata");
    
    // Then delete the profile picture using dedicated endpoint
    try {
      await deleteExecutiveProfilePicture(id);
    } catch (error) {
      // If delete fails (e.g., no picture to delete), continue
      console.warn('Profile picture deletion failed:', error);
    }
    
    return res.data;
  } else {
    // Create FormData for regular update without files
    const formData = new FormData();
    
    if (payload.name) formData.append('name', payload.name);
    if (payload.address) formData.append('address', payload.address);
    if (payload.city) formData.append('city', payload.city);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.email) formData.append('email', payload.email);
    if (payload.role) formData.append('role', payload.role);
    if (payload.education) formData.append('education', payload.education);

    const res = await apiCaller<ExecutiveUpdateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.UPDATE(id), "PUT", formData, {}, "formdata");
    return res.data;
  }
}

export async function deleteExecutive(id: number | string) {
  await apiCaller<void>(API_ROUTES.EXECUTIVE_MEMBERS.DELETE(id), "DELETE");
}

// Profile picture upload function
export async function uploadExecutiveProfilePicture(id: number | string, file: File) {
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  const res = await apiCaller<ExecutiveUpdateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.UPLOAD_PICTURE(id), "POST", formData, {}, "formdata");
  return res.data;
}

// Profile picture delete function
export async function deleteExecutiveProfilePicture(id: number | string) {
  await apiCaller<void>(API_ROUTES.EXECUTIVE_MEMBERS.DELETE_PICTURE(id), "DELETE");
}
