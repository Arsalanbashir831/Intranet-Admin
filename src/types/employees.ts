/**
 * Type definitions for Employees domain
 * Extracted from OpenAPI schema
 */

export type Employee = {
  readonly id: number;
  emp_name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  branch_department: number;
  mfa_enabled?: boolean;
};

export type EmployeeCreateRequest = {
  emp_name: string;
  branch_department_id?: number;
  manager_branch_departments?: number[];
  email?: string | null;
  phone?: string | null;
  role?: number | null;
  bio?: string | null;
  profile_picture?: File | string | null; // Support both File and string
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type EmployeeUpdateRequest = Partial<EmployeeCreateRequest> & {
  branch_department_ids?: number[]; // For managers in edit mode
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

