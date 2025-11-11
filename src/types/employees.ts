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
  education?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  branch_department: number;
};

