import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams } from "@/lib/service-utils";
import type { Role, RoleCreateRequest, RoleListResponse, RoleUpdateRequest } from "@/types/roles";

export async function listRoles(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.ROLES.LIST;
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
  const res = await apiCaller<RoleListResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function createRole(payload: RoleCreateRequest) {
  const res = await apiCaller<{ role: Role }>(API_ROUTES.ROLES.CREATE, "POST", payload, {}, "json");
  return res.data.role;
}

export async function updateRole(id: number | string, payload: RoleUpdateRequest) {
  const res = await apiCaller<{ role: Role }>(API_ROUTES.ROLES.UPDATE(id), "PATCH", payload, {}, "json");
  return res.data.role;
}

export async function deleteRole(id: number | string) {
  await apiCaller<void>(API_ROUTES.ROLES.DELETE(id), "DELETE");
}

