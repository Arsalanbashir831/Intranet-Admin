
/**
 * Helper to compare arrays of strings as sets
 */
export const areArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  for (const item of b) {
    if (!setA.has(item)) return false;
  }
  return true;
};


/**
 * Filters branches based on manager scope (managedDepartments)
 */
export function getFilteredBranches<T extends { id: any }>(
  availableBranches: T[],
  managedDepartments?: number[],
  branchDepartmentsData?: any
): T[] {
  if (!availableBranches || availableBranches.length === 0) {
    return [];
  }

  if (!managedDepartments || managedDepartments.length === 0) {
    return availableBranches;
  }

  // Get unique branch IDs from managed departments
  const allowedBranchIds = new Set<number>();
  if (branchDepartmentsData?.branch_departments?.results) {
    for (const bd of branchDepartmentsData.branch_departments.results) {
      if (managedDepartments.includes(bd.id) && bd.branch?.id) {
        allowedBranchIds.add(bd.branch.id);
      }
    }
  }

  return availableBranches.filter((branch) =>
    allowedBranchIds.has(Number(branch.id))
  );
}

/**
 * Filter departments based on manager scope
 */
export function getFilteredDepartments<T extends { id: any }>(
  allDepartments: T[] | { departments?: { results?: T[] } },
  managedDepartments?: number[],
  branchDepartmentsData?: any
): T[] {
  if (!allDepartments) return [];
  
  // Normalize checking
  const list = Array.isArray(allDepartments)
    ? allDepartments
    : (allDepartments as { departments?: { results?: T[] } })?.departments?.results || [];

  if (!managedDepartments || managedDepartments.length === 0) {
    return list;
  }

  // Get unique department IDs from managed departments
  const allowedDeptIds = new Set<number>();
  if (branchDepartmentsData?.branch_departments?.results) {
    for (const bd of branchDepartmentsData.branch_departments.results) {
      if (managedDepartments.includes(bd.id) && bd.department?.id) {
        allowedDeptIds.add(bd.department.id);
      }
    }
  }

  return list.filter((dept) => allowedDeptIds.has(Number(dept.id)));
}

/**
 * Create Maps for BranchDepartment ID lookup
 * Returns [idToCombo, comboToId]
 */
export function mapBranchDepartmentIds(
  branchDepartmentsData: any,
  managedDepartments?: number[]
) {
  const idToCombo = new Map<string, { branchId: number; departmentId: number }>();
  const comboToId = new Map<string, string>();

  if (!branchDepartmentsData?.branch_departments?.results) {
    return { idToCombo, comboToId };
  }

  for (const bd of branchDepartmentsData.branch_departments.results) {
    // Apply manager scope filtering if provided
    if (managedDepartments && !managedDepartments.includes(bd.id)) {
      continue;
    }

    if (bd.branch?.id && bd.department?.id) {
      idToCombo.set(String(bd.id), {
        branchId: bd.branch.id,
        departmentId: bd.department.id,
      });

      const key = `${bd.branch.id}-${bd.department.id}`;
      comboToId.set(key, String(bd.id));
    }
  }

  return { idToCombo, comboToId };
}
