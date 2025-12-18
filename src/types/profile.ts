import { EmployeeWithScope } from "@/types/manager-scope";

export type ChangePasswordValues = {
  current: string;
  next: string;
  confirm: string;
};

export type MfaViewState = "initial" | "enroll-qr" | "disable-confirm";

export interface MfaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled: boolean;
}

export interface ProfileEmployee {
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
  employee?: ProfileEmployee;
}

export type ExtendedEmployee = EmployeeWithScope & {
  email?: string;
  phone?: string | null;
  hire_date?: string;
  bio?: string | null;
};
