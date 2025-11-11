/**
 * Type definitions for Authentication domain
 * Extracted from OpenAPI schema
 */

import { Executive } from "./executives";
import { Employee } from "./employees";

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};

export type CustomTokenObtainPair = {
  username: string;
  password: string;
};

export type TokenRefresh = {
  readonly access: string;
  refresh: string;
};

export type TokenVerify = {
  token: string;
};

export type MeResponse = {
  user: User;
  employee: (Employee & { isAdmin?: boolean; branch_department_ids?: number[]; branch_departments?: Array<{
    id: number;
    branch?: { id: number; branch_name: string };
    department?: { id: number; dept_name: string };
    manager?: { id: number; employee?: { id: number; emp_name: string; profile_picture?: string } } | null;
  }> }) | null;
  executive: Executive | null;
};