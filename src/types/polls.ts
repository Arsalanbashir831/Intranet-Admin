export type PollOption = {
  id: number;
  option_text: string;
  vote_count: number;
  voters?: {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    voted_at: string;
    branch_department: {
      id: number;
      branch: {
        id: number;
        name: string;
        location: string;
      };
      department: {
        id: number;
        name: string;
      };
    };
  }[];
};

export type BranchDetail = {
  id: number;
  branch_name: string;
  location: string;
};

export type DepartmentDetail = {
  id: number;
  dept_name: string;
};

export type BranchDepartmentDetail = {
  id: number;
  branch: {
    id: number;
    branch_name: string;
    location: string;
  };
  department: {
    id: number;
    dept_name: string;
  };
};

export type EmployeeDetail = {
  id: number;
  full_name: string;
  email: string;
};

export type PollType = "public" | "private";

export type Poll = {
  id: number;
  title: string;
  subtitle: string;
  question: string;
  poll_type: PollType;
  total_votes: number;
  created_at: string;
  expires_at: string;
  created_by: number | null;
  is_active: boolean;
  inherits_parent_permissions: boolean;
  permitted_branches: number[];
  permitted_departments: number[];
  permitted_branch_departments: number[];
  permitted_employees: number[];
  options: PollOption[];
  has_voted: boolean;
  user_vote: number | null;
  created_by_details: string | null;
  effective_permissions: {
    branches: number[];
    departments: number[];
    branch_departments: number[];
    employees: number[];
  };
  permitted_branches_details: BranchDetail[];
  permitted_departments_details: DepartmentDetail[];
  permitted_branch_departments_details: BranchDepartmentDetail[];
  permitted_employees_details: EmployeeDetail[];
  is_expired: boolean;
  can_vote: boolean;
  show_results: boolean;
};

export type PollListResponse = {
  polls: {
    count: number;
    page: number;
    page_size: number;
    results: Poll[];
  };
};

export type PollCreateRequest = {
  title: string;
  subtitle: string;
  question: string;
  poll_type: PollType;
  expires_at: string;
  options: { option_text: string }[];
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_branch_departments?: number[];
};

