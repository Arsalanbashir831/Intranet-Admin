import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import type { components } from "@/types/api";

type Employee = components["schemas"]["Employee"];

export type EmployeeListResponse = {
  employees: {
    count: number;
    page: number;
    page_size: number;
    results: Employee[];
  };
};
export type EmployeeDetailResponse = Employee;
export type EmployeeCreateRequest = {
  emp_name: string;
  branch_department_id: number;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  education?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  profile_picture?: File | string | null; // Support both File and string
};
export type EmployeeCreateResponse = Employee;
export type EmployeeUpdateRequest = Partial<EmployeeCreateRequest>;
export type EmployeeUpdateResponse = Employee;

export async function listEmployees(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.EMPLOYEES.LIST;
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
    
  const res = await apiCaller<EmployeeListResponse>(`${url}${query}`, "GET");
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

export async function getEmployee(id: number | string) {
  const res = await apiCaller<EmployeeDetailResponse>(API_ROUTES.EMPLOYEES.DETAIL(id), "GET");
  return res.data;
}

export async function createEmployee(payload: EmployeeCreateRequest) {
  // Check if we have a file to upload
  const hasFile = payload.profile_picture instanceof File;
  
  if (hasFile) {
    // Create FormData for file upload (CREATE endpoint supports FormData)
    const formData = new FormData();
    formData.append('emp_name', payload.emp_name);
    formData.append('branch_department_id', String(payload.branch_department_id));
    
    if (payload.email) formData.append('email', payload.email);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.role) formData.append('role', payload.role);
    if (payload.education) formData.append('education', payload.education);
    if (payload.bio) formData.append('bio', payload.bio);
    if (payload.address) formData.append('address', payload.address);
    if (payload.city) formData.append('city', payload.city);
    
    if (payload.profile_picture instanceof File) {
      formData.append('profile_picture', payload.profile_picture);
    }
    
    const res = await apiCaller<EmployeeCreateResponse>(API_ROUTES.EMPLOYEES.CREATE, "POST", formData, {}, "formdata");
    return res.data;
  } else {
    // Use JSON for requests without files
    const res = await apiCaller<EmployeeCreateResponse>(API_ROUTES.EMPLOYEES.CREATE, "POST", payload, {}, "json");
    return res.data;
  }
}

export async function updateEmployee(id: number | string, payload: EmployeeUpdateRequest) {
  // Check if we have a file to upload
  const hasFile = payload.profile_picture instanceof File;
  const isRemovingPicture = payload.hasOwnProperty('profile_picture') && payload.profile_picture === null;
  
  if (hasFile) {
    // For updates with files, we need to:
    // 1. Update employee data without the file (JSON)
    // 2. Upload the profile picture separately
    const { profile_picture, ...employeeData } = payload;
    
    // First update the employee data (JSON only)
    const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPDATE(id), "PATCH", employeeData, {}, "json");
    
    // Then upload the profile picture using dedicated endpoint
    if (profile_picture instanceof File) {
      await uploadEmployeeProfilePicture(id, profile_picture);
    }
    
    return res.data;
  } else if (isRemovingPicture) {
    // User is explicitly removing the profile picture
    const { profile_picture: _profile_picture, ...employeeData } = payload;
    
    // First update the employee data (JSON only)
    const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPDATE(id), "PATCH", employeeData, {}, "json");
    
    // Then delete the profile picture using dedicated endpoint
    try {
      await deleteEmployeeProfilePicture(id);
    } catch (error) {
      // If delete fails (e.g., no picture to delete), continue
      console.warn('Profile picture deletion failed:', error);
    }
    
    return res.data;
  } else {
    // Use JSON for requests without files (regular update)
    const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPDATE(id), "PATCH", payload, {}, "json");
    return res.data;
  }
}

export async function deleteEmployee(id: number | string) {
  await apiCaller<void>(API_ROUTES.EMPLOYEES.DELETE(id), "DELETE");
}

// Profile picture upload function
export async function uploadEmployeeProfilePicture(id: number | string, file: File) {
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPLOAD_PICTURE(id), "POST", formData, {}, "formdata");
  return res.data;
}

// Profile picture delete function
export async function deleteEmployeeProfilePicture(id: number | string) {
  await apiCaller<void>(API_ROUTES.EMPLOYEES.DELETE_PICTURE(id), "DELETE");
}


