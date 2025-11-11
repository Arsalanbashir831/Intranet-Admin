export const ROUTES = {
  // Auth
  AUTH: {
    LOGIN: "/login",
    RESET_PASSWORD: "/reset-password",
    FORGOT_PASSWORD: "/forgot-password",
    OTP_VERIFICATION: "/otp-verification",
  },
  ADMIN: {
    DASHBOARD: "/dashboard",

    // Admin sections
    COMPANY_HUB: "/dashboard/company-hub",
    COMPANY_HUB_NEW: "/dashboard/company-hub/new",
    COMPANY_HUB_EDIT_ID: (id: string) => `/dashboard/company-hub/${id}`,
    KNOWLEDGE_BASE: "/dashboard/knowledge-base",
    KNOWLEDGE_BASE_FOLDER_ID: (id: string) => `/dashboard/knowledge-base/${id}`,
    NEW_HIRE_PLAN: "/dashboard/training-checklists",
    ADD_NEW_HIRE_PLAN: "/dashboard/training-checklists/new",
    NEW_HIRE_PLAN_DETAIL_ID: (id: string) =>
      `/dashboard/training-checklists/${id}`,
    NEW_HIRE_PLAN_EDIT_ID: (id: string) =>
      `/dashboard/training-checklists/${id}/edit`,
    DEPARTMENTS: "/dashboard/departments",
    DEPARTMENTS_ID: (id: string) => `/dashboard/departments/${id}`,
    BRANCHES: "/dashboard/branches",
    BRANCHES_NEW: "/dashboard/branches/new",
    BRANCHES_ID: (id: string) => `/dashboard/branches/${id}`,
    BRANCHES_ID_EDIT: (id: string) => `/dashboard/branches/${id}/edit`,
    BRANCHES_ID_DEPARTMENTS_DEPT_ID: (id: string, deptId: string) =>
      `/dashboard/branches/${id}/departments/${deptId}`,
    ORG_CHART: "/dashboard/employees",
    ORG_CHART_NEW: "/dashboard/employees/new",
    ORG_CHART_PROFILE_ID: (id: string) => `/dashboard/employees/${id}`,
    ORG_CHART_PROFILE_ID_EDIT: (id: string) =>
      `/dashboard/employees/${id}/edit`,
    EXECUTIVE_MEMBERS: "/dashboard/executive-members",
    EXECUTIVE_MEMBERS_NEW: "/dashboard/executive-members/new",
    EXECUTIVE_MEMBERS_ID: (id: string) => `/dashboard/executive-members/${id}`,
    EXECUTIVE_MEMBERS_ID_EDIT: (id: string) =>
      `/dashboard/executive-members/${id}/edit`,
    ROLES: "/dashboard/roles",
    POLLS: "/dashboard/polls",
    POLLS_NEW: "/dashboard/polls/new",
    POLLS_ID: (id: string) => `/dashboard/polls/${id}`,
    PROFILE: "/dashboard/profile",
  },
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
