import { Role, RoleRow, AccessLevel } from "@/types/roles";

export const getAccessLevelBadgeColor = (accessLevel: AccessLevel): string => {
  const badgeColors = {
    employee: "bg-gray-100 text-gray-800",
    manager: "bg-green-100 text-green-800",
    executive: "bg-blue-100 text-blue-800",
  };
  return badgeColors[accessLevel] || "bg-gray-100 text-gray-800";
};

export const getAccessLevelDisplayText = (accessLevel: AccessLevel): string => {
  const displayText = {
    employee: "Employee",
    manager: "Manager",
    executive: "Executive",
  };
  return displayText[accessLevel] || "Employee";
};

export const transformRoleToRow = (role: Role): RoleRow => ({
  id: String(role.id),
  name: role.name,
  access_level: role.access_level,
});

export const parseRoleError = (err: unknown): string => {
  let errorMessage = "Failed to perform action. Please try again.";
  
  // Extract error message from API response
  if (err instanceof Error && err.message) {
    errorMessage = err.message;
  } else {
    const error = err as { response?: { data?: Record<string, unknown>; status?: number } };
    const dataErr = error?.response?.data;
    if (dataErr && typeof dataErr === "object") {
      if ("error" in dataErr && typeof dataErr.error === "string") {
        errorMessage = dataErr.error;
      } else if ("detail" in dataErr && typeof dataErr.detail === "string") {
        errorMessage = dataErr.detail;
      } else if ("message" in dataErr && typeof dataErr.message === "string") {
        errorMessage = dataErr.message;
      }
    }
  }
  return errorMessage;
};
