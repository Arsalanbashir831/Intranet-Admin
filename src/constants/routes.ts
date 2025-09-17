export const ROUTES = {
  // Auth
  AUTH_LOGIN: "/login",
    ADMIN:{
        DASHBOARD: "/dashboard",

        // Admin sections
        COMPANY_HUB: "/dashboard/company-hub",
        COMPANY_HUB_NEW: "/dashboard/company-hub/new",
        KNOWLEDGE_BASE: "/dashboard/knowledge-base",
        NEW_HIRE_PLAN: "/dashboard/new-hire-plan",
        DEPARTMENTS: "/dashboard/departments",
        ORG_CHART: "/dashboard/org-chart",
        ORG_CHART_NEW: "/dashboard/org-chart/new",
        ORG_CHART_PROFILE_ID: (id: string) => `/dashboard/org-chart/${id}`,
        ORG_CHART_PROFILE_ID_EDIT: (id: string) => `/dashboard/org-chart/${id}/edit`,
    }
  
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];


