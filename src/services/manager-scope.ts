import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { ManagerScope, ManagerMeResponse } from "@/types/manager-scope";

/**
 * Get manager scope information including managed departments and permissions
 */
export async function getManagerScope(): Promise<ManagerScope> {
  const res = await apiCaller<ManagerMeResponse>(
    `${API_ROUTES.AUTH.ME}?include_scope=true`,
    "GET"
  );
  
  if (!res.data.manager_scope) {
    throw new Error("Manager scope not available");
  }
  
  return res.data.manager_scope;
}

/**
 * Get manager profile with scope information
 */
export async function getManagerProfile(): Promise<ManagerMeResponse> {
  const res = await apiCaller<ManagerMeResponse>(
    `${API_ROUTES.AUTH.ME}?include_scope=true`,
    "GET"
  );
  return res.data;
}

/**
 * Check if current user is a manager
 */
export async function isManager(): Promise<boolean> {
  try {
    const scope = await getManagerScope();
    return scope.is_manager;
  } catch {
    return false;
  }
}

/**
 * Get managed departments for current manager
 */
export async function getManagedDepartments(): Promise<number[]> {
  try {
    const scope = await getManagerScope();
    return scope.managed_departments;
  } catch {
    return [];
  }
}

/**
 * Validate if manager can access a specific department
 */
export async function validateManagerDepartmentAccess(departmentId: number): Promise<boolean> {
  try {
    const scope = await getManagerScope();
    return scope.managed_departments.includes(departmentId);
  } catch {
    return false;
  }
}
