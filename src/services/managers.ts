import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";

export type Manager = {
  id: number;
  employee_id: number;
  branch_department_id: number;
  employee: {
    id: number;
    full_name: string;
    profile_picture?: string;
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

export type ManagerListResponse = {
  managers: {
    count: number;
    page: number;
    page_size: number;
    results: Manager[];
  };
};

export type ManagerCreateRequest = {
  employee_id: number;
  branch_department_id: number;
};

export type ManagerCreateResponse = Manager;

export type ManagerUpdateRequest = Partial<ManagerCreateRequest>;

export type ManagerUpdateResponse = Manager;

export async function listManagers(
  params?: Record<string, string | number | boolean>
) {
  const url = API_ROUTES.MANAGERS.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  
  const query = Object.keys(queryParams).length > 0 
    ? `?${new URLSearchParams(queryParams)}` 
    : "";
    
  const res = await apiCaller<ManagerListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getManager(id: number | string) {
  const res = await apiCaller<Manager>(API_ROUTES.MANAGERS.DETAIL(id), "GET");
  return res.data;
}

export async function createManager(payload: ManagerCreateRequest) {
  const res = await apiCaller<ManagerCreateResponse>(API_ROUTES.MANAGERS.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateManager(id: number | string, payload: ManagerUpdateRequest) {
  const res = await apiCaller<ManagerUpdateResponse>(API_ROUTES.MANAGERS.UPDATE(id), "PUT", payload, {}, "json");
  return res.data;
}

export async function deleteManager(id: number | string) {
  await apiCaller<void>(API_ROUTES.MANAGERS.DELETE(id), "DELETE");
}