import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";

export type Department = {
  id: number;
  name: string;
  description?: string;
  [key: string]: unknown;
};

export type DepartmentListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Department[];
};
export type DepartmentDetailResponse = Department;
export type DepartmentCreateRequest = {
  name: string;
  description?: string;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;
export type DepartmentCreateResponse = Department;
export type DepartmentUpdateRequest = Partial<DepartmentCreateRequest>;
export type DepartmentUpdateResponse = Department;

export async function listDepartments(params?: Record<string, string | number | boolean>) {
  const url = API_ROUTES.DEPARTMENTS.LIST;
  const query = params ? `?${new URLSearchParams(Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => { acc[k] = String(v); return acc; }, {}))}` : "";
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
