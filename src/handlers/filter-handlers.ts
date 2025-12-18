
export interface SelectOption {
  id: string | number;
  name: string;
}

export function normalizeDepartments(data: any): SelectOption[] {
  if (!data) return [];
  const list = Array.isArray(data) ? data : [];
  return (list as { id: number; dept_name: string }[]).map((dept) => ({
    id: dept.id,
    name: dept.dept_name,
  }));
}

export function normalizeBranches(data: any): SelectOption[] {
  if (!data) return [];
  const list = Array.isArray(data)
    ? data
    : (data as { branches?: { results?: unknown[] } })?.branches?.results || [];
  return (list as { id: number; branch_name: string }[]).map((branch) => ({
    id: branch.id,
    name: branch.branch_name,
  }));
}

export function normalizeBranchDepartments(data: any): SelectOption[] {
  if (!data) return [];
  return (
    data as {
      id: number;
      branch: { branch_name: string };
      department: { dept_name: string | unknown };
    }[]
  ).map((bd) => ({
    id: bd.id,
    name: `${
      typeof bd.department?.dept_name === "string"
        ? bd.department.dept_name
        : "Unknown Department"
    } - ${bd.branch?.branch_name || "Unknown Branch"}`,
  }));
}

export function normalizeRoles(data: any): SelectOption[] {
  if (!data) return [];
  const list = (data as { roles?: { results?: unknown[] } })?.roles?.results || [];
  return (list as { id: number; name: string }[]).map((role) => ({
    id: role.id,
    name: role.name,
  }));
}
