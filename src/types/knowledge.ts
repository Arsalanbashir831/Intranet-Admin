/**
 * Type definitions for Knowledge Base domain
 * Extracted from OpenAPI schema
 */

export type KnowledgeFolder = {
  readonly id: number;
  name: string;
  description?: string;
  parent?: number | null;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
  created_by?: number | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly effective_permissions: {
    [key: string]: unknown;
  };
  readonly permitted_branches_details: string;
  readonly permitted_departments_details: string;
  readonly permitted_employees_details: string;
  readonly created_by_details: string;
};

export type KnowledgeFile = {
  readonly id: number;
  folder: number;
  name: string;
  description?: string;
  file: string;
  readonly file_url: string | null;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
  uploaded_by?: number | null;
  readonly uploaded_at: string;
  readonly size: number;
  readonly content_type: string;
  readonly effective_permissions: {
    [key: string]: unknown;
  };
};

export type PaginatedKnowledgeFolderList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: KnowledgeFolder[];
};

export type PaginatedKnowledgeFileList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: KnowledgeFile[];
};

export type PatchedKnowledgeFolder = {
  readonly id?: number;
  name?: string;
  description?: string;
  parent?: number | null;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
  created_by?: number | null;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly effective_permissions?: {
    [key: string]: unknown;
  };
  readonly permitted_branches_details?: string;
  readonly permitted_departments_details?: string;
  readonly permitted_employees_details?: string;
  readonly created_by_details?: string;
};

export type PatchedKnowledgeFile = {
  readonly id?: number;
  folder?: number;
  name?: string;
  description?: string;
  file?: string;
  readonly file_url?: string | null;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
  uploaded_by?: number | null;
  readonly uploaded_at?: string;
  readonly size?: number;
  readonly content_type?: string;
  readonly effective_permissions?: {
    [key: string]: unknown;
  };
};

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

export type KnowledgeBaseRow = {
  id: string;
  folder: string;
  createdByName: string;
  createdByAvatar?: string;
  accessLevel: "Specific Branch Departments" | "Specific Departments" | "Specific Branches" | "Specific Employees" | "All Employees";
  accessLevelDetails: {
    employees: Array<{ id: number; emp_name: string; email: string; profile_picture?: string }>;
    branchDepartments: Array<{ id: number; branch: { branch_name: string }; department: { dept_name: string } }>;
    departments: Array<{ id: number; dept_name: string }>;
    branches: Array<{ id: number; branch_name: string }>;
  };
  dateCreated: string; // YYYY-MM-DD
  originalData: FolderTreeItem;
};