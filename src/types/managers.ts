/**
 * Type definitions for Managers domain
 * Core entity types for managers
 */

export type Manager = {
  id: number;
  employee_id: number;
  branch_department_id: number;
  employee: {
    id: number;
    full_name: string;
    profile_picture?: string;
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

export type ManagerListResponse = {
  managers: {
    count: number;
    page: number;
    page_size: number;
    results: Manager[];
  };
};

export type ManagerCreateRequest = {
  employee_id: number;
  branch_department_id: number;
};

export type ManagerUpdateRequest = Partial<ManagerCreateRequest>;
