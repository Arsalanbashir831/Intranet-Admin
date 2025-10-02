import { useQuery, useQueries } from "@tanstack/react-query";
import { getStats, getKnowledgeBaseStats } from "@/services/stats";
import { StatsResponse, KnowledgeBaseStatsResponse } from "@/types/stats";

/**
 * Hook to fetch system statistics
 * @returns useQuery result with StatsResponse data
 */
export function useStats() {
  return useQuery<StatsResponse>({
    queryKey: ["stats"],
    queryFn: getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch knowledge base statistics
 * @returns useQuery result with KnowledgeBaseStatsResponse data
 */
export function useKnowledgeBaseStats() {
  return useQuery<KnowledgeBaseStatsResponse>({
    queryKey: ["knowledge-base-stats"],
    queryFn: getKnowledgeBaseStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch both system and knowledge base statistics
 * @returns Object with both stats and knowledgeBaseStats
 */
export function useDashboardStats() {
  const [stats, knowledgeBaseStats] = useQueries({
    queries: [
      {
        queryKey: ["stats"],
        queryFn: getStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      {
        queryKey: ["knowledge-base-stats"],
        queryFn: getKnowledgeBaseStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      }
    ]
  });
  
  return {
    stats,
    knowledgeBaseStats
  };
}