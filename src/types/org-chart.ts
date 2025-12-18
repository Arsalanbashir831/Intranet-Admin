import { Employee as ApiEmployeeType } from "@/types/employees";

export type EmployeeRow = {
  id: string;
  name: string;
  avatar?: string;
  location: string; // Will show all branches separated by comma
  email: string;
  department: string; // Will show all departments separated by commaa
  role: string;
  reportingTo: string | null;
  reportingAvatar?: string;
  staffCount?: number;
};

export interface OrgChartEmployeeProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  department: string;
  reportingTo: string;
  branch: string;
  status: string;
  bio: string;
  profileImage: string;
}

export interface EmployeeProfileCardProps {
  employee?: OrgChartEmployeeProfile;
  employeeId?: number | string;
}

export type OrgChartInitialValues = {
  emp_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  bio?: string | null;
  branch_department?: string | string[]; // id(s) as string(s) for UI select - single for regular employees, array for managers
  profileImageUrl?: string;
};

export type OrgChartFormProps = {
  initialValues?: OrgChartInitialValues;
  onRegisterSubmit?: (submit: () => void) => void;
  isEdit?: boolean;
  employeeId?: string;
  onSubmitComplete?: (success: boolean) => void;
};
