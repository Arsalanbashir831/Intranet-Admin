import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { components } from "@/types/api";

type Employee = components["schemas"]["Employee"];

export type EmployeeListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Employee[];
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

export async function listEmployees(params?: Record<string, string | number | boolean>) {
  const url = API_ROUTES.EMPLOYEES.LIST;
  const query = params ? `?${new URLSearchParams(Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => { acc[k] = String(v); return acc; }, {}))}` : "";
  const res = await apiCaller<EmployeeListResponse>(`${url}${query}`, "GET");
  return res.data;
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
    const { profile_picture, ...employeeData } = payload;
    
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


