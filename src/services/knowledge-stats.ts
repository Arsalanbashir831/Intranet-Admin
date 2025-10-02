import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { AnnouncementRateResponse } from "@/types/stats";

export type AnnouncementRateParams = {
  start_date: string;
  end_date: string;
  filter: string;
};

/**
 * Fetch announcement rate statistics
 * @param params - The parameters for the API call
 * @returns AnnouncementRateResponse - Statistics about announcement rates
 */
export async function getAnnouncementRate(params: AnnouncementRateParams): Promise<AnnouncementRateResponse> {
  // Build query string from params
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_ROUTES.KNOWLEDGE_BASE.ANNOUNCEMENT_STATS}?${queryString}`;
  
  const res = await apiCaller<AnnouncementRateResponse>(url, "GET");
  return res.data;
}