import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { buildQueryParams, numberArrayToStringArray } from "@/lib/service-utils";
import type {
  FolderCreateRequest,
  FolderListParams,
  FolderTreeItem,
  KnowledgeFolder,
  PaginatedKnowledgeFolderList,
  PatchedKnowledgeFolder,
} from "@/types/knowledge";

// Service functions
export async function getAllFolders(): Promise<{ folders: PaginatedKnowledgeFolderList }> {
  let page = 1;
  let totalCount = 0;
  const allFolders: KnowledgeFolder[] = [];

  do {
    const res = await apiCaller<{ folders: PaginatedKnowledgeFolderList }>(
      `${API_ROUTES.KNOWLEDGE_BASE.FOLDERS.LIST}?page=${page}`,
      "GET"
    );

    if (res.data?.folders?.results) {
      allFolders.push(...res.data.folders.results);
    }

    totalCount = res.data?.folders?.count || 0;
    const currentPageSize = res.data?.folders?.results?.length || 0;
    const totalPages = Math.ceil(totalCount / (currentPageSize || 10));

    if (page >= totalPages || totalCount === 0) {
      break;
    }

    page++;
  } while (true);

  return {
    folders: {
      count: totalCount,
      results: allFolders,
      next: null,
      previous: null
    }
  };
}

export async function searchFolders(params?: Record<string, string | number | boolean>): Promise<{ folders: PaginatedKnowledgeFolderList }> {
  const query = buildQueryParams(params);
  const res = await apiCaller<{ folders: PaginatedKnowledgeFolderList }>(`${API_ROUTES.KNOWLEDGE_BASE.FOLDERS.LIST}${query ? `?${query}` : ""}`, "GET");

  return {
    folders: res.data?.folders || { count: 0, results: [], next: null, previous: null }
  };
}

export async function getFolders(params?: FolderListParams): Promise<{ folders: PaginatedKnowledgeFolderList }> {
  const queryParams: Record<string, number> = {};
  if (params?.page) {
    queryParams.page = params.page;
  }

  const query = buildQueryParams(queryParams);
  const url = `${API_ROUTES.KNOWLEDGE_BASE.FOLDERS.LIST}${query ? `?${query}` : ''}`;
  const res = await apiCaller<{ folders: PaginatedKnowledgeFolderList }>(url, "GET");

  return {
    folders: res.data?.folders || { count: 0, results: [], next: null, previous: null }
  };
}

export async function getFolder(id: number | string): Promise<{ folder: KnowledgeFolder }> {
  const res = await apiCaller<KnowledgeFolder>(API_ROUTES.KNOWLEDGE_BASE.FOLDERS.DETAIL(id), "GET");
  return {
    folder: res.data!
  };
}

export async function getFolderTree(employeeId?: number | string) {
  let url = API_ROUTES.KNOWLEDGE_BASE.FOLDERS.FOLDER_TREE;
  if (employeeId) {
    url += `?employee_id=${employeeId}`;
  }

  const res = await apiCaller<{ folders: FolderTreeItem[] }>(url, "GET");
  return res.data;
}

export async function createFolder(payload: FolderCreateRequest): Promise<{ folder: KnowledgeFolder }> {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches ? numberArrayToStringArray(payload.permitted_branches) : undefined,
    permitted_departments: payload.permitted_departments ? numberArrayToStringArray(payload.permitted_departments) : undefined,
    permitted_branch_departments: payload.permitted_branch_departments ? numberArrayToStringArray(payload.permitted_branch_departments) : undefined,
    permitted_employees: payload.permitted_employees ? numberArrayToStringArray(payload.permitted_employees) : undefined,
  };

  const res = await apiCaller<KnowledgeFolder>(
    API_ROUTES.KNOWLEDGE_BASE.FOLDERS.CREATE,
    "POST",
    apiPayload,
    {},
    "json"
  );
  return {
    folder: res.data!
  };
}

export async function updateFolder(id: number | string, payload: FolderCreateRequest): Promise<{ folder: KnowledgeFolder }> {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches ? numberArrayToStringArray(payload.permitted_branches) : undefined,
    permitted_departments: payload.permitted_departments ? numberArrayToStringArray(payload.permitted_departments) : undefined,
    permitted_branch_departments: payload.permitted_branch_departments ? numberArrayToStringArray(payload.permitted_branch_departments) : undefined,
    permitted_employees: payload.permitted_employees ? numberArrayToStringArray(payload.permitted_employees) : undefined,
  };

  const res = await apiCaller<KnowledgeFolder>(
    API_ROUTES.KNOWLEDGE_BASE.FOLDERS.UPDATE(id),
    "PUT",
    apiPayload,
    {},
    "json"
  );
  return {
    folder: res.data!
  };
}

export async function patchFolder(id: number | string, payload: PatchedKnowledgeFolder): Promise<{ folder: KnowledgeFolder }> {
  // Create a clean payload for patching, excluding readonly fields
  const {
    created_at: _created_at,
    updated_at: _updated_at,
    effective_permissions: _effective_permissions,
    ...patchData
  } = payload;

  // Handle array conversions if present
  const apiPayload = {
    ...patchData,
    permitted_branches: patchData.permitted_branches ? numberArrayToStringArray(patchData.permitted_branches) : undefined,
    permitted_departments: patchData.permitted_departments ? numberArrayToStringArray(patchData.permitted_departments) : undefined,
    permitted_employees: patchData.permitted_employees ? numberArrayToStringArray(patchData.permitted_employees) : undefined,
  };

  const res = await apiCaller<KnowledgeFolder>(
    API_ROUTES.KNOWLEDGE_BASE.FOLDERS.UPDATE(id),
    "PATCH",
    apiPayload,
    {},
    "json"
  );
  return {
    folder: res.data!
  };
}

export async function deleteFolder(id: number | string): Promise<void> {
  await apiCaller<void>(API_ROUTES.KNOWLEDGE_BASE.FOLDERS.DELETE(id), "DELETE");
}