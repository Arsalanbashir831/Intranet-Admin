import apiCaller from "@/lib/api-caller";
import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type LocationListResponse = paths["/api/locations/"]["get"]["responses"][200]["content"]["application/json"];
export type LocationDetailResponse = paths["/api/locations/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type LocationCreateRequest = components["schemas"]["LocationsRequest"];
export type LocationCreateResponse = paths["/api/locations/"]["post"]["responses"][201]["content"]["application/json"];
export type LocationUpdateRequest = components["schemas"]["LocationsRequest"];
export type LocationUpdateResponse = paths["/api/locations/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listLocations(params?: Record<string, unknown>) {
  const url = API_ROUTES.LOCATIONS.LIST;
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const res = await apiCaller<LocationListResponse>(`${url}${query}`, "GET");
  return res.data;
}

export async function getLocation(id: number | string) {
  const res = await apiCaller<LocationDetailResponse>(API_ROUTES.LOCATIONS.DETAIL(id), "GET");
  return res.data;
}

export async function createLocation(payload: LocationCreateRequest) {
  const res = await apiCaller<LocationCreateResponse>(API_ROUTES.LOCATIONS.CREATE, "POST", payload, {}, "json");
  return res.data;
}

export async function updateLocation(id: number | string, payload: LocationUpdateRequest) {
  const res = await apiCaller<LocationUpdateResponse>(API_ROUTES.LOCATIONS.UPDATE(id), "PUT", payload, {}, "json");
  return res.data;
}

export async function deleteLocation(id: number | string) {
  await apiCaller<void>(API_ROUTES.LOCATIONS.DELETE(id), "DELETE");
}
