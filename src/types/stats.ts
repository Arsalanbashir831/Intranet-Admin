export type StatsTotals = {
  employees: number;
  departments: number;
  branches: number;
  branchdepartments: number;
  managers: number;
};

export type EmployeeCountByDepartment = {
  department_id: number;
  dept_name: string;
  employee_count: number;
};

export type EmployeeCountByBranch = {
  branch_id: number;
  branch_name: string;
  employee_count: number;
};

export type EmployeeCountByBranchDepartment = {
  branchdepartment_id: number;
  branch: {
    id: number;
    branch_name: string;
  };
  department: {
    id: number;
    dept_name: string;
  };
  employee_count: number;
};

export type ManagerCountByDepartment = {
  department_id: number;
  dept_name: string;
  manager_count: number;
};

export type StatsResponse = {
  totals: StatsTotals;
  employees_per_department: EmployeeCountByDepartment[];
  employees_per_branch: EmployeeCountByBranch[];
  employees_per_branchdepartment: EmployeeCountByBranchDepartment[];
  managers_per_department: ManagerCountByDepartment[];
  recent_hires_last_30_days: number;
};

export type KnowledgeBaseStatsTotals = {
  announcements: number;
  type_policies: number;
  type_announcement: number;
  active_announcements: number;
  inactive_announcements: number;
  attachments: number;
  folders: number;
  files: number;
};

export type AnnouncementByType = {
  type: string;
  count: number;
};

export type TopEmployeeByAnnouncements = {
  employee_id: number;
  emp_name: string;
  announcement_count: number;
};

export type KnowledgeBaseStatsResponse = {
  totals: KnowledgeBaseStatsTotals;
  announcements_by_type: AnnouncementByType[];
  recent_announcements_last_30_days: number;
  top_employees_by_announcements: TopEmployeeByAnnouncements[];
};

export type AnnouncementRateResponse = {
  results: Array<{
    period: string;
    count: number;
  }>;
  filter: string;
  start_date: string;
  end_date: string;
};
