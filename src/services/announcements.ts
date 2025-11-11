import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams, numberArrayToStringArray } from "@/lib/service-utils";
import type {
  Announcement,
  AnnouncementAttachment,
  AnnouncementAttachmentCreateRequest,
  AnnouncementAttachmentListResponse,
  AnnouncementCreateRequest,
  AnnouncementListResponse,
  AnnouncementUpdateRequest,
} from "@/types/announcements";

// Announcement CRUD operations
export async function listAnnouncements(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number },
  managerScope?: boolean
) {
  const url = API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.LIST;
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };
  
  // Add manager scope parameter
  if (managerScope) {
    queryParams.manager_scope = true;
  }
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }
  
  const query = buildQueryParams(queryParams);
  const res = await apiCaller<AnnouncementListResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function getAnnouncement(id: number | string, managerScope?: boolean) {
  const queryParams: Record<string, string | number | boolean> = {
    include_inactive: true,
  };
  if (managerScope) {
    queryParams.manager_scope = true;
  }
  const query = buildQueryParams(queryParams);
  const url = `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.DETAIL(id)}${query ? `?${query}` : ""}`;
  const res = await apiCaller<Announcement>(url, "GET");
  return res.data;
}

export async function createAnnouncement(payload: AnnouncementCreateRequest, managerScope?: boolean) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches ? numberArrayToStringArray(payload.permitted_branches) : undefined,
    permitted_departments: payload.permitted_departments ? numberArrayToStringArray(payload.permitted_departments) : undefined,
    permitted_branch_departments: payload.permitted_branch_departments ? numberArrayToStringArray(payload.permitted_branch_departments) : undefined,
  };
  
  const query = managerScope ? buildQueryParams({ manager_scope: true }) : "";
  const url = `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.CREATE}${query ? `?${query}` : ""}`;
  const res = await apiCaller<Announcement>(url, "POST", apiPayload, {}, "json");
  return res.data;
}

export async function updateAnnouncement(id: number | string, payload: AnnouncementUpdateRequest, managerScope?: boolean) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches ? numberArrayToStringArray(payload.permitted_branches) : undefined,
    permitted_departments: payload.permitted_departments ? numberArrayToStringArray(payload.permitted_departments) : undefined,
    permitted_branch_departments: payload.permitted_branch_departments ? numberArrayToStringArray(payload.permitted_branch_departments) : undefined,
  };
  
  const queryParams: Record<string, string | number | boolean> = {
    include_inactive: true,
  };
  if (managerScope) {
    queryParams.manager_scope = true;
  }
  const query = buildQueryParams(queryParams);
  const url = `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.UPDATE(id)}${query ? `?${query}` : ""}`;
  const res = await apiCaller<Announcement>(url, "PATCH", apiPayload, {}, "json");
  return res.data;
}

export async function deleteAnnouncement(id: number | string, managerScope?: boolean) {
  const queryParams: Record<string, string | number | boolean> = {
    include_inactive: true,
  };
  if (managerScope) {
    queryParams.manager_scope = true;
  }
  const query = buildQueryParams(queryParams);
  const url = `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENTS.DELETE(id)}${query ? `?${query}` : ""}`;
  await apiCaller<void>(url, "DELETE");
}

// Announcement Attachment operations
export async function listAnnouncementAttachments(
  announcementId: number | string,
  params?: Record<string, string | number | boolean>
) {
  const url = "/knowledge/announcement-attachments/";
  const queryParams: Record<string, string | number | boolean> = {
    announcement: announcementId,
    ...params,
  };
  
  const query = buildQueryParams(queryParams);
  const res = await apiCaller<AnnouncementAttachmentListResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
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

  const res = await apiCaller<AnnouncementAttachment>(
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