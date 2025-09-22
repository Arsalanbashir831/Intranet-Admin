// TODO: Uncomment when backend is ready
// import apiCaller from "@/lib/api-caller";
// import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type DepartmentListResponse = paths["/api/departments/"]["get"]["responses"][200]["content"]["application/json"];
export type DepartmentDetailResponse = paths["/api/departments/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type DepartmentCreateRequest = components["schemas"]["DepartmentRequest"];
export type DepartmentCreateResponse = paths["/api/departments/"]["post"]["responses"][201]["content"]["application/json"];
export type DepartmentUpdateRequest = components["schemas"]["DepartmentRequest"];
export type DepartmentUpdateResponse = paths["/api/departments/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listDepartments(_params?: Record<string, unknown>) {
  // TODO: Uncomment when backend is ready
  // const url = API_ROUTES.DEPARTMENTS.LIST;
  // const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  // const res = await apiCaller<DepartmentListResponse>(`${url}${query}`, "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<DepartmentListResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        count: 4,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: "Human Resources",
            description: "Manages employee relations, recruitment, and benefits",
            employee_count: "8",
            locations: [
              { id: 1, name: "Main Office", address: "123 Main St, New York, NY 10001", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" }
            ],
            created_at: "2024-01-10T10:00:00Z",
            updated_at: "2024-01-10T10:00:00Z"
          },
          {
            id: 2,
            name: "Engineering",
            description: "Software development and technical solutions",
            employee_count: "25",
            locations: [
              { id: 2, name: "Tech Hub", address: "456 Tech Ave, San Francisco, CA 94105", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" }
            ],
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 3,
            name: "Sales",
            description: "Customer acquisition and revenue generation",
            employee_count: "15",
            locations: [
              { id: 3, name: "Sales Floor", address: "789 Sales St, Boston, MA 02101", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" }
            ],
            created_at: "2024-01-20T10:00:00Z",
            updated_at: "2024-01-20T10:00:00Z"
          },
          {
            id: 4,
            name: "Marketing",
            description: "Brand promotion and market research",
            employee_count: "12",
            locations: [
              { id: 4, name: "Creative Studio", address: "321 Creative Blvd, Chicago, IL 60601", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" }
            ],
            created_at: "2024-01-25T10:00:00Z",
            updated_at: "2024-01-25T10:00:00Z"
          }
        ]
      });
    }, 800);
  });
}

export async function getDepartment(id: number | string) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<DepartmentDetailResponse>(API_ROUTES.DEPARTMENTS.DETAIL(id), "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<DepartmentDetailResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        name: `Department ${id}`,
        description: "Sample department description",
        employee_count: "10",
        locations: [
          { id: 1, name: "Sample Location", address: "123 Sample St, Sample City, SC 12345", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" }
        ],
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z"
      });
    }, 500);
  });
}

export async function createDepartment(payload: DepartmentCreateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<DepartmentCreateResponse>(API_ROUTES.DEPARTMENTS.CREATE, "POST", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<DepartmentCreateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        name: payload.name,
        description: payload.description || "New department",
        employee_count: "0",
        locations: [
          { id: 1, name: "New Location", address: "New Address", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
}

export async function updateDepartment(id: number | string, payload: DepartmentUpdateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<DepartmentUpdateResponse>(API_ROUTES.DEPARTMENTS.UPDATE(id), "PUT", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<DepartmentUpdateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        name: payload.name || `Updated Department ${id}`,
        description: payload.description || "Updated department description",
        employee_count: "15",
        locations: [
          { id: 1, name: "Updated Location", address: "Updated Address", created_at: "2024-01-01T10:00:00Z", updated_at: new Date().toISOString() }
        ],
        created_at: "2024-01-01T10:00:00Z",
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
}

export async function deleteDepartment(_id: number | string) {
  // TODO: Uncomment when backend is ready
  // await apiCaller<void>(API_ROUTES.DEPARTMENTS.DELETE(id), "DELETE");
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}
