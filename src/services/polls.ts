import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { generatePaginationParams } from "@/lib/pagination-utils";
import { buildQueryParams, numberArrayToStringArray } from "@/lib/service-utils";
import type { Poll, PollApiResponse, PollListResponse, PollCreateRequest } from "@/types/polls";

export async function listPolls(
  params?: Record<string, string | number | boolean>,
  pagination?: { page?: number; pageSize?: number },
  managerScope?: boolean
) {
  const url = API_ROUTES.POLLS.LIST;
  const queryParams: Record<string, string | number | boolean> = {
    ...params,
    include_expired: true,
  };

  // Add manager scope parameter
  if (managerScope) {
    queryParams.manager_scope = true;
  }

  // Add pagination parameters
  if (pagination) {
    const paginationParams = generatePaginationParams(
      pagination.page ? pagination.page - 1 : 0, // Convert to 0-based for our utils
      pagination.pageSize || 10
    );
    Object.assign(queryParams, paginationParams);
  }

  const query = buildQueryParams(queryParams);
  const res = await apiCaller<PollListResponse>(`${url}${query ? `?${query}` : ""}`, "GET");
  return res.data;
}

export async function getPoll(id: number | string): Promise<Poll> {
  const res = await apiCaller<PollApiResponse>(
    API_ROUTES.POLLS.DETAIL(id),
    "GET"
  );

  // Transform API response to frontend format
  const apiData = res.data!;
  return {
    ...apiData,
    options: apiData.options_details || [],
    created_by_details: apiData.created_by_details?.emp_name || null,
  };
}

export async function createPoll(payload: PollCreateRequest) {
  // Convert number arrays to string arrays for API compatibility
  const apiPayload = {
    ...payload,
    permitted_branches: payload.permitted_branches ? numberArrayToStringArray(payload.permitted_branches) : undefined,
    permitted_departments: payload.permitted_departments ? numberArrayToStringArray(payload.permitted_departments) : undefined,
    permitted_branch_departments: payload.permitted_branch_departments ? numberArrayToStringArray(payload.permitted_branch_departments) : undefined,
    // Convert options array to the format expected by the API
    options: payload.options.map(option => option.option_text),
  };

  const res = await apiCaller<Poll>(
    API_ROUTES.POLLS.CREATE,
    "POST",
    apiPayload,
    {},
    "json"
  );
  return res.data;
}


export async function deletePoll(id: number | string) {
  await apiCaller<void>(API_ROUTES.POLLS.DELETE(id), "DELETE");
}
