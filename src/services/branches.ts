import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";

export type Branch = {
  id: number;
  department: number;
  location: number;
  manager: number;
  [key: string]: unknown;
};

export type BranchListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
};
export type BranchDetailResponse = Branch;
export type BranchCreateRequest = {
  department: number;
  location: number;
  manager: number;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;
export type BranchCreateResponse = Branch;
export type BranchUpdateRequest = Partial<BranchCreateRequest>;
export type BranchUpdateResponse = Branch;

export async function listBranches(params?: Record<string, string | number | boolean>) {
  const url = API_ROUTES.BRANCHES.LIST;
  const query = params ? `?${new URLSearchParams(Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => { acc[k] = String(v); return acc; }, {}))}` : "";
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
