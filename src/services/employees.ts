import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams, numberArrayToStringArray } from "@/lib/service-utils";
import type { Employee, EmployeeCreateRequest, EmployeeUpdateRequest } from "@/types/employees";

export async function listEmployees(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number },
  managerScope?: boolean
) {
  const url = API_ROUTES.EMPLOYEES.LIST;
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add manager scope parameter
  if (managerScope) {
    queryParams.manager_scope = true;
  }

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<{ employees: { count: number; page: number; page_size: number; results: Employee[]; } }>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

// Function to fetch all employees across all pages
export async function listAllEmployees(
  params?: Record<string, string | number | boolean>
): Promise<{ count: number; results: Employee[] }> {
  const allEmployees: Employee[] = [];
  let page = 1;
  let totalCount = 0;

  do {
    const response = await listEmployees(params, { page, pageSize: 25 }); // Use 25 as requested

    if (response.employees.results.length > 0) {
      allEmployees.push(...response.employees.results);
    }

    totalCount = response.employees.count;
    const totalPages = Math.ceil(totalCount / 25); // Using our page size of 25

    if (page >= totalPages) {
      break;
    }

    page++;
  } while (true);

  return {
    count: totalCount,
    results: allEmployees
  };
}

// Function to search employees with query
export async function searchEmployees(
  searchQuery: string,
  params?: Record<string, string | number | boolean>
): Promise<{ count: number; results: Employee[] }> {
  const searchParams = {
    ...params,
    search: searchQuery, // Add search parameter
  };

  const response = await listEmployees(searchParams, { page: 1, pageSize: 25 });
  return {
    count: response.employees.count,
    results: response.employees.results
  };
}

export async function getEmployee(id: number | string, managerScope?: boolean) {
  const url = managerScope
    ? `${API_ROUTES.EMPLOYEES.DETAIL(id)}?manager_scope=true`
    : API_ROUTES.EMPLOYEES.DETAIL(id);
  const res = await apiCaller<Employee>(url, "GET");
  return res.data;
}

export async function createEmployee(payload: EmployeeCreateRequest, managerScope?: boolean) {
  // Check if we have a file to upload
  const hasFile = payload.profile_picture instanceof File;

  if (hasFile) {
    // Create FormData for file upload (CREATE endpoint supports FormData)
    const formData = new FormData();
    formData.append('emp_name', payload.emp_name);

    // Handle branch department based on role
    if (payload.manager_branch_departments && payload.manager_branch_departments.length > 0) {
      // Manager: append array of branch departments
      payload.manager_branch_departments.forEach((id) => {
        formData.append('manager_branch_departments', String(id));
      });
    } else if (payload.branch_department_id) {
      // Regular employee: append single branch department
      formData.append('branch_department_id', String(payload.branch_department_id));
    }

    if (payload.email) formData.append('email', payload.email);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.role) formData.append('role', String(payload.role));
    if (payload.bio) formData.append('bio', payload.bio);

    if (payload.profile_picture instanceof File) {
      formData.append('profile_picture', payload.profile_picture);
    }

    const url = managerScope
      ? `${API_ROUTES.EMPLOYEES.CREATE}?manager_scope=true`
      : API_ROUTES.EMPLOYEES.CREATE;
    const res = await apiCaller<Employee>(url, "POST", formData, {}, "formdata");
    return res.data;
  } else {
    // Use JSON for requests without files
    // Convert number arrays to string arrays for API compatibility
    const apiPayload = {
      ...payload,
      manager_branch_departments: payload.manager_branch_departments ? numberArrayToStringArray(payload.manager_branch_departments) : undefined,
    };

    const url = managerScope
      ? `${API_ROUTES.EMPLOYEES.CREATE}?manager_scope=true`
      : API_ROUTES.EMPLOYEES.CREATE;
    const res = await apiCaller<Employee>(url, "POST", apiPayload, {}, "json");
    return res.data;
  }
}

export async function updateEmployee(id: number | string, payload: EmployeeUpdateRequest, managerScope?: boolean) {
  // Check if we have a file to upload
  const hasFile = payload.profile_picture instanceof File;
  const isRemovingPicture = payload.hasOwnProperty('profile_picture') && payload.profile_picture === null;

  if (hasFile) {
    // For updates with files, we need to:
    // 1. Update employee data without the file (JSON)
    // 2. Upload the profile picture separately
    const { profile_picture, ...employeeData } = payload;

    // First update the employee data (JSON only)
    // Convert number arrays to string arrays for API compatibility
    const apiEmployeeData = {
      ...employeeData,
      manager_branch_departments: employeeData.manager_branch_departments ? numberArrayToStringArray(employeeData.manager_branch_departments) : undefined,
      branch_department_ids: employeeData.branch_department_ids ? numberArrayToStringArray(employeeData.branch_department_ids) : undefined,
    };

    const url = managerScope
      ? `${API_ROUTES.EMPLOYEES.UPDATE(id)}?manager_scope=true`
      : API_ROUTES.EMPLOYEES.UPDATE(id);
    const res = await apiCaller<Employee>(url, "PATCH", apiEmployeeData, {}, "json");

    // Then upload the profile picture using dedicated endpoint
    if (profile_picture instanceof File) {
      await uploadEmployeeProfilePicture(id, profile_picture);
    }

    return res.data;
  } else if (isRemovingPicture) {
    // User is explicitly removing the profile picture
    const { ...employeeData } = payload;

    // First update the employee data (JSON only)
    // Convert number arrays to string arrays for API compatibility
    const apiEmployeeData = {
      ...employeeData,
      manager_branch_departments: employeeData.manager_branch_departments ? numberArrayToStringArray(employeeData.manager_branch_departments) : undefined,
      branch_department_ids: employeeData.branch_department_ids ? numberArrayToStringArray(employeeData.branch_department_ids) : undefined,
    };

    const url = managerScope
      ? `${API_ROUTES.EMPLOYEES.UPDATE(id)}?manager_scope=true`
      : API_ROUTES.EMPLOYEES.UPDATE(id);
    const res = await apiCaller<Employee>(url, "PATCH", apiEmployeeData, {}, "json");

    // Then delete the profile picture using dedicated endpoint
    try {
      await deleteEmployeeProfilePicture(id);
    } catch {
      // If delete fails (e.g., no picture to delete), continue silently
      // Error is non-critical as the main update operation succeeded
    }

    return res.data;
  } else {
    // Use JSON for requests without files (regular update)
    // Convert number arrays to string arrays for API compatibility
    const apiPayload = {
      ...payload,
      manager_branch_departments: payload.manager_branch_departments ? numberArrayToStringArray(payload.manager_branch_departments) : undefined,
      branch_department_ids: payload.branch_department_ids ? numberArrayToStringArray(payload.branch_department_ids) : undefined,
    };

    const url = managerScope
      ? `${API_ROUTES.EMPLOYEES.UPDATE(id)}?manager_scope=true`
      : API_ROUTES.EMPLOYEES.UPDATE(id);
    const res = await apiCaller<Employee>(url, "PATCH", apiPayload, {}, "json");
    return res.data;
  }
}

export async function deleteEmployee(id: number | string, managerScope?: boolean) {
  const url = managerScope
    ? `${API_ROUTES.EMPLOYEES.DELETE(id)}?manager_scope=true`
    : API_ROUTES.EMPLOYEES.DELETE(id);
  await apiCaller<void>(url, "DELETE");
}

// Profile picture upload function
export async function uploadEmployeeProfilePicture(id: number | string, file: File) {
  const formData = new FormData();
  formData.append('profile_picture', file);

  const res = await apiCaller<Employee>(API_ROUTES.EMPLOYEES.UPLOAD_PICTURE(id), "POST", formData, {}, "formdata");
  return res.data;
}

// Profile picture delete function
export async function deleteEmployeeProfilePicture(id: number | string) {
  await apiCaller<void>(API_ROUTES.EMPLOYEES.DELETE_PICTURE(id), "DELETE");
}


