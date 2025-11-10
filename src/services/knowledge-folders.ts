import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { components } from "@/types/api";

// Types
export type KnowledgeFolder = components["schemas"]["KnowledgeFolder"];
export type PaginatedKnowledgeFolderList = components["schemas"]["PaginatedKnowledgeFolderList"];
export type PatchedKnowledgeFolder = components["schemas"]["PatchedKnowledgeFolder"];

export type FolderListParams = {
  page?: number;
};

export type FolderCreateRequest = {
  name: string;
  description?: string;
  parent?: number | null;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_branch_departments?: number[];
  permitted_employees?: number[];
};

export type FolderUpdateRequest = FolderCreateRequest;
export type FolderPatchRequest = PatchedKnowledgeFolder;

// Response types
export type FolderListResponse = {
  folders: PaginatedKnowledgeFolderList;
};

// API wrapper type to match actual API response
type FolderApiListResponse = {
  folders: PaginatedKnowledgeFolderList;
};

export type FolderDetailResponse = {
  folder: KnowledgeFolder;
};

export type FolderCreateResponse = {
  folder: KnowledgeFolder;
};

export type FolderUpdateResponse = {
  folder: KnowledgeFolder;
};

// Add new types for folder tree structure
export type BranchDepartmentDetail = {
  id: number;
  branch: {
    id: number;
    branch_name: string;
    location: string;
  };
  department: {
    id: number;
    dept_name: string;
  };
};

export type CreatedByDetail = {
  id: number;
  emp_name: string;
  email: string;
  phone: string;
  role: string;
  profile_picture: string;
  branch_department_ids: number[];
  is_admin?: boolean;
};

export type UploadedByDetail = {
  id: number;
  emp_name: string;
  email: string;
  phone: string;
  role: string;
  profile_picture: string;
};

export type FolderTreeFile = {
  id: number;
  folder: number;
  name: string;
  description: string;
  file: string;
  file_url: string;
  inherits_parent_permissions: boolean;
  permitted_branches: number[];
  permitted_departments: number[];
  permitted_employees: number[];
  uploaded_by: UploadedByDetail | number | null; // Support both object (from tree API) and number (from list API)
  uploaded_at: string;
  size: number;
  content_type: string;
  effective_permissions: {
    branches: number[];
    departments: number[];
    employees: number[];
  };
};

export type FolderTreeItem = {
  id: number;
  name: string;
  description: string;
  parent: number | null;
  inherits_parent_permissions: boolean;
  created_at: string;
  created_by: CreatedByDetail;
  access_level: {
    branches: unknown[];
    departments: unknown[];
    branch_departments: BranchDepartmentDetail[];
    employees: unknown[];
  };
  files: FolderTreeFile[];
  folders: FolderTreeItem[]; // Recursive type for nested folders
};

export type FolderTreeResponse = {
  folders: FolderTreeItem[];
};

// Service functions
export async function getAllFolders(): Promise<FolderListResponse> {
  let page = 1;
  let totalCount = 0;
  const allFolders: KnowledgeFolder[] = [];

  do {
    const res = await apiCaller<FolderApiListResponse>(
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

export async function searchFolders(params?: Record<string, string | number | boolean>): Promise<FolderListResponse> {
  const queryParams: Record<string, string> = {};
  
  // Add search parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  const query = Object.keys(queryParams).length > 0 
    ? `?${new URLSearchParams(queryParams)}` 
    : "";
    
  const res = await apiCaller<FolderApiListResponse>(`${API_ROUTES.KNOWLEDGE_BASE.FOLDERS.LIST}${query}`, "GET");
  
  return {
    folders: res.data?.folders || { count: 0, results: [], next: null, previous: null }
  };
}

export async function getFolders(params?: FolderListParams): Promise<FolderListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  
  const url = `${API_ROUTES.KNOWLEDGE_BASE.FOLDERS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await apiCaller<FolderApiListResponse>(url, "GET");
  
  return {
    folders: res.data?.folders || { count: 0, results: [], next: null, previous: null }
  };
}

export async function getFolder(id: number | string): Promise<FolderDetailResponse> {
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
  
  const res = await apiCaller<FolderTreeResponse>(url, "GET");
  return res.data;
}

export async function createFolder(payload: FolderCreateRequest): Promise<FolderCreateResponse> {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches?.map(String),
    permitted_departments: payload.permitted_departments?.map(String),
    permitted_branch_departments: payload.permitted_branch_departments?.map(String),
    permitted_employees: payload.permitted_employees?.map(String),
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

export async function updateFolder(id: number | string, payload: FolderUpdateRequest): Promise<FolderUpdateResponse> {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches?.map(String),
    permitted_departments: payload.permitted_departments?.map(String),
    permitted_branch_departments: payload.permitted_branch_departments?.map(String),
    permitted_employees: payload.permitted_employees?.map(String),
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

export async function patchFolder(id: number | string, payload: FolderPatchRequest): Promise<FolderUpdateResponse> {
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
    permitted_branches: patchData.permitted_branches?.map(String),
    permitted_departments: patchData.permitted_departments?.map(String), 
    permitted_employees: patchData.permitted_employees?.map(String),
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