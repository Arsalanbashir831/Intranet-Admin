import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import type { components } from "@/types/api";

// Use generated types from OpenAPI
type Announcement = components["schemas"]["Announcement"];
type AnnouncementAttachment = components["schemas"]["AnnouncementAttachment"];
type AnnouncementTypeEnum = components["schemas"]["AnnouncementTypeEnum"];

export type AnnouncementListResponse = {
  announcements: {
    count: number;
    page: number;
    page_size: number;
    results: Announcement[];
  };
};
export type AnnouncementDetailResponse = Announcement;

// Request types for creating announcements
export type AnnouncementCreateRequest = {
  title: string;
  body: string;
  type?: AnnouncementTypeEnum;
  hash_tags?: string | null;
  is_active?: boolean;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
};

export type AnnouncementCreateResponse = Announcement;

// Request types for updating announcements
export type AnnouncementUpdateRequest = {
  title?: string;
  body?: string;
  type?: AnnouncementTypeEnum;
  hash_tags?: string | null;
  is_active?: boolean;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
};

export type AnnouncementUpdateResponse = Announcement;

// Announcement attachment types
export type AnnouncementAttachmentListResponse = {
  attachments: {
    count: number;
    page: number;
    page_size: number;
    results: AnnouncementAttachment[];
  };
};
export type AnnouncementAttachmentDetailResponse = AnnouncementAttachment;

export type AnnouncementAttachmentCreateRequest = {
  announcement: number;
  name: string;
  description?: string;
  file: File;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
};

export type AnnouncementAttachmentCreateResponse = AnnouncementAttachment;

export type AnnouncementAttachmentUpdateRequest = {
  name?: string;
  description?: string;
  file?: File;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
};

export type AnnouncementAttachmentUpdateResponse = AnnouncementAttachment;

// Announcement CRUD operations
export async function listAnnouncements(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }
  
  // Add other parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  const query = Object.keys(queryParams).length > 0 
    ? `?${new URLSearchParams(queryParams)}` 
    : "";
    
  const res = await apiCaller<AnnouncementListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getAnnouncement(id: number | string) {
  const res = await apiCaller<AnnouncementDetailResponse>(
    `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.DETAIL(id)}?include_inactive=true`, 
    "GET"
  );
  return res.data;
}

export async function createAnnouncement(payload: AnnouncementCreateRequest) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches?.map(String),
    permitted_departments: payload.permitted_departments?.map(String),
    permitted_employees: payload.permitted_employees?.map(String),
  };
  
  const res = await apiCaller<AnnouncementCreateResponse>(
    API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.CREATE, 
    "POST", 
    apiPayload, 
    {}, 
    "json"
  );
  return res.data;
}

export async function updateAnnouncement(id: number | string, payload: AnnouncementUpdateRequest) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches?.map(String),
    permitted_departments: payload.permitted_departments?.map(String),
    permitted_employees: payload.permitted_employees?.map(String),
  };
  
  const res = await apiCaller<AnnouncementUpdateResponse>(
    API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.UPDATE(id)+'?include_inactive=true', 
    "PATCH", 
    apiPayload, 
    {}, 
    "json"
  );
  return res.data;
}

export async function deleteAnnouncement(id: number | string) {
  await apiCaller<void>(`${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.DELETE(id)}?include_inactive=true`, "DELETE");
}

// Announcement Attachment operations
export async function listAnnouncementAttachments(
  announcementId: number | string,
  params?: Record<string, string | number | boolean>
) {
  const url = "/knowledge/announcement-attachments/";
  const queryParams: Record<string, string> = {
    announcement: String(announcementId)
  };
  
  // Add other parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  const query = `?${new URLSearchParams(queryParams)}`;
    
  const res = await apiCaller<AnnouncementAttachmentListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function createAnnouncementAttachment(payload: AnnouncementAttachmentCreateRequest) {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('announcement', String(payload.announcement));
  formData.append('name', payload.name);
  
  if (payload.description) {
    formData.append('description', payload.description);
  }
  
  formData.append('file', payload.file);
  
  if (payload.inherits_parent_permissions !== undefined) {
    formData.append('inherits_parent_permissions', String(payload.inherits_parent_permissions));
  }
  
  if (payload.permitted_branches) {
    payload.permitted_branches.forEach((id) => {
      formData.append('permitted_branches', String(id));
    });
  }
  
  if (payload.permitted_departments) {
    payload.permitted_departments.forEach((id) => {
      formData.append('permitted_departments', String(id));
    });
  }
  
  if (payload.permitted_employees) {
    payload.permitted_employees.forEach((id) => {
      formData.append('permitted_employees', String(id));
    });
  }

  const res = await apiCaller<AnnouncementAttachmentCreateResponse>(
    API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.ATTACHMENTS.UPLOAD, 
    "POST", 
    formData, 
    {}, 
    "formdata"
  );
  return res.data;
}

export async function deleteAnnouncementAttachment(id: number | string) {
  await apiCaller<void>(
    API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.ATTACHMENTS.DELETE_ATTACHMENT(id), 
    "DELETE"
  );
}