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
  mfa_enabled?: boolean;
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

export type LoginResponse = {
  access: string;
  refresh: string;
  mfa_required?: boolean;
  challenge_token?: string;
};

export type MfaEnrollResponse = {
  secret: string;
  otpauth_uri: string;
};

export type MfaConfirmRequest = {
  code: string;
};

export type MfaVerifyRequest = {
  challenge_token: string;
  code: string;
};

export type MfaDisableRequest = {
  code: string;
};

export type MeResponse = {
  user: User;
  employee: (Employee & {
    isAdmin?: boolean; branch_department_ids?: number[]; branch_departments?: Array<{
      id: number;
      branch?: { id: number; branch_name: string };
      department?: { id: number; dept_name: string };
      manager?: { id: number; employee?: { id: number; emp_name: string; profile_picture?: string } } | null;
    }>
  }) | null;
  executive: Executive | null;
};

export type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
};
