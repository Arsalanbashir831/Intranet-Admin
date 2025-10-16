// Manager scope types for role-based access control

export interface BranchDepartment {
  id: number;
  branch: {
    id: number;
    branch_name: string;
  };
  department: {
    id: number;
    dept_name: string;
  };
  manager?: {
    id: number;
    employee: {
      id: number;
      emp_name: string;
      profile_picture?: string;
      email: string;
      role: string;
    };
    branch_department: {
      id: number;
      branch: {
        id: number;
        branch_name: string;
      };
      department: {
        id: number;
        dept_name: string;
      };
    };
  } | null;
}

export interface ManagerScope {
  is_manager: boolean;
  managed_departments: number[];
  managed_departments_details: Array<{
    id: number;
    branch: {
      id: number;
      branch_name: string;
    };
    department: {
      id: number;
      dept_name: string;
    };
  }>;
  permissions: {
    can_manage_employees: boolean;
    can_create_announcements: boolean;
    can_upload_knowledge: boolean;
    can_assign_tasks: boolean;
    can_view_analytics: boolean;
  };
}

export interface EmployeeWithScope {
  id: number;
  emp_name: string;
  email: string;
  role: string;
  isAdmin: boolean; // If true, user has full admin access; if false, role-based access applies
  branch_department_ids: number[];
  branch_departments: BranchDepartment[];
  hire_date: string;
  address: string;
  city: string;
  phone: string;
  education: string;
  bio: string;
  profile_picture: string;
}

export interface ManagerMeResponse {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
  };
  employee: EmployeeWithScope;
  manager_scope?: ManagerScope;
}

// Manager access validation types
export interface ManagerAccessCheck {
  canAccess: boolean;
  reason?: string;
  allowedDepartments?: number[];
}

// Strict manager access validation for employee ownership
export interface ManagerEmployeeAccessCheck {
  canAccess: boolean;
  reason?: string;
  employeeId?: number;
  isOwnEmployee: boolean;
  managedDepartments: number[];
}

// Manager scope context types
export interface ManagerScopeContextType {
  managerScope: ManagerScope | null;
  isLoading: boolean;
  isManager: boolean;
  managedDepartments: number[];
  canManageEmployees: boolean;
  canCreateAnnouncements: boolean;
  canUploadKnowledge: boolean;
  canAssignTasks: boolean;
  canViewAnalytics: boolean;
  validateDepartmentAccess: (departmentId: number) => boolean;
  validateEmployeeAccess: (employee: EmployeeWithScope) => boolean;
  validateEmployeeOwnership: (employeeId: number) => ManagerEmployeeAccessCheck;
  validateResourceAccess: (resourceType: 'announcement' | 'knowledge' | 'employee', resourceId: number) => boolean;
  getManagedDepartmentNames: () => string[];
  getManagedEmployeeIds: () => number[];
}
