import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import type { components } from "@/types/api";

// Use generated types from OpenAPI
type Checklist = components["schemas"]["Checklist"];
type Attachment = components["schemas"]["Attachment"];
type AttachmentFile = components["schemas"]["AttachmentFile"];
type StatusEnum = components["schemas"]["StatusEnum"];
type AttachmentTypeEnum = components["schemas"]["AttachmentTypeEnum"];

// Response types for checklists
export type ChecklistListResponse = components["schemas"]["PaginatedChecklistList"];
export type ChecklistDetailResponse = Checklist;

// Request types for creating checklists
export type ChecklistCreateRequest = {
  title?: string | null;
  detail?: string | null;
  assigned_to: number[];
  assigned_by: number | null;
  status?: StatusEnum;
};

export type ChecklistCreateResponse = Checklist;

// Request types for updating checklists
export type ChecklistUpdateRequest = {
  title?: string | null;
  detail?: string | null;
  assigned_to?: number[];
  assigned_by?: number | null;
  status?: StatusEnum;
};

export type ChecklistUpdateResponse = Checklist;

// Response types for attachments
export type AttachmentListResponse = components["schemas"]["PaginatedAttachmentList"];
export type AttachmentDetailResponse = Attachment;

// Request types for creating attachments
export type AttachmentCreateRequest = {
  checklist: number;
  title: string;
  detail?: string | null;
  type?: AttachmentTypeEnum;
};

export type AttachmentCreateResponse = Attachment;

// Request types for updating attachments
export type AttachmentUpdateRequest = {
  title?: string;
  detail?: string | null;
  type?: AttachmentTypeEnum;
};

export type AttachmentUpdateResponse = Attachment;

// Response types for attachment files
export type AttachmentFileListResponse = components["schemas"]["PaginatedAttachmentFileList"];
export type AttachmentFileDetailResponse = AttachmentFile;

// Request types for creating attachment files
export type AttachmentFileCreateRequest = {
  attachment: number;
  file: File;
};

export type AttachmentFileCreateResponse = AttachmentFile;

// Checklist CRUD operations
export async function listChecklists(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.NEW_HIRE.CHECKLISTS.LIST;
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
    
  const res = await apiCaller<ChecklistListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getChecklist(id: number | string) {
  const res = await apiCaller<ChecklistDetailResponse>(
    API_ROUTES.NEW_HIRE.CHECKLISTS.DETAIL(id), 
    "GET"
  );
  return res.data;
}

export async function createChecklist(payload: ChecklistCreateRequest) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    assigned_to: payload.assigned_to.map(String),
  };
  
  const res = await apiCaller<ChecklistCreateResponse>(
    API_ROUTES.NEW_HIRE.CHECKLISTS.CREATE, 
    "POST", 
    apiPayload, 
    {}, 
    "json"
  );
  return res.data;
}

export async function updateChecklist(id: number | string, payload: ChecklistUpdateRequest) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    assigned_to: payload.assigned_to?.map(String),
  };
  
  const res = await apiCaller<ChecklistUpdateResponse>(
    API_ROUTES.NEW_HIRE.CHECKLISTS.UPDATE(id), 
    "PATCH", 
    apiPayload, 
    {}, 
    "json"
  );
  return res.data;
}

export async function deleteChecklist(id: number | string) {
  await apiCaller<void>(API_ROUTES.NEW_HIRE.CHECKLISTS.DELETE(id), "DELETE");
}

// Attachment CRUD operations
export async function listAttachments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.NEW_HIRE.ATTACHMENTS.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
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
    
  const res = await apiCaller<AttachmentListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getAttachment(id: number | string) {
  const res = await apiCaller<AttachmentDetailResponse>(
    API_ROUTES.NEW_HIRE.ATTACHMENTS.DETAIL(id), 
    "GET"
  );
  return res.data;
}

export async function createAttachment(payload: AttachmentCreateRequest) {
  const res = await apiCaller<AttachmentCreateResponse>(
    API_ROUTES.NEW_HIRE.ATTACHMENTS.CREATE, 
    "POST", 
    payload, 
    {}, 
    "json"
  );
  return res.data;
}

export async function updateAttachment(id: number | string, payload: AttachmentUpdateRequest) {
  const res = await apiCaller<AttachmentUpdateResponse>(
    API_ROUTES.NEW_HIRE.ATTACHMENTS.UPDATE(id), 
    "PATCH", 
    payload, 
    {}, 
    "json"
  );
  return res.data;
}

export async function deleteAttachment(id: number | string) {
  await apiCaller<void>(API_ROUTES.NEW_HIRE.ATTACHMENTS.DELETE(id), "DELETE");
}

// Attachment File CRUD operations
export async function listAttachmentFiles(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.NEW_HIRE.FILES.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
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
    
  const res = await apiCaller<AttachmentFileListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getAttachmentFile(id: number | string) {
  const res = await apiCaller<AttachmentFileDetailResponse>(
    API_ROUTES.NEW_HIRE.FILES.DETAIL(id), 
    "GET"
  );
  return res.data;
}

export async function createAttachmentFile(payload: AttachmentFileCreateRequest) {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('attachment', String(payload.attachment));
  formData.append('file', payload.file);

  const res = await apiCaller<AttachmentFileCreateResponse>(
    API_ROUTES.NEW_HIRE.FILES.CREATE, 
    "POST", 
    formData, 
    {}, 
    "formdata"
  );
  return res.data;
}

export async function deleteAttachmentFile(id: number | string) {
  await apiCaller<void>(API_ROUTES.NEW_HIRE.FILES.DELETE(id), "DELETE");
}