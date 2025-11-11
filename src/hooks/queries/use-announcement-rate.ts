import { useQuery } from "@tanstack/react-query";
import { getAnnouncementRate } from "@/services/knowledge-stats";
import { AnnouncementRateParams } from "@/types/announcements";

export function useAnnouncementRate(params: AnnouncementRateParams) {
  return useQuery({
    queryKey: ["announcement-rate", params],
    queryFn: () => getAnnouncementRate(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}