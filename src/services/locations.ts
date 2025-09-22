// TODO: Uncomment when backend is ready
// import apiCaller from "@/lib/api-caller";
// import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type LocationListResponse = paths["/api/locations/"]["get"]["responses"][200]["content"]["application/json"];
export type LocationDetailResponse = paths["/api/locations/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type LocationCreateRequest = components["schemas"]["LocationsRequest"];
export type LocationCreateResponse = paths["/api/locations/"]["post"]["responses"][201]["content"]["application/json"];
export type LocationUpdateRequest = components["schemas"]["LocationsRequest"];
export type LocationUpdateResponse = paths["/api/locations/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listLocations(_params?: Record<string, unknown>) {
  // TODO: Uncomment when backend is ready
  // const url = API_ROUTES.LOCATIONS.LIST;
  // const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  // const res = await apiCaller<LocationListResponse>(`${url}${query}`, "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<LocationListResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        count: 4,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: "New York Office",
            address: "123 Main Street, New York, NY 10001",
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z"
          },
          {
            id: 2,
            name: "San Francisco Office",
            address: "456 Tech Avenue, San Francisco, CA 94105",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 3,
            name: "Boston Office",
            address: "789 Innovation Drive, Boston, MA 02101",
            created_at: "2024-02-01T10:00:00Z",
            updated_at: "2024-02-01T10:00:00Z"
          },
          {
            id: 4,
            name: "Chicago Office",
            address: "321 Business Plaza, Chicago, IL 60601",
            created_at: "2024-02-15T10:00:00Z",
            updated_at: "2024-02-15T10:00:00Z"
          }
        ]
      });
    }, 700);
  });
}

export async function getLocation(id: number | string) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<LocationDetailResponse>(API_ROUTES.LOCATIONS.DETAIL(id), "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<LocationDetailResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        name: `Location ${id}`,
        address: "123 Sample Street, Sample City, SC 12345",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z"
      });
    }, 400);
  });
}

export async function createLocation(payload: LocationCreateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<LocationCreateResponse>(API_ROUTES.LOCATIONS.CREATE, "POST", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<LocationCreateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        name: payload.name,
        address: payload.address || "New Address",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 900);
  });
}

export async function updateLocation(id: number | string, payload: LocationUpdateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<LocationUpdateResponse>(API_ROUTES.LOCATIONS.UPDATE(id), "PUT", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<LocationUpdateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        name: payload.name || `Updated Location ${id}`,
        address: payload.address || "Updated Address",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: new Date().toISOString()
      });
    }, 800);
  });
}

export async function deleteLocation(_id: number | string) {
  // TODO: Uncomment when backend is ready
  // await apiCaller<void>(API_ROUTES.LOCATIONS.DELETE(id), "DELETE");
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 400);
  });
}
