// TODO: Uncomment when backend is ready
// import apiCaller from "@/lib/api-caller";
// import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type BranchListResponse = paths["/api/branches/"]["get"]["responses"][200]["content"]["application/json"];
export type BranchDetailResponse = paths["/api/branches/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type BranchCreateRequest = components["schemas"]["BranchRequest"];
export type BranchCreateResponse = paths["/api/branches/"]["post"]["responses"][201]["content"]["application/json"];
export type BranchUpdateRequest = components["schemas"]["BranchRequest"];
export type BranchUpdateResponse = paths["/api/branches/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listBranches(_params?: Record<string, unknown>) {
  // TODO: Uncomment when backend is ready
  // const url = API_ROUTES.BRANCHES.LIST;
  // const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  // const res = await apiCaller<BranchListResponse>(`${url}${query}`, "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<BranchListResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        count: 3,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            department: 1,
            location: 1,
            manager: 1,
            department_detail: { 
              id: 1, 
              name: "Headquarters", 
              description: "Main headquarters department",
              employee_count: "25",
              locations: [],
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            location_detail: { 
              id: 1, 
              name: "New York Office", 
              address: "123 Main St, New York, NY 10001",
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            manager_detail: { 
              id: 1, 
              employee_id: "EMP001",
              user: 1,
              first_name: "John",
              last_name: "Smith",
              user_email: "john.smith@company.com",
              phone_number: "+1-555-0101",
              user_city: "New York",
              full_name: "John Smith",
              email: "john.smith@company.com",
              phone: "+1-555-0101",
              city: "New York",
              profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
              branch: 1,
              branch_name: "Main Office",
              branch_detail: "Main Office - New York",
              reports_to: null,
              supervisor_name: "",
              address: "123 Main St, New York, NY 10001",
              qualification_details: "<p>Bachelor's in Computer Science from MIT</p>",
              job_title: "Senior Software Engineer",
              emp_role: "Lead Developer",
              join_date: "2022-03-15",
              employment_type: "full_time",
              active: true,
              created_at: "2022-03-15T10:00:00Z",
              updated_at: "2024-01-15T10:00:00Z"
            },
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 2,
            department: 2,
            location: 2,
            manager: 2,
            department_detail: { 
              id: 2, 
              name: "Operations", 
              description: "Operations department",
              employee_count: "18",
              locations: [],
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            location_detail: { 
              id: 2, 
              name: "San Francisco Office", 
              address: "456 Tech Ave, San Francisco, CA 94105",
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            manager_detail: { 
              id: 2, 
              employee_id: "EMP002",
              user: 2,
              first_name: "Sarah",
              last_name: "Johnson",
              user_email: "sarah.johnson@company.com",
              phone_number: "+1-555-0102",
              user_city: "San Francisco",
              full_name: "Sarah Johnson",
              email: "sarah.johnson@company.com",
              phone: "+1-555-0102",
              city: "San Francisco",
              profile_picture: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=60",
              branch: 2,
              branch_name: "West Coast Branch",
              branch_detail: "West Coast Branch - San Francisco",
              reports_to: 1,
              supervisor_name: "John Smith",
              address: "456 Tech Ave, San Francisco, CA 94105",
              qualification_details: "<p>Master's in Business Administration from Stanford</p>",
              job_title: "Project Manager",
              emp_role: "Senior Manager",
              join_date: "2023-01-10",
              employment_type: "full_time",
              active: true,
              created_at: "2023-01-10T10:00:00Z",
              updated_at: "2024-01-10T10:00:00Z"
            },
            created_at: "2024-02-01T10:00:00Z",
            updated_at: "2024-02-01T10:00:00Z"
          },
          {
            id: 3,
            department: 3,
            location: 3,
            manager: 3,
            department_detail: { 
              id: 3, 
              name: "Sales", 
              description: "Sales department",
              employee_count: "12",
              locations: [],
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            location_detail: { 
              id: 3, 
              name: "Boston Office", 
              address: "789 Sales St, Boston, MA 02101",
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            manager_detail: { 
              id: 3, 
              employee_id: "EMP003",
              user: 3,
              first_name: "Mike",
              last_name: "Davis",
              user_email: "mike.davis@company.com",
              phone_number: "+1-555-0103",
              user_city: "Boston",
              full_name: "Mike Davis",
              email: "mike.davis@company.com",
              phone: "+1-555-0103",
              city: "Boston",
              profile_picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=60",
              branch: 3,
              branch_name: "East Coast Branch",
              branch_detail: "East Coast Branch - Boston",
              reports_to: 1,
              supervisor_name: "John Smith",
              address: "789 Sales St, Boston, MA 02101",
              qualification_details: "<p>Bachelor's in Marketing from Harvard</p>",
              job_title: "Sales Director",
              emp_role: "Director",
              join_date: "2022-06-01",
              employment_type: "full_time",
              active: true,
              created_at: "2022-06-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            },
            created_at: "2024-02-15T10:00:00Z",
            updated_at: "2024-02-15T10:00:00Z"
          }
        ]
      });
    }, 800);
  });
}

export async function getBranch(id: number | string) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<BranchDetailResponse>(API_ROUTES.BRANCHES.DETAIL(id), "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<BranchDetailResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        department: 1,
        location: 1,
        manager: 1,
        department_detail: { 
          id: 1, 
          name: "Sample Department", 
          description: "Sample department description",
          employee_count: "15",
          locations: [],
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z"
        },
        location_detail: { 
          id: 1, 
          name: "Sample Location", 
          address: "123 Sample St, Sample City, SC 12345",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z"
        },
        manager_detail: { 
          id: 1, 
          employee_id: "EMP001",
          user: 1,
          first_name: "Sample",
          last_name: "Manager",
          user_email: "sample.manager@company.com",
          phone_number: "+1-555-0000",
          user_city: "Sample City",
          full_name: "Sample Manager",
          email: "sample.manager@company.com",
          phone: "+1-555-0000",
          city: "Sample City",
          profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
          branch: 1,
          branch_name: "Sample Branch",
          branch_detail: "Sample Branch - Sample City",
          reports_to: null,
          supervisor_name: "",
          address: "123 Sample St, Sample City, SC 12345",
          qualification_details: "<p>Sample qualifications</p>",
          job_title: "Sample Job Title",
          emp_role: "Sample Role",
          join_date: "2024-01-01",
          employment_type: "full_time",
          active: true,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z"
        },
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z"
      });
    }, 500);
  });
}

export async function createBranch(payload: BranchCreateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<BranchCreateResponse>(API_ROUTES.BRANCHES.CREATE, "POST", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<BranchCreateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        department: payload.department,
        location: payload.location,
        manager: payload.manager,
        department_detail: { 
          id: payload.department, 
          name: "New Department", 
          description: "New department description",
          employee_count: "0",
          locations: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        location_detail: { 
          id: payload.location, 
          name: "New Location", 
          address: "New Address",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        manager_detail: { 
          id: payload.manager, 
          employee_id: "EMP001",
          user: payload.manager,
          first_name: "New",
          last_name: "Manager",
          user_email: "new.manager@company.com",
          phone_number: "+1-555-0000",
          user_city: "New City",
          full_name: "New Manager",
          email: "new.manager@company.com",
          phone: "+1-555-0000",
          city: "New City",
          profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
          branch: Date.now(),
          branch_name: "New Branch",
          branch_detail: "New Branch - New Location",
          reports_to: null,
          supervisor_name: "",
          address: "New Address",
          qualification_details: "<p>New manager qualifications</p>",
          job_title: "New Manager",
          emp_role: "Manager",
          join_date: new Date().toISOString().split('T')[0],
          employment_type: "full_time",
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
}

export async function updateBranch(id: number | string, payload: BranchUpdateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<BranchUpdateResponse>(API_ROUTES.BRANCHES.UPDATE(id), "PUT", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<BranchUpdateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        department: payload.department || 1,
        location: payload.location || 1,
        manager: payload.manager || 1,
        department_detail: { 
          id: payload.department || 1, 
          name: "Updated Department", 
          description: "Updated department description",
          employee_count: "20",
          locations: [],
          created_at: "2024-01-01T10:00:00Z",
          updated_at: new Date().toISOString()
        },
        location_detail: { 
          id: payload.location || 1, 
          name: "Updated Location", 
          address: "Updated Address",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: new Date().toISOString()
        },
        manager_detail: { 
          id: payload.manager || 1, 
          employee_id: "EMP001",
          user: payload.manager || 1,
          first_name: "Updated",
          last_name: "Manager",
          user_email: "updated.manager@company.com",
          phone_number: "+1-555-0000",
          user_city: "Updated City",
          full_name: "Updated Manager",
          email: "updated.manager@company.com",
          phone: "+1-555-0000",
          city: "Updated City",
          profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
          branch: Number(id),
          branch_name: "Updated Branch",
          branch_detail: "Updated Branch - Updated Location",
          reports_to: null,
          supervisor_name: "",
          address: "Updated Address",
          qualification_details: "<p>Updated manager qualifications</p>",
          job_title: "Updated Manager",
          emp_role: "Manager",
          join_date: "2024-01-01",
          employment_type: "full_time",
          active: true,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: new Date().toISOString()
        },
        created_at: "2024-01-01T10:00:00Z",
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
}

export async function deleteBranch(_id: number | string) {
  // TODO: Uncomment when backend is ready
  // await apiCaller<void>(API_ROUTES.BRANCHES.DELETE(id), "DELETE");
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}
