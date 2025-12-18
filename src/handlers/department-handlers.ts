import { BranchDepartmentEmployee } from "@/services/departments";
import { Department, DepartmentEmployeeRow, DepartmentRow } from "@/types/departments";

export function transformEmployeeData(results: BranchDepartmentEmployee[] | undefined): DepartmentEmployeeRow[] {
  if (!results) return [];

  return results.map((emp) => ({
    id: String(emp.id),
    name: emp.emp_name || "N/A",
    email: emp.email || "N/A",
    role: emp.role || "N/A",
    avatar: emp.profile_picture || undefined,
    dateOfJoining: emp.hire_date || undefined,
  }));
}

export function normalizeDepartmentsData(
  departmentsData: Department[] | { departments?: { results?: Department[] } } | undefined
): Department[] {
  if (!departmentsData) return [];

  // Handle both array (legacy) and paginated response structure
  return Array.isArray(departmentsData)
    ? departmentsData
    : departmentsData?.departments?.results || [];
}

export function getDepartmentPaginationInfo(
  departmentsData: Department[] | { departments?: { count?: number; page?: number; page_size?: number } } | undefined,
  currentPagination: { page: number; pageSize: number }
) {
  if (!departmentsData) return undefined;

  // If it's a paginated response, extract pagination info
  if (
    typeof departmentsData === "object" &&
    "departments" in departmentsData
  ) {
    const paginated = departmentsData as {
      departments?: { count?: number; page?: number; page_size?: number };
    };
    if (paginated.departments) {
      return {
        count: paginated.departments.count || 0,
        page: paginated.departments.page || 1,
        page_size: paginated.departments.page_size || 10,
      };
    }
  }

  // Fallback for array response
  if (Array.isArray(departmentsData)) {
    return {
      count: departmentsData.length,
      page: currentPagination.page,
      page_size: currentPagination.pageSize,
    };
  }

  return undefined;
}

export function transformDepartmentRows(departments: Department[]): DepartmentRow[] {
  return departments.map((dept) => ({
    id: String(dept.id),
    department: dept.dept_name,
  }));
}
