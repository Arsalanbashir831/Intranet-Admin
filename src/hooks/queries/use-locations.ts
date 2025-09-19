import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocation, deleteLocation, getLocation, listLocations, updateLocation } from "@/services/locations";
import type { LocationCreateRequest, LocationUpdateRequest } from "@/services/locations";

export function useLocations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["locations", params],
    queryFn: () => listLocations(params),
    staleTime: 60_000,
  });
}

export function useLocation(id: number | string) {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: () => getLocation(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LocationCreateRequest) => createLocation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateLocation(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LocationUpdateRequest) => updateLocation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
      qc.invalidateQueries({ queryKey: ["locations", id] });
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
