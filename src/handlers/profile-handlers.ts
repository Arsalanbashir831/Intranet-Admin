import { ProfileEmployee, ExtendedEmployee } from "@/types/profile";

export const validatePasswordChange = (
  current: string,
  next: string,
  confirm: string
): string | null => {
  if (!current || !next || !confirm) {
    return "All fields are required.";
  }
  if (next !== confirm) {
    return "New password and confirm password do not match.";
  }
  return null;
};

export const resolveProfileEmployee = (
  apiEmployee: ExtendedEmployee | undefined,
  fallbackEmployee?: ProfileEmployee
): ProfileEmployee | undefined => {
  if (!apiEmployee) return fallbackEmployee;

  return {
    id: apiEmployee.id.toString(),
    name: apiEmployee.emp_name,
    role: apiEmployee.role || "",
    email: apiEmployee.email || "",
    phone: apiEmployee.phone || "",
    joinDate: apiEmployee.hire_date
      ? new Date(apiEmployee.hire_date).toLocaleDateString()
      : "",
    department:
      apiEmployee.branch_departments?.[0]?.department?.dept_name || "",
    reportingTo: apiEmployee.branch_departments?.[0]?.manager
      ? apiEmployee.branch_departments[0].manager.employee?.emp_name || "--"
      : "--",
    branch: apiEmployee.branch_departments?.[0]?.branch?.branch_name || "",
    status: "Active Employee",
    bio: apiEmployee.bio || "",
    profileImage: apiEmployee.profile_picture || "",
  };
};
