export const API_ROUTES = {
    AUTH: {
        LOGIN: "/auth/login/",
        LOGOUT: "/auth/logout/",
        REFRESH_TOKEN: "/auth/token/refresh/",
    },
    EMPLOYEES: {
        LIST: "/employees/",
        DETAIL: (id: number | string) => `/employees/${id}/`,
        CREATE: "/employees/",
        UPDATE: (id: number | string) => `/employees/${id}/`,
        DELETE: (id: number | string) => `/employees/${id}/`,
    },
    DEPARTMENTS: {
        LIST: "/departments/",
        DETAIL: (id: number | string) => `/departments/${id}/`,
        CREATE: "/departments/",
        UPDATE: (id: number | string) => `/departments/${id}/`,
        DELETE: (id: number | string) => `/departments/${id}/`,
    },
        LOCATIONS: {
            LIST: "/locations/",
            DETAIL: (id: number | string) => `/locations/${id}/`,
            CREATE: "/locations/",
            UPDATE: (id: number | string) => `/locations/${id}/`,
            DELETE: (id: number | string) => `/locations/${id}/`,
        },
        BRANCHES: {
            LIST: "/branches/",
            DETAIL: (id: number | string) => `/branches/${id}/`,
            CREATE: "/branches/",
            UPDATE: (id: number | string) => `/branches/${id}/`,
            DELETE: (id: number | string) => `/branches/${id}/`,
        },
    PROFILE: {
        GET: "/user/profile/",
        UPDATE: "/user/profile/update/",
        EXTENDED: "/user/profile/extended/",
        PICTURE: "/user/profile/picture/",
        STATISTICS: "/user/statistics/",
    },
} as const;