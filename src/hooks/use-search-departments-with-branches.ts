import * as React from "react";
import { useBranchDepartments } from "@/hooks/queries/use-branches";
import { useSearchDepartments } from "@/hooks/queries/use-departments";
import { createCustomSelectableItems } from "@/components/ui/selectable-tags";

/**
 * Custom hook for searching departments with optional branch filtering
 * This hook is designed to be passed to SelectableTags component
 * 
 * @param query - Search query string
 * @param shouldFilterByBranches - Whether to filter by selected branches
 * @param permittedBranches - Array of selected branch IDs
 * @returns Object with data and isLoading state
 */
export function useSearchDepartmentsWithBranches(
  query: string,
  shouldFilterByBranches: boolean,
  permittedBranches?: string[]
) {
  // Always call both hooks unconditionally to follow Rules of Hooks
  // When branches are selected, use branch departments API with branch and search filters
  const branchDeptResult = useBranchDepartments(
    shouldFilterByBranches && permittedBranches
      ? { 
          branch: permittedBranches.join(","),
          ...(query.trim() ? { search: query.trim() } : {})
        }
      : undefined,
    { pageSize: 1000 }
  );
  
  // When no branches selected, use regular departments search
  const deptSearchResult = useSearchDepartments(
    !shouldFilterByBranches ? query : "",
    { page: 1, pageSize: 50 }
  );
  
  // Use the appropriate result based on whether branches are selected
  const activeResult = shouldFilterByBranches ? branchDeptResult : deptSearchResult;
  
  const selectableItems = React.useMemo(() => {
    if (shouldFilterByBranches && permittedBranches) {
      // Get unique departments from branch departments results
      const branchDeptData = activeResult.data as { branch_departments?: { results?: unknown[] } } | undefined;
      const results = branchDeptData?.branch_departments?.results;
      if (!results || !Array.isArray(results)) return [];
      
      // Convert permitted branches to numbers for comparison
      const selectedBranchIds = new Set(permittedBranches.map(b => Number(b)));
      
      const uniqueDepartments = new Map<number, { id: number; dept_name: string }>();
      
      (results as Array<{ 
        branch?: { id: number };
        department?: { id: number; dept_name: string } 
      }>).forEach((bd) => {
        // Only include if the branch matches one of the selected branches
        if (bd.branch?.id && selectedBranchIds.has(bd.branch.id) && bd.department?.id && bd.department?.dept_name) {
          if (!uniqueDepartments.has(bd.department.id)) {
            uniqueDepartments.set(bd.department.id, {
              id: bd.department.id,
              dept_name: bd.department.dept_name,
            });
          }
        }
      });
      
      return Array.from(uniqueDepartments.values()).map(dept => ({
        id: String(dept.id),
        label: dept.dept_name,
      }));
    } else {
      // Handle departments search results
      if (!activeResult.data) return [];
      
      if (
        typeof activeResult.data === "object" &&
        activeResult.data !== null &&
        "departments" in activeResult.data
      ) {
        const departmentsData = activeResult.data as {
          departments?: {
            results?: Array<{ id: unknown; dept_name: unknown }>;
          };
        };
        const rawData = departmentsData.departments?.results || [];
        return createCustomSelectableItems(rawData, "id", "dept_name");
      }
      if (
        typeof activeResult.data === "object" &&
        activeResult.data !== null &&
        "results" in activeResult.data
      ) {
        const rawData = (activeResult.data as { results: Array<{ id: unknown; dept_name: unknown }> }).results;
        return createCustomSelectableItems(rawData, "id", "dept_name");
      }
    }
    return [];
  }, [activeResult.data, shouldFilterByBranches, permittedBranches]);
  
  return { 
    data: selectableItems, 
    isLoading: activeResult.isLoading 
  };
}

