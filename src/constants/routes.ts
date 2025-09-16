export const ROUTES = {
  // Auth
  AUTH_LOGIN: "/login",
    ADMIN:{
        DASHBOARD: "/admin",

        // Admin sections
        COMPANY_HUB: "/admin/company-hub",
        KNOWLEDGE_BASE: "/admin/knowledge-base",
        NEW_HIRE_PLAN: "/admin/new-hire-plan",
        DEPARTMENTS: "/admin/departments",
        ORG_CHART: "/admin/org-chart",
    }
  
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];


