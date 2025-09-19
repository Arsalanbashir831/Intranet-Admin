import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type DepartmentListResponse = paths["/api/departments/"]["get"]["responses"][200]["content"]["application/json"];
export type DepartmentDetailResponse = paths["/api/departments/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type DepartmentCreateRequest = components["schemas"]["DepartmentCreateRequest"];
export type DepartmentCreateResponse = paths["/api/departments/"]["post"]["responses"][201]["content"]["application/json"];
export type DepartmentUpdateRequest = components["schemas"]["DepartmentUpdateRequest"];
export type DepartmentUpdateResponse = paths["/api/departments/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listDepartments(params?: Record<string, unknown>) {
  const url = API_ROUTES.DEPARTMENTS.LIST;
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
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

export async function deleteDepartment(id: number | string) {
  await apiCaller<void>(API_ROUTES.DEPARTMENTS.DELETE(id), "DELETE");
}
