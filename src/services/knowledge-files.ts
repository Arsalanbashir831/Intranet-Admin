import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { components } from "@/types/api";

// Types
export type KnowledgeFile = components["schemas"]["KnowledgeFile"];
export type PaginatedKnowledgeFileList = components["schemas"]["PaginatedKnowledgeFileList"];
export type PatchedKnowledgeFile = components["schemas"]["PatchedKnowledgeFile"];

export type FileListParams = {
  page?: number;
  folder?: number;
};

export type FileCreateRequest = {
  folder: number;
  name: string;
  description?: string;
  file: File;
  inherits_parent_permissions?: boolean;
  permitted_branches?: string[];
  permitted_departments?: string[];
  permitted_employees?: string[];
};

export type FileUpdateRequest = {
  folder?: number;
  name?: string;
  description?: string;
  file?: File;
  inherits_parent_permissions?: boolean;
  permitted_branches?: string[];
  permitted_departments?: string[];
  permitted_employees?: string[];
};

export type FilePatchRequest = PatchedKnowledgeFile;

// Response types
export type FileListResponse = {
  files: PaginatedKnowledgeFileList;
};

// API wrapper type to match potential API response structure
type FileApiListResponse = {
  files?: PaginatedKnowledgeFileList;
} | PaginatedKnowledgeFileList;

export type FileDetailResponse = {
  file: KnowledgeFile;
};

export type FileCreateResponse = {
  file: KnowledgeFile;
};

export type FileUpdateResponse = {
  file: KnowledgeFile;
};

// Service functions
export async function getFiles(params?: FileListParams): Promise<FileListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.folder) {
    queryParams.append('folder', params.folder.toString());
  }
  
  const url = `${API_ROUTES.KNOWLEDGE_BASE.FILES.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await apiCaller<FileApiListResponse>(url, "GET");
  
  // Handle both wrapped and direct response formats
  if (res.data && 'files' in res.data && res.data.files) {
    // Wrapped format: {files: {count, results, ...}}
    return {
      files: res.data.files
    };
  } else {
    // Direct format: {count, results, ...}
    return {
      files: (res.data as PaginatedKnowledgeFileList) || { count: 0, results: [], next: null, previous: null }
    };
  }
}

export async function getAllFiles(folderId?: number): Promise<FileListResponse> {
  let page = 1;
  let totalCount = 0;
  const allFiles: KnowledgeFile[] = [];

  do {
    const params: FileListParams = { page };
    if (folderId) {
      params.folder = folderId;
    }
    
    const res = await getFiles(params);
    
    if (res.files.results) {
      allFiles.push(...res.files.results);
    }
    
    totalCount = res.files.count || 0;
    const currentPageSize = res.files.results?.length || 0;
    const totalPages = Math.ceil(totalCount / (currentPageSize || 10));
    
    if (page >= totalPages) {
      break;
    }
    
    page++;
  } while (true);
  
  return {
    files: {
      count: totalCount,
      results: allFiles,
      next: null,
      previous: null
    }
  };
}

export async function getFile(id: number | string): Promise<FileDetailResponse> {
  const res = await apiCaller<KnowledgeFile>(API_ROUTES.KNOWLEDGE_BASE.FILES.DETAIL(id), "GET");
  return {
    file: res.data!
  };
}

export async function createFile(payload: FileCreateRequest): Promise<FileCreateResponse> {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('folder', payload.folder.toString());
  formData.append('name', payload.name);
  if (payload.description) {
    formData.append('description', payload.description);
  }
  formData.append('file', payload.file);
  
  if (payload.inherits_parent_permissions !== undefined) {
    formData.append('inherits_parent_permissions', payload.inherits_parent_permissions.toString());
  }
  
  if (payload.permitted_branches) {
    payload.permitted_branches.forEach(branch => {
      formData.append('permitted_branches', branch);
    });
  }
  
  if (payload.permitted_departments) {
    payload.permitted_departments.forEach(dept => {
      formData.append('permitted_departments', dept);
    });
  }
  
  if (payload.permitted_employees) {
    payload.permitted_employees.forEach(emp => {
      formData.append('permitted_employees', emp);
    });
  }

  const res = await apiCaller<KnowledgeFile>(
    API_ROUTES.KNOWLEDGE_BASE.FILES.CREATE, 
    "POST", 
    formData, 
    {}, 
    "formdata"
  );
  return {
    file: res.data!
  };
}

export async function updateFile(id: number | string, payload: FileUpdateRequest): Promise<FileUpdateResponse> {
  if (payload.file) {
    // If updating with a file, use FormData
    const formData = new FormData();
    
    if (payload.folder) formData.append('folder', payload.folder.toString());
    if (payload.name) formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    formData.append('file', payload.file);
    
    if (payload.inherits_parent_permissions !== undefined) {
      formData.append('inherits_parent_permissions', payload.inherits_parent_permissions.toString());
    }
    
    if (payload.permitted_branches) {
      payload.permitted_branches.forEach(branch => {
        formData.append('permitted_branches', branch);
      });
    }
    
    if (payload.permitted_departments) {
      payload.permitted_departments.forEach(dept => {
        formData.append('permitted_departments', dept);
      });
    }
    
    if (payload.permitted_employees) {
      payload.permitted_employees.forEach(emp => {
        formData.append('permitted_employees', emp);
      });
    }

    const res = await apiCaller<KnowledgeFile>(
      API_ROUTES.KNOWLEDGE_BASE.FILES.UPDATE(id), 
      "PUT", 
      formData, 
      {}, 
      "formdata"
    );
    return {
      file: res.data!
    };
  } else {
    // If not updating file, use JSON
    const jsonPayload = payload;
    const apiPayload = {
      ...jsonPayload,
      permitted_branches: jsonPayload.permitted_branches,
      permitted_departments: jsonPayload.permitted_departments,
      permitted_employees: jsonPayload.permitted_employees,
    };
    
    const res = await apiCaller<KnowledgeFile>(
      API_ROUTES.KNOWLEDGE_BASE.FILES.UPDATE(id), 
      "PUT", 
      apiPayload, 
      {}, 
      "json"
    );
    return {
      file: res.data!
    };
  }
}

export async function patchFile(id: number | string, payload: FilePatchRequest): Promise<FileUpdateResponse> {
  // Create a clean payload for patching, excluding readonly fields
  const patchData = { ...payload };
  
  // Remove readonly fields
  const mutablePatchData = { ...patchData };
  delete (mutablePatchData as Record<string, unknown>).id;
  delete (mutablePatchData as Record<string, unknown>).file_url;
  delete (mutablePatchData as Record<string, unknown>).uploaded_at;
  delete (mutablePatchData as Record<string, unknown>).size;
  delete (mutablePatchData as Record<string, unknown>).content_type;
  delete (mutablePatchData as Record<string, unknown>).effective_permissions;
  
  // Handle array conversions if present
  const apiPayload: Record<string, string | number | boolean | string[] | null | undefined> = {
    file: mutablePatchData.file,
    name: mutablePatchData.name,
    description: mutablePatchData.description,
    folder: mutablePatchData.folder,
    inherits_parent_permissions: mutablePatchData.inherits_parent_permissions,
    permitted_branches: mutablePatchData.permitted_branches?.map(String),
    permitted_departments: mutablePatchData.permitted_departments?.map(String),
    permitted_employees: mutablePatchData.permitted_employees?.map(String),
  };
  
  // Remove problematic fields
  delete apiPayload.effective_permissions;
  
  const res = await apiCaller<KnowledgeFile>(
    API_ROUTES.KNOWLEDGE_BASE.FILES.UPDATE(id), 
    "PATCH", 
    apiPayload, 
    {}, 
    "json"
  );
  return {
    file: res.data!
  };
}

export async function deleteFile(id: number | string): Promise<void> {
  await apiCaller<void>(API_ROUTES.KNOWLEDGE_BASE.FILES.DELETE(id), "DELETE");
}

export async function bulkUploadFiles(files: File[], folderId: number): Promise<unknown> {
  const formData = new FormData();
  formData.append('folder', folderId.toString());
  formData.append('inherits_parent_permissions', 'true');
  
  files.forEach(file => {
    formData.append('files', file);
  });

  const res = await apiCaller<unknown>(
    API_ROUTES.KNOWLEDGE_BASE.FILES.BULK_UPLOAD, 
    "POST", 
    formData, 
    {}, 
    "formdata"
  );
  return res.data;
}