import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type EmployeeListResponse = paths["/api/employees/"]["get"]["responses"][200]["content"]["application/json"];
export type EmployeeDetailResponse = paths["/api/employees/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type EmployeeCreateRequest = components["schemas"]["EmployeeCreateRequest"];
export type EmployeeCreateResponse = paths["/api/employees/"]["post"]["responses"][201]["content"]["application/json"];
export type EmployeeUpdateRequest = components["schemas"]["EmployeeUpdateRequest"];
export type EmployeeUpdateResponse = paths["/api/employees/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listEmployees(params?: Record<string, unknown>) {
  const url = API_ROUTES.EMPLOYEES.LIST;
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const res = await apiCaller<EmployeeListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getEmployee(id: number | string) {
  const res = await apiCaller<EmployeeDetailResponse>(API_ROUTES.EMPLOYEES.DETAIL(id), "GET");
  return res.data;
}

export async function createEmployee(payload: EmployeeCreateRequest) {
  const res = await apiCaller<EmployeeCreateResponse>(API_ROUTES.EMPLOYEES.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateEmployee(id: number | string, payload: EmployeeUpdateRequest) {
  const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPDATE(id), "PUT", payload, {}, "json");
  return res.data;
}

export async function deleteEmployee(id: number | string) {
  await apiCaller<void>(API_ROUTES.EMPLOYEES.DELETE(id), "DELETE");
}


