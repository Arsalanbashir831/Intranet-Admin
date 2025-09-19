export const ROUTES = {
  // Auth
  AUTH_LOGIN: "/login",
    ADMIN:{
        DASHBOARD: "/dashboard",

        // Admin sections
        COMPANY_HUB: "/dashboard/company-hub",
        COMPANY_HUB_NEW: "/dashboard/company-hub/new",
        COMPANY_HUB_EDIT_ID: (id: string) => `/dashboard/company-hub/${id}`,
        KNOWLEDGE_BASE: "/dashboard/knowledge-base",
        KNOWLEDGE_BASE_FOLDER_ID: (id: string) => `/dashboard/knowledge-base/${id}`,
        NEW_HIRE_PLAN: "/dashboard/new-hire-plan",
        ADD_NEW_HIRE_PLAN: "/dashboard/new-hire-plan/new",
        DEPARTMENTS: "/dashboard/departments",
        DEPARTMENTS_ID: (id: string) => `/dashboard/departments/${id}`,
        ORG_CHART: "/dashboard/org-chart",
        ORG_CHART_NEW: "/dashboard/org-chart/new",
        ORG_CHART_PROFILE_ID: (id: string) => `/dashboard/org-chart/${id}`,
        ORG_CHART_PROFILE_ID_EDIT: (id: string) => `/dashboard/org-chart/${id}/edit`,
    }
  
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];


