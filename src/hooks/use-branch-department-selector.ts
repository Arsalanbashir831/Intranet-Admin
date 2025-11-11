import * as React from "react";
import { useBranchDepartments, useSearchBranchDepartments } from "@/hooks/queries/use-branches";
import { useAllBranches, useSearchBranches } from "@/hooks/queries/use-branches";
import { createCustomSelectableItems } from "@/components/ui/selectable-tags";

/**
 * Hook to get branches data for the branch selector
 */
export function useBranchesForSelector() {
  const { data: branchesData } = useAllBranches();

  const availableBranches = React.useMemo(() => {
    if (!branchesData?.branches?.results) return [];
    return createCustomSelectableItems(
      branchesData.branches.results as Array<{ id: unknown; branch_name: unknown }>,
      "id",
      "branch_name"
    );
  }, [branchesData]);

  return {
    data: availableBranches,
    isLoading: false,
  };
}

/**
 * Hook to search branches for the branch selector
 */
export function useSearchBranchesForSelector(query: string) {
  const trimmed = (query ?? "").trim();
  const result = useSearchBranches(trimmed, { pageSize: 1000 });

  const branchItems = React.useMemo(() => {
    if (!result.data?.branches?.results) return [];
    return createCustomSelectableItems(
      result.data.branches.results as Array<{ id: unknown; branch_name: unknown }>,
      "id",
      "branch_name"
    );
  }, [result.data]);

  return {
    data: branchItems,
    isLoading: result.isLoading,
  };
}

/**
 * Hook to get departments filtered by selected branches
 */
export function useDepartmentsForSelector(
  selectedBranchIds: string[],
  managedDepartments?: number[]
) {
  const { data: branchDepartmentsData, isLoading } = useBranchDepartments(
    undefined,
    { pageSize: 1000 }
  );

  const availableDepartments = React.useMemo(() => {
    if (!branchDepartmentsData?.branch_departments?.results) return [];
    if (selectedBranchIds.length === 0) return [];

    const selectedBranchIdSet = new Set(selectedBranchIds.map(Number));
    const departmentMap = new Map<number, { id: number; dept_name: string }>();

    for (const bd of branchDepartmentsData.branch_departments.results) {
      // Apply manager scope filtering
      if (managedDepartments && !managedDepartments.includes(bd.id)) {
        continue;
      }

      // Only include departments from selected branches
      if (
        bd.branch?.id &&
        selectedBranchIdSet.has(bd.branch.id) &&
        bd.department?.id &&
        bd.department?.dept_name
      ) {
        // Use department ID as key to avoid duplicates
        if (!departmentMap.has(bd.department.id)) {
          departmentMap.set(bd.department.id, {
            id: bd.department.id,
            dept_name: bd.department.dept_name,
          });
        }
      }
    }

    return Array.from(departmentMap.values()).map((dept) => ({
      id: String(dept.id),
      label: dept.dept_name,
    }));
  }, [branchDepartmentsData, selectedBranchIds, managedDepartments]);

  return {
    data: availableDepartments,
    isLoading,
  };
}

/**
 * Hook to search departments filtered by selected branches
 */
export function useSearchDepartmentsForSelector(
  query: string,
  selectedBranchIds: string[],
  managedDepartments?: number[]
) {
  const trimmed = (query ?? "").trim();
  const result = useSearchBranchDepartments(trimmed, { pageSize: 1000 });

  const deptItems = React.useMemo(() => {
    if (!result.data?.branch_departments?.results) return [];

    const selectedBranchIdSet = new Set(selectedBranchIds.map(Number));
    const departmentMap = new Map<number, { id: number; dept_name: string }>();

    for (const bd of result.data.branch_departments.results) {
      // Apply manager scope filtering
      if (managedDepartments && !managedDepartments.includes(bd.id)) {
        continue;
      }

      // Only include departments from selected branches
      if (
        bd.branch?.id &&
        selectedBranchIdSet.has(bd.branch.id) &&
        bd.department?.id &&
        bd.department?.dept_name
      ) {
        if (!departmentMap.has(bd.department.id)) {
          departmentMap.set(bd.department.id, {
            id: bd.department.id,
            dept_name: bd.department.dept_name,
          });
        }
      }
    }

    return Array.from(departmentMap.values()).map((dept) => ({
      id: String(dept.id),
      label: dept.dept_name,
    }));
  }, [result.data, selectedBranchIds, managedDepartments]);

  return {
    data: deptItems,
    isLoading: result.isLoading,
  };
}

