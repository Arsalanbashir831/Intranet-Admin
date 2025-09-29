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
  profile_picture?: string | null;
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
  const res = await apiCaller<EmployeeCreateResponse>(API_ROUTES.EMPLOYEES.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateEmployee(id: number | string, payload: EmployeeUpdateRequest) {
  const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPDATE(id), "PATCH", payload, {}, "json");
  return res.data;
}

export async function deleteEmployee(id: number | string) {
  await apiCaller<void>(API_ROUTES.EMPLOYEES.DELETE(id), "DELETE");
}


