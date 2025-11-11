import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams } from "@/lib/service-utils";
import type { Department, DepartmentCreateRequest, DepartmentUpdateRequest } from "@/types/departments";

export async function listDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.DEPARTMENTS.LIST;
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<{ departments: { count: number; page: number; page_size: number; results: Department[]; } }>(`${url}${query ? `?${query}` : ""}`, "GET");
  // Return the full response structure to access pagination info
  return res.data;
}

export async function getDepartment(id: number | string) {
  const res = await apiCaller<Department>(API_ROUTES.DEPARTMENTS.DETAIL(id), "GET");
  return res.data;
}

export async function createDepartment(payload: DepartmentCreateRequest) {
  const res = await apiCaller<{ department: Department }>(API_ROUTES.DEPARTMENTS.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateDepartment(id: number | string, payload: DepartmentUpdateRequest) {
  const res = await apiCaller<Department>(API_ROUTES.DEPARTMENTS.UPDATE(id), "PATCH", payload, {}, "json");
  return res.data;
}

export type DepartmentEmployee = {
  id: number;
  emp_name: string;
  branch_department_id: number;
  hire_date: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  role: string;
  education: string;
  bio: string;
  profile_picture: string | null;
  branch_department: {
    id: number;
    branch: {
      id: number;
      branch_name: string;
    };
    department: {
      id: number;
      dept_name: string;
    };
    manager: null | {
      id: number;
      full_name: string;
      profile_picture?: string;
    };
  };
};

export type DepartmentEmployeesResponse = {
  employees: {
    count: number;
    page: number;
    page_size: number;
    results: DepartmentEmployee[];
  };
};

export async function getDepartmentEmployees(
  departmentId: number | string,
  pagination?: { page?: number; pageSize?: number },
  params?: Record<string, string | number | boolean>
) {
  const url = API_ROUTES.DEPARTMENTS.GET_ALL_DEPT_EMPLOYEES(departmentId);
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<DepartmentEmployeesResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export type BranchDepartmentEmployee = {
  id: number;
  emp_name: string;
  branch_department_id: number;
  hire_date: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  role: string;
  education: string;
  bio: string;
  profile_picture: string | null;
  branch_department: {
    id: number;
    branch: {
      id: number;
      branch_name: string;
    };
    department: {
      id: number;
      dept_name: string;
    };
    manager: null | {
      id: number;
      full_name: string;
      profile_picture?: string;
    };
  };
};

export type BranchDepartmentEmployeesResponse = {
  employees: {
    count: number;
    page: number;
    page_size: number;
    results: BranchDepartmentEmployee[];
  };
};

export async function getBranchDepartmentEmployees(
  branchDepartmentId: number | string,
  pagination?: { page?: number; pageSize?: number },
  params?: Record<string, string | number | boolean>
) {
  const url = API_ROUTES.DEPARTMENTS.GET_ALL_BRANCH_DEPT_EMPLOYEES(branchDepartmentId);
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<BranchDepartmentEmployeesResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function deleteDepartment(id: number | string) {
  await apiCaller<void>(API_ROUTES.DEPARTMENTS.DELETE(id), "DELETE");
}
