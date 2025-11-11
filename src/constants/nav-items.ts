import { ROUTES } from "./routes";

type NavItem = {
    label: string;
    href: string;
    iconSrc: string;
    description: string;
};

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, iconSrc: "/icons/pie-chart.svg", description: "Overview and analytics" },
    { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB, iconSrc: "/icons/building.svg", description: "Company information and settings" },
    { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE, iconSrc: "/icons/note-blank.svg", description: "Documents and resources" },
    { label: "Polls", href: ROUTES.ADMIN.POLLS, iconSrc: "/icons/pie-chart.svg", description: "Manage polls and surveys" },
    { label: "Training Checklists", href: ROUTES.ADMIN.NEW_HIRE_PLAN, iconSrc: "/icons/clipboard-text.svg", description: "Employee onboarding plans" },
    { label: "Departments", href: ROUTES.ADMIN.DEPARTMENTS, iconSrc: "/icons/user-hierarchy.svg", description: "Department management" },
    { label: "Branches", href: ROUTES.ADMIN.BRANCHES, iconSrc: "/icons/branch.svg", description: "Branch management" },
    { label: "Roles", href: ROUTES.ADMIN.ROLES, iconSrc: "/icons/user-hierarchy.svg", description: "Role management" },
    { label: "Employees", href: ROUTES.ADMIN.ORG_CHART, iconSrc: "/icons/users.svg", description: "Organization structure" },
    // { label: "Executive Members", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS, iconSrc: "/icons/users.svg", description: "Executive team management" },
];