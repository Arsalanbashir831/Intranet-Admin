import { EmployeeRow, OrgChartEmployeeProfile } from "@/types/org-chart";
import { Employee as ApiEmployeeType } from "@/types/employees";

// Create a map of role ID to role name
export const createRoleMap = (rolesData: any): Map<string, string> => {
  const map = new Map<string, string>();
  if (rolesData?.roles?.results) {
    rolesData.roles.results.forEach((role: any) => {
      map.set(String(role.id), role.name);
    });
  }
  return map;
};

// Helper function to convert relative URLs to absolute URLs
export const getAbsoluteUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url; // Already absolute
  if (url.startsWith('/')) {
    // Relative URL starting with /, prepend API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.16:8000';
    return `${baseUrl}${url}`;
  }
  return url; // Return as-is if it doesn't start with /
};

export const transformEmployeeToRow = (
  employee: any, 
  roleMap: Map<string, string>
): EmployeeRow => {
  // Extract unique branches and departments
  const branches = employee.branch_departments?.map((bd: any) => bd.branch?.branch_name).filter(Boolean) || [];
  const departments = employee.branch_departments?.map((bd: any) => bd.department?.dept_name).filter(Boolean) || [];
  
  // Get unique values
  const uniqueBranches = [...new Set(branches)];
  const uniqueDepartments = [...new Set(departments)];

  // Get the first manager found (if any)
  const firstManager = employee.branch_departments?.find((bd: any) => bd.manager)?.manager;

  // Map role ID to role name if available
  const roleId = String(employee.role ?? "");
  const roleName = roleMap.get(roleId) || roleId; 
  
  return {
    id: String(employee.id),
    name: String(employee.emp_name ?? ""),
    avatar: getAbsoluteUrl(employee.profile_picture),
    location: uniqueBranches.join(", ") || "--",
    email: String(employee.email ?? ""),
    department: uniqueDepartments.join(", ") || "--",
    role: roleName,
    reportingTo: firstManager?.employee?.emp_name ?? null,
    reportingAvatar: getAbsoluteUrl(firstManager?.employee?.profile_picture),
  };
};

// Type guard for the wrapped detail response
export const isDetailWrapper = (
  value: unknown
): value is { employee: ApiEmployeeType } => {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "employee" in (value as Record<string, unknown>)
  );
};

export const resolveEmployeeProfile = (
  data: unknown,
  fallbackEmployee?: OrgChartEmployeeProfile
): OrgChartEmployeeProfile | null => {
  // Unwrap to ApiEmployee or use optional prop fallback
  const apiEmployee = isDetailWrapper(data)
    ? data.employee
    : (data as ApiEmployeeType | undefined);

  if (!apiEmployee) return fallbackEmployee ?? null;
  
  // Extract nested fields safely
  const branchDepartments = (
    apiEmployee as unknown as { branch_departments?: any[] }
  )?.branch_departments;

  const hireDate: string | undefined =
    (apiEmployee as unknown as { hire_date?: string } | undefined)?.hire_date ??
    (apiEmployee as unknown as { join_date?: string } | undefined)?.join_date;

  // Extract unique branches and departments
  const branches =
    branchDepartments?.map((bd) => bd.branch?.branch_name).filter(Boolean) ||
    [];
  const departments =
    branchDepartments?.map((bd) => bd.department?.dept_name).filter(Boolean) ||
    [];
  const uniqueBranches = [...new Set(branches)];
  const uniqueDepartments = [...new Set(departments)];

  // Get the first manager found (if any)
  const firstManager = branchDepartments?.find((bd) => bd.manager)?.manager;

  return {
    id: String((apiEmployee as unknown as { id?: number | string }).id ?? ""),
    name: String(
      (apiEmployee as unknown as { emp_name?: string; name?: string }).emp_name ??
      (apiEmployee as unknown as { name?: string }).name ??
      ""
    ),
    role: String((apiEmployee as unknown as { role?: string }).role ?? ""),
    email: String((apiEmployee as unknown as { email?: string }).email ?? ""),
    phone: String((apiEmployee as unknown as { phone?: string }).phone ?? ""),
    joinDate: hireDate
      ? new Intl.DateTimeFormat("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }).format(new Date(hireDate))
      : "",
    department: uniqueDepartments.join(", ") || "--",
    reportingTo: String(firstManager?.employee?.emp_name ?? "--"),
    branch: uniqueBranches.join(", ") || "--",
    status: "ACTIVE",
    bio: String((apiEmployee as unknown as { bio?: string }).bio ?? ""),
    profileImage: String(
      (apiEmployee as unknown as { profile_picture?: string })
        .profile_picture ?? ""
    ),
  };
};
