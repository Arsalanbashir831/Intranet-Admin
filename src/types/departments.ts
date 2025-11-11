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

