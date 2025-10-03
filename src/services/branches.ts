import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";

export type Branch = {
  id: number;
  branch_name: string;
  location: null | unknown;
  employee_count: number;
  departments: Array<{
    id: number;
    dept_name: string;
    branch_department_id: number;
    employee_count: number;
    manager: null | {
      id: number;
      employee: {
        id: number;
        emp_name: string;
        profile_picture?: string | null;
        email: string;
        role: string;
      };
      branch_department: {
        id: number;
        branch: {
          id: number;
          branch_name: string;
        };
        department: {
          id: number;
          dept_name: string;
        };
      };
    };
  }>;
};

export type BranchListResponse = {
  branches: {
    count: number;
    page: number;
    page_size: number;
    results: Branch[];
  };
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

export async function listBranches(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number }
) {
  const url = API_ROUTES.BRANCHES.LIST;
  const queryParams: Record<string, string> = {};
  
  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
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
    
  const res = await apiCaller<BranchListResponse>(`${url}${query}`, "GET");
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
