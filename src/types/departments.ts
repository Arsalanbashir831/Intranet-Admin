/**
 * Type definitions for Departments domain
 * Core entity types for departments
 */

export type Department = {
  id: number;
  dept_name: string;
};

export type DepartmentCreateRequest = {
  dept_name: string;
  description?: string;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type DepartmentUpdateRequest = Partial<DepartmentCreateRequest>;

// Component Types

export type DepartmentEmployeeRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  dateOfJoining?: string;
};

export interface DepartmentsDetailTableProps {
  branchDepartmentId?: string;
  departmentName?: string;
  branchName?: string;
}

export type DepartmentRow = {
  id: string;
  department: string;
};

export interface DepartmentsTableProps {
  className?: string;
}

export interface EditDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  department: Department | null;
}

export interface NewDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

