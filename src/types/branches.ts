/**
 * Type definitions for Branches domain
 * Core entity types for branches and branch departments
 */

export type Branch = {
  id: number;
  branch_name: string;
  employee_count: number;
  departments: Array<{
    id: number;
    dept_name: string;
    branch_department_id: number;
    employee_count: number;
    manager: null | {
      id: number;
      employee: {
        id: number;
        emp_name: string;
        profile_picture?: string | null;
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
    };
  }>;
};

export type BranchDepartment = {
  id: number;
  branch: {
    id: number;
    branch_name: string;
  };
  employee_count: number;
  manager: null | {
    id: number;
    employee: {
      id: number;
      emp_name: string;
      profile_picture?: string | null;
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
  };
};

export type BranchDepartmentListItem = {
  id: number;
  branch: {
    id: number;
    branch_name: string;
  };
  department: {
    id: number;
    dept_name: string;
  };
  employee_count: number;
  manager: null | {
    id: number;
    employee: {
      id: number;
      emp_name: string;
      profile_picture?: string | null;
      email: string;
      role: string;
      role_id: number;
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
  };
};

export type BranchListResponse = {
  branches: {
    count: number;
    page: number;
    page_size: number;
    results: Branch[];
  };
};

export type BranchCreateRequest = {
  branch_name: string;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type BranchUpdateRequest = {
  branch_name?: string;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type BranchRow = {
  id: string;
  branch_name: string;
  employee_count: number;
  departments: string;
};

export type BranchDepartmentRow = {
  id: string;
  department: string;
  employee_count: number;
  branch_department_id: string;
};

export interface EditBranchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  branch: Branch | null;
}

export interface NewBranchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface BranchDepartmentsTableProps {
  branchId: string;
  branchName: string;
}