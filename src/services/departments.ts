import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";

export type Branch = {
  id: number;
  branch_name: string;
};

export type BranchDepartment = {
  id: number;
  branch: Branch;
  employee_count: number;
  manager: null | {
    id: number;
    employee: {
      id: number;
      emp_name: string;
      profile_picture?: string | null;
      email: string;
      role: string;
    };
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
    };
  };
};

export type Department = {
  id: number;
  dept_name: string;
  employee_count: number;
  branch_departments: BranchDepartment[];
};

export type DepartmentListResponse = {
  departments: {
    count: number;
    page: number;
    page_size: number;
    results: Department[];
  };
};
export type DepartmentDetailResponse = Department;
export type DepartmentCreateRequest = {
  dept_name: string;
  description?: string;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;
export type DepartmentCreateResponse = {
  department: Department;
};
export type DepartmentUpdateRequest = Partial<DepartmentCreateRequest>;
export type DepartmentUpdateResponse = Department;

export async function listDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.DEPARTMENTS.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }
  
  // Add other parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  const query = Object.keys(queryParams).length > 0 
    ? `?${new URLSearchParams(queryParams)}` 
    : "";
    
  const res = await apiCaller<DepartmentListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getDepartment(id: number | string) {
  const res = await apiCaller<DepartmentDetailResponse>(API_ROUTES.DEPARTMENTS.DETAIL(id), "GET");
  return res.data;
}

export async function createDepartment(payload: DepartmentCreateRequest) {
  const res = await apiCaller<DepartmentCreateResponse>(API_ROUTES.DEPARTMENTS.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateDepartment(id: number | string, payload: DepartmentUpdateRequest) {
  const res = await apiCaller<DepartmentUpdateResponse>(API_ROUTES.DEPARTMENTS.UPDATE(id), "PUT", payload, {}, "json");
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
  const queryParams: Record<string, string> = {};
  
  // Add search parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }
  
  const query = Object.keys(queryParams).length > 0 
    ? `?${new URLSearchParams(queryParams)}` 
    : "";
    
  const res = await apiCaller<DepartmentEmployeesResponse>(`${url}${query}`, "GET");
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
  const queryParams: Record<string, string> = {};
  
  // Add search parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }
  
  const query = Object.keys(queryParams).length > 0 
    ? `?${new URLSearchParams(queryParams)}` 
    : "";
    
  const res = await apiCaller<BranchDepartmentEmployeesResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function deleteDepartment(id: number | string) {
  await apiCaller<void>(API_ROUTES.DEPARTMENTS.DELETE(id), "DELETE");
}
