import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import { StatsResponse, KnowledgeBaseStatsResponse } from "@/types/stats";

/**
 * Fetch system statistics
 * @returns StatsResponse - Comprehensive statistics about the system
 */
export async function getStats(): Promise<StatsResponse> {
  const res = await apiCaller<StatsResponse>(API_ROUTES.STATS, "GET");
  return res.data;
}

/**
 * Fetch knowledge base statistics
 * @returns KnowledgeBaseStatsResponse - Statistics about the knowledge base
 */
export async function getKnowledgeBaseStats(): Promise<KnowledgeBaseStatsResponse> {
  const res = await apiCaller<KnowledgeBaseStatsResponse>(API_ROUTES.KNOWLEDGE_BASE.STATS, "GET");
  return res.data;
}