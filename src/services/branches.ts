import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type BranchListResponse = paths["/api/branches/"]["get"]["responses"][200]["content"]["application/json"];
export type BranchDetailResponse = paths["/api/branches/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type BranchCreateRequest = components["schemas"]["BranchCreateRequest"];
export type BranchCreateResponse = paths["/api/branches/"]["post"]["responses"][201]["content"]["application/json"];
export type BranchUpdateRequest = components["schemas"]["BranchUpdateRequest"];
export type BranchUpdateResponse = paths["/api/branches/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listBranches(params?: Record<string, unknown>) {
  const url = API_ROUTES.BRANCHES.LIST;
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const res = await apiCaller<BranchListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getBranch(id: number | string) {
  const res = await apiCaller<BranchDetailResponse>(API_ROUTES.BRANCHES.DETAIL(id), "GET");
  return res.data;
}

export async function createBranch(payload: BranchCreateRequest) {
  const res = await apiCaller<BranchCreateResponse>(API_ROUTES.BRANCHES.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateBranch(id: number | string, payload: BranchUpdateRequest) {
  const res = await apiCaller<BranchUpdateResponse>(API_ROUTES.BRANCHES.UPDATE(id), "PUT", payload, {}, "json");
  return res.data;
}

export async function deleteBranch(id: number | string) {
  await apiCaller<void>(API_ROUTES.BRANCHES.DELETE(id), "DELETE");
}
