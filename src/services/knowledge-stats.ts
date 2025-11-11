import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { buildQueryParams } from "@/lib/service-utils";
import type { AnnouncementRateParams, AnnouncementRateResponse } from "@/types/announcements";

/**
 * Fetch announcement rate statistics
 * @param params - The parameters for the API call
 * @returns AnnouncementRateResponse - Statistics about announcement rates
 */
export async function getAnnouncementRate(params: AnnouncementRateParams): Promise<AnnouncementRateResponse> {
  const query = buildQueryParams(params);
  const url = `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENT_STATS}${query ? `?${query}` : ""}`;
  
  const res = await apiCaller<AnnouncementRateResponse>(url, "GET");
  return res.data;
}