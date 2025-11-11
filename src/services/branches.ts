import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams } from "@/lib/service-utils";
import type { Branch, BranchDepartmentListItem, BranchCreateRequest, BranchUpdateRequest } from "@/types/branches";

export async function listBranches(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.BRANCHES.LIST;
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
  };

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<{ branches: { count: number; page: number; page_size: number; results: Branch[]; } }>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

// Add search branches function
export async function searchBranches(
  searchQuery: string,
  pagination?: { page?: number; pageSize?: number }
) {
  const params = searchQuery ? { search: searchQuery } : undefined;
  return listBranches(params, pagination);
}

// Function to fetch all branches across all pages
export async function listAllBranches(
  params?: Record<string, string | number | boolean>
): Promise<{ branches: { count: number; results: Branch[] } }> {
  const allBranches: Branch[] = [];
  let page = 1;
  let totalCount = 0;

  do {
    const response = await listBranches(params, { page, pageSize: 50 }); // Use larger page size for efficiency

    if (response.branches.results.length > 0) {
      allBranches.push(...response.branches.results);
    }

    totalCount = response.branches.count;
    const currentPageSize = response.branches.page_size;
    const totalPages = Math.ceil(totalCount / currentPageSize);

    if (page >= totalPages) {
      break;
    }

    page++;
  } while (true);

  return {
    branches: {
      count: totalCount,
      results: allBranches
    }
  };
}

export async function getBranch(id: number | string) {
  const res = await apiCaller<{ branch: Branch }>(API_ROUTES.BRANCHES.DETAIL(id), "GET");
  return res.data.branch;
}

export async function createBranch(payload: BranchCreateRequest) {
  const res = await apiCaller<{ branch: Branch }>(API_ROUTES.BRANCHES.CREATE, "POST", payload, {}, "json");
  return res.data.branch;
}

export async function updateBranch(id: number | string, payload: BranchUpdateRequest) {
  const res = await apiCaller<{ branch: Branch }>(API_ROUTES.BRANCHES.UPDATE(id), "PATCH", payload, {}, "json");
  return res.data.branch;
}

export async function deleteBranch(id: number | string) {
  await apiCaller<void>(API_ROUTES.BRANCHES.DELETE(id), "DELETE");
}

export async function listBranchDepartments(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.BRANCH_DEPARTMENTS.LIST;
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
  const res = await apiCaller<{ branch_departments: { count: number; page: number; page_size: number; results: BranchDepartmentListItem[]; } }>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function createBranchDepartment(payload: { branch_id: number; department_id: number }) {
  const res = await apiCaller<{ id: number; branch_id: number; department_id: number; }>(API_ROUTES.BRANCH_DEPARTMENTS.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateBranchDepartment(id: number | string, payload: { branch_id: number; department_id: number }) {
  const res = await apiCaller<{ id: number; branch_id: number; department_id: number; }>(API_ROUTES.BRANCH_DEPARTMENTS.UPDATE(id), "PATCH", payload, {}, "json");
  return res.data;
}

export async function deleteBranchDepartment(id: number | string) {
  await apiCaller<void>(API_ROUTES.BRANCH_DEPARTMENTS.DELETE(id), "DELETE");
}
