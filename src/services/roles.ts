import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";

export type Role = {
  id: number;
  name: string;
  access_level: "employee" | "manager" | "executive";
};

export type RoleListResponse = {
  roles: {
    count: number;
    page: number;
    page_size: number;
    results: Role[];
  };
};

export type RoleCreateRequest = {
  name: string;
  access_level: "employee" | "manager" | "executive";
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type RoleCreateResponse = {
  role: Role;
};

export type RoleUpdateRequest = {
  name?: string;
  access_level?: "employee" | "manager" | "executive";
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type RoleUpdateResponse = {
  role: Role;
};

export async function listRoles(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.ROLES.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0,
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
    
  const res = await apiCaller<RoleListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function createRole(payload: RoleCreateRequest) {
  const res = await apiCaller<RoleCreateResponse>(API_ROUTES.ROLES.CREATE, "POST", payload, {}, "json");
  return res.data.role;
}

export async function updateRole(id: number | string, payload: RoleUpdateRequest) {
  const res = await apiCaller<RoleUpdateResponse>(API_ROUTES.ROLES.UPDATE(id), "PATCH", payload, {}, "json");
  return res.data.role;
}

export async function deleteRole(id: number | string) {
  await apiCaller<void>(API_ROUTES.ROLES.DELETE(id), "DELETE");
}

