// TODO: Uncomment when backend is ready
// import apiCaller from "@/lib/api-caller";
// import { API_ROUTES } from "@/constants/api-routes";
import type { paths, components } from "@/types/api";

export type EmployeeListResponse = paths["/api/employees/"]["get"]["responses"][200]["content"]["application/json"];
export type EmployeeDetailResponse = paths["/api/employees/{id}/"]["get"]["responses"][200]["content"]["application/json"];
export type EmployeeCreateRequest = components["schemas"]["EmployeeCreateRequest"];
export type EmployeeCreateResponse = paths["/api/employees/"]["post"]["responses"][201]["content"]["application/json"];
export type EmployeeUpdateRequest = components["schemas"]["EmployeeUpdateRequest"];
export type EmployeeUpdateResponse = paths["/api/employees/{id}/"]["put"]["responses"][200]["content"]["application/json"];

export async function listEmployees(_params?: Record<string, unknown>) {
  // TODO: Uncomment when backend is ready
  // const url = API_ROUTES.EMPLOYEES.LIST;
  // const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  // const res = await apiCaller<EmployeeListResponse>(`${url}${query}`, "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<EmployeeListResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        count: 6,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            employee_id: "EMP001",
            full_name: "John Smith",
            email: "john.smith@company.com",
            job_title: "Senior Software Engineer",
            emp_role: "Lead Developer",
            department_name: "Engineering",
            department_location: "New York Office",
            employment_type: "full_time",
            active: true
          },
          {
            id: 2,
            employee_id: "EMP002",
            full_name: "Sarah Johnson",
            email: "sarah.johnson@company.com",
            job_title: "Project Manager",
            emp_role: "Senior Manager",
            department_name: "Operations",
            department_location: "San Francisco Office",
            employment_type: "full_time",
            active: true
          },
          {
            id: 3,
            employee_id: "EMP003",
            full_name: "Mike Davis",
            email: "mike.davis@company.com",
            job_title: "Sales Director",
            emp_role: "Director",
            department_name: "Sales",
            department_location: "Boston Office",
            employment_type: "full_time",
            active: true
          },
          {
            id: 4,
            employee_id: "EMP004",
            full_name: "Alice Wilson",
            email: "alice.wilson@company.com",
            job_title: "HR Manager",
            emp_role: "Manager",
            department_name: "Human Resources",
            department_location: "New York Office",
            employment_type: "full_time",
            active: true
          },
          {
            id: 5,
            employee_id: "EMP005",
            full_name: "Bob Brown",
            email: "bob.brown@company.com",
            job_title: "Frontend Developer",
            emp_role: "Developer",
            department_name: "Engineering",
            department_location: "San Francisco Office",
            employment_type: "full_time",
            active: true
          },
          {
            id: 6,
            employee_id: "EMP006",
            full_name: "Carol Garcia",
            email: "carol.garcia@company.com",
            job_title: "Marketing Specialist",
            emp_role: "Specialist",
            department_name: "Marketing",
            department_location: "Boston Office",
            employment_type: "full_time",
            active: true
          }
        ]
      });
    }, 1000);
  });
}

export async function getEmployee(id: number | string) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<EmployeeDetailResponse>(API_ROUTES.EMPLOYEES.DETAIL(id), "GET");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<EmployeeDetailResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        employee_id: `EMP${String(id).padStart(3, '0')}`,
        user: Number(id),
        first_name: "Sample",
        last_name: "Employee",
        user_email: `employee${id}@company.com`,
        phone_number: "+1-555-0000",
        user_city: "Sample City",
        full_name: "Sample Employee",
        email: `employee${id}@company.com`,
        phone: "+1-555-0000",
        city: "Sample City",
        profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        branch: 1,
        branch_name: "Sample Branch",
        branch_detail: "Sample Branch - Sample City",
        reports_to: null,
        supervisor_name: "Sample Supervisor",
        address: "123 Sample St, Sample City, SC 12345",
        qualification_details: "<p>Sample qualifications and education details</p>",
        job_title: "Sample Job Title",
        emp_role: "Sample Role",
        join_date: "2024-01-01",
        employment_type: "full_time",
        active: true,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z"
      });
    }, 500);
  });
}

export async function createEmployee(payload: EmployeeCreateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<EmployeeCreateResponse>(API_ROUTES.EMPLOYEES.CREATE, "POST", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<EmployeeCreateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        branch: payload.branch || null,
        reports_to: payload.reports_to || null,
        address: payload.address || "",
        qualification_details: payload.qualification_details || "",
        job_title: payload.job_title || "",
        emp_role: payload.emp_role || "",
        join_date: payload.join_date || null,
        employment_type: "full_time",
        active: true,
        notes: ""
      });
    }, 1200);
  });
}

export async function updateEmployee(id: number | string, payload: EmployeeUpdateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<EmployeeUpdateResponse>(API_ROUTES.EMPLOYEES.UPDATE(id), "PUT", payload, {}, "json");
  // return res.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<EmployeeUpdateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        first_name: payload.first_name || "Updated",
        last_name: payload.last_name || "Employee",
        phone_number: payload.phone_number || "+1-555-0000",
        user_city: payload.user_city || "Updated City",
        profile_picture: payload.profile_picture || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        branch: payload.branch || 1,
        reports_to: payload.reports_to || null,
        address: payload.address || "Updated Address",
        qualification_details: payload.qualification_details || "<p>Updated qualifications</p>",
        job_title: payload.job_title || "Updated Job Title",
        emp_role: payload.emp_role || "Updated Role",
        join_date: payload.join_date || "2024-01-01",
        employment_type: "full_time",
        active: true,
        notes: ""
      });
    }, 1000);
  });
}

export async function deleteEmployee(_id: number | string) {
  // TODO: Uncomment when backend is ready
  // await apiCaller<void>(API_ROUTES.EMPLOYEES.DELETE(id), "DELETE");
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}


