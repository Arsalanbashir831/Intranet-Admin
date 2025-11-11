import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams, numberArrayToStringArray } from "@/lib/service-utils";
import type {
  Checklist,
  Attachment,
  AttachmentFile,
  PaginatedChecklistList,
  PaginatedAttachmentList,
  PaginatedAttachmentFileList,
  ChecklistCreateRequest,
  ChecklistUpdateRequest,
  AttachmentCreateRequest,
  AttachmentUpdateRequest,
  AttachmentFileCreateRequest,
  ExecutiveTrainingChecklistAttachment,
  ExecutiveTrainingChecklistEmployee,
  ExecutiveTrainingChecklistListResponse,
} from "@/types/new-hire";

// Request types for creating checklists


// Checklist CRUD operations
export async function listChecklists(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.NEW_HIRE.CHECKLISTS.LIST;
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<PaginatedChecklistList>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function getChecklist(id: number | string) {
  const res = await apiCaller<Checklist>(
    API_ROUTES.NEW_HIRE.CHECKLISTS.DETAIL(id),
    "GET"
  );
  return res.data;
}

export async function createChecklist(payload: ChecklistCreateRequest) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    assigned_to: numberArrayToStringArray(payload.assigned_to),
  };

  const res = await apiCaller<Checklist>(
    API_ROUTES.NEW_HIRE.CHECKLISTS.CREATE,
    "POST",
    apiPayload,
    {},
    "json"
  );
  return res.data;
}

export async function updateChecklist(
  id: number | string,
  payload: ChecklistUpdateRequest
) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    assigned_to: payload.assigned_to ? numberArrayToStringArray(payload.assigned_to) : undefined,
  };

  const res = await apiCaller<Checklist>(
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
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<PaginatedAttachmentList>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function getAttachment(id: number | string) {
  const res = await apiCaller<Attachment>(
    API_ROUTES.NEW_HIRE.ATTACHMENTS.DETAIL(id),
    "GET"
  );
  return res.data;
}

export async function createAttachment(payload: AttachmentCreateRequest) {
  const res = await apiCaller<Attachment>(
    API_ROUTES.NEW_HIRE.ATTACHMENTS.CREATE,
    "POST",
    payload,
    {},
    "json"
  );
  return res.data;
}

export async function updateAttachment(
  id: number | string,
  payload: AttachmentUpdateRequest
) {
  const res = await apiCaller<Attachment>(
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
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<PaginatedAttachmentFileList>(
    `${url}${query ? `?${query}` : ""}`,
    "GET"
  );
  return res.data;
}

export async function getAttachmentFile(id: number | string) {
  const res = await apiCaller<AttachmentFile>(
    API_ROUTES.NEW_HIRE.FILES.DETAIL(id),
    "GET"
  );
  return res.data;
}

export async function createAttachmentFile(
  payload: AttachmentFileCreateRequest
) {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append("attachment", String(payload.attachment));
  formData.append("file", payload.file);

  const res = await apiCaller<AttachmentFile>(
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

export type ExecutiveTrainingChecklistDetail = {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  attachment: ExecutiveTrainingChecklistAttachment[];
  employees: ExecutiveTrainingChecklistEmployee[];
};

export async function listExecutiveTrainingChecklists(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    if (pagination.page !== undefined) {
      queryParams.page = pagination.page;
    }
    if (pagination.pageSize !== undefined) {
      queryParams.page_size = pagination.pageSize;
    }
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<ExecutiveTrainingChecklistListResponse>(
    `${API_ROUTES.NEW_HIRE.TRAINING_CHECKLIST.LIST}${query ? `?${query}` : ""}`,
    "GET"
  );
  return res.data;
}

export async function getExecutiveTrainingChecklist(id: number | string) {
  const res = await apiCaller<ExecutiveTrainingChecklistDetail>(
    API_ROUTES.NEW_HIRE.TRAINING_CHECKLIST.DETAIL(id),
    "GET"
  );
  return res.data;
}
