import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { buildQueryParams } from "@/lib/service-utils";
import type { Manager, ManagerCreateRequest, ManagerListResponse, ManagerUpdateRequest, } from "@/types/managers";


export async function listManagers(
  params?: Record<string, string | number | boolean>
) {
  const url = API_ROUTES.MANAGERS.LIST;
  const query = buildQueryParams(params);
  const res = await apiCaller<ManagerListResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function getManager(id: number | string) {
  const res = await apiCaller<Manager>(API_ROUTES.MANAGERS.DETAIL(id), "GET");
  return res.data;
}

export async function createManager(payload: ManagerCreateRequest) {
  const res = await apiCaller<Manager>(API_ROUTES.MANAGERS.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateManager(id: number | string, payload: ManagerUpdateRequest) {
  const res = await apiCaller<Manager>(API_ROUTES.MANAGERS.UPDATE(id), "PUT", payload, {}, "json");
  return res.data;
}

export async function deleteManager(id: number | string) {
  await apiCaller<void>(API_ROUTES.MANAGERS.DELETE(id), "DELETE");
}