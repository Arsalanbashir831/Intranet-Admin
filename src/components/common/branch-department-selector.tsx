"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { SelectableTags } from "@/components/ui/selectable-tags";
import { useBranchDepartments } from "@/hooks/queries/use-branches";
import {
  useBranchesForSelector,
  useDepartmentsForSelector,
} from "@/hooks/use-branch-department-selector";

export type BranchDepartmentSelectorProps = {
  value?: string[];
  onChange: (branchDepartmentIds: string[]) => void;
  allowMultiple?: boolean;
  disabled?: boolean;
  branchLabel?: string;
  departmentLabel?: string;
  branchPlaceholder?: string;
  departmentPlaceholder?: string;
  className?: string;
  managedDepartments?: number[];
  initialBranchDepartmentIds?: string[];
};

/**
 * Reusable component for selecting branch departments through a two-step process:
 * 1. Select branch(es)
 * 2. Select department(s) from the selected branch(es)
 */
export function BranchDepartmentSelector({
  value = [],
  onChange,
  allowMultiple = false,
  disabled = false,
  branchLabel = "Branch:",
  departmentLabel = "Department:",
  branchPlaceholder = "Select branch(es)...",
  departmentPlaceholder = "Select department(s)...",
  className,
  managedDepartments,
  initialBranchDepartmentIds,
}: BranchDepartmentSelectorProps) {
  // Fetch all branch departments data
  const { data: branchDepartmentsData } = useBranchDepartments(
    undefined,
    { pageSize: 1000 }
  );

  // Get branches data using custom hook
  const branchesResult = useBranchesForSelector();
  const availableBranches = branchesResult.data || [];

  // Create mapping from branch_department_id to {branchId, departmentId}
  const branchDepartmentIdToCombination = React.useMemo(() => {
    const map = new Map<string, { branchId: number; departmentId: number }>();
    if (!branchDepartmentsData?.branch_departments?.results) return map;

    for (const bd of branchDepartmentsData.branch_departments.results) {
      // Apply manager scope filtering if provided
      if (managedDepartments && !managedDepartments.includes(bd.id)) {
        continue;
      }

      if (bd.branch?.id && bd.department?.id) {
        map.set(String(bd.id), {
          branchId: bd.branch.id,
          departmentId: bd.department.id,
        });
      }
    }
    return map;
  }, [branchDepartmentsData, managedDepartments]);

  // Create reverse mapping from {branchId, departmentId} to branch_department_id
  const combinationToBranchDepartmentId = React.useMemo(() => {
    const map = new Map<string, string>();
    if (!branchDepartmentsData?.branch_departments?.results) return map;

    for (const bd of branchDepartmentsData.branch_departments.results) {
      // Apply manager scope filtering if provided
      if (managedDepartments && !managedDepartments.includes(bd.id)) {
        continue;
      }

      if (bd.branch?.id && bd.department?.id) {
        const key = `${bd.branch.id}-${bd.department.id}`;
        map.set(key, String(bd.id));
      }
    }
    return map;
  }, [branchDepartmentsData, managedDepartments]);

  // Initialize selected branches and departments from value (branch_department_ids)
  const [selectedBranchIds, setSelectedBranchIds] = React.useState<string[]>(() => {
    if (!value.length && !initialBranchDepartmentIds?.length) return [];
    
    const idsToUse = value.length ? value : initialBranchDepartmentIds || [];
    const branchIds = new Set<string>();
    
    for (const bdId of idsToUse) {
      const combo = branchDepartmentIdToCombination.get(bdId);
      if (combo) {
        branchIds.add(String(combo.branchId));
      }
    }
    
    return Array.from(branchIds);
  });

  const [selectedDepartmentIds, setSelectedDepartmentIds] = React.useState<string[]>(() => {
    if (!value.length && !initialBranchDepartmentIds?.length) return [];
    
    const idsToUse = value.length ? value : initialBranchDepartmentIds || [];
    const deptIds = new Set<string>();
    
    for (const bdId of idsToUse) {
      const combo = branchDepartmentIdToCombination.get(bdId);
      if (combo) {
        deptIds.add(String(combo.departmentId));
      }
    }
    
    return Array.from(deptIds);
  });

  // Update state when value prop changes (for controlled component)
  // This should only run when value/initialBranchDepartmentIds change from outside, not when internal state changes
  // Track the last value we emitted to avoid resetting state when the parent 
  // passes back the exact same value we just calculated (which might be lossy/partial)
  const lastEmittedValueRef = React.useRef<string[]>(
    value.length ? value : initialBranchDepartmentIds || []
  );

  // Helper to compare arrays as sets
  const areArraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    for (const item of b) {
      if (!setA.has(item)) return false;
    }
    return true;
  };

  // Update state when value prop changes (for controlled component)
  // This should only run when value/initialBranchDepartmentIds change from outside, not when internal state changes
  React.useEffect(() => {
    // Skip if value is empty and we don't have initial values
    if (value.length === 0 && !initialBranchDepartmentIds?.length) {
      // If we have local state but prop is cleared, we should clear local state
      // unless it matches what we just emitted (which implies we are the ones who cleared it)
      if (
        (selectedBranchIds.length > 0 || selectedDepartmentIds.length > 0) &&
        !areArraysEqual([], lastEmittedValueRef.current)
      ) {
        setSelectedBranchIds([]);
        setSelectedDepartmentIds([]);
      }
      return;
    }

    const idsToUse = value.length ? value : initialBranchDepartmentIds || [];
    
    // critical fix: If the incoming value matches what we just emitted, 
    // do NOT overwrite internal state. The computed value (idsToUse) 
    // might be a subset of implied state (e.g. selected branches with no valid departments yet)
    // and overwriting would confuse the user by deselecting independent selections.
    if (areArraysEqual(idsToUse, lastEmittedValueRef.current)) {
      return;
    }

    // Sync ref
    lastEmittedValueRef.current = idsToUse;

    const branchIds = new Set<string>();
    const deptIds = new Set<string>();

    for (const bdId of idsToUse) {
      const combo = branchDepartmentIdToCombination.get(bdId);
      if (combo) {
        branchIds.add(String(combo.branchId));
        deptIds.add(String(combo.departmentId));
      }
    }

    setSelectedBranchIds(Array.from(branchIds));
    setSelectedDepartmentIds(Array.from(deptIds));
  }, [value, initialBranchDepartmentIds, branchDepartmentIdToCombination]);

  // Filter branches based on manager scope
  const filteredBranches = React.useMemo(() => {
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
  }, [availableBranches, managedDepartments, branchDepartmentsData]);

  // Get available departments filtered by selected branches using custom hook
  // Note: This hook is called unconditionally at the top level
  const { data: availableDepartments, isLoading: isLoadingDepartments } = useDepartmentsForSelector(
    selectedBranchIds,
    managedDepartments
  );

  // Handle branch selection change
  const handleBranchChange = React.useCallback(
    (newBranchIds: string[]) => {
      if (!allowMultiple && newBranchIds.length > 1) {
        // Keep only the last selected branch
        const lastSelected = newBranchIds[newBranchIds.length - 1];
        setSelectedBranchIds([lastSelected]);
      } else {
        setSelectedBranchIds(newBranchIds);
      }

      // Clear departments if no branches selected, or filter departments
      if (newBranchIds.length === 0) {
        setSelectedDepartmentIds([]);
        lastEmittedValueRef.current = [];

        onChange([]);
      } else {
        // Recompute branch_department_ids with current departments
        const newBranchIdSet = new Set(
          allowMultiple && newBranchIds.length > 1
            ? newBranchIds
            : [newBranchIds[newBranchIds.length - 1]]
        );
        const validDeptIds = selectedDepartmentIds.filter((deptId) => {
          // Check if this department exists in any of the selected branches
          if (!branchDepartmentsData?.branch_departments?.results) return false;
          for (const bd of branchDepartmentsData.branch_departments.results) {
            if (managedDepartments && !managedDepartments.includes(bd.id)) {
              continue;
            }
            if (
              bd.department?.id === Number(deptId) &&
              bd.branch?.id &&
              newBranchIdSet.has(String(bd.branch.id))
            ) {
              return true;
            }
          }
          return false;
        });

        setSelectedDepartmentIds(validDeptIds);
        // Compute branch_department_ids
        const branchDeptIds: string[] = [];
        for (const branchId of Array.from(newBranchIdSet)) {
          for (const deptId of validDeptIds) {
            const key = `${branchId}-${deptId}`;
            const bdId = combinationToBranchDepartmentId.get(key);
            if (bdId) {
              branchDeptIds.push(bdId);
            }
          }
        }
        lastEmittedValueRef.current = branchDeptIds;

        onChange(branchDeptIds);
      }
    },
    [
      allowMultiple,
      selectedDepartmentIds,
      branchDepartmentsData,
      managedDepartments,
      combinationToBranchDepartmentId,
      onChange,
    ]
  );

  // Handle department selection change
  const handleDepartmentChange = React.useCallback(
    (newDepartmentIds: string[]) => {
      if (!allowMultiple && newDepartmentIds.length > 1) {
        // Keep only the last selected department
        const lastSelected = newDepartmentIds[newDepartmentIds.length - 1];
        setSelectedDepartmentIds([lastSelected]);
      } else {
        setSelectedDepartmentIds(newDepartmentIds);
      }

      // Compute branch_department_ids from selected branches and departments
      if (selectedBranchIds.length === 0 || newDepartmentIds.length === 0) {
        lastEmittedValueRef.current = [];

        onChange([]);
        return;
      }

      const branchDeptIds: string[] = [];
      const deptIdSet = new Set(
        allowMultiple && newDepartmentIds.length > 1
          ? newDepartmentIds
          : [newDepartmentIds[newDepartmentIds.length - 1]]
      );

      for (const branchId of selectedBranchIds) {
        for (const deptId of Array.from(deptIdSet)) {
          const key = `${branchId}-${deptId}`;
          const bdId = combinationToBranchDepartmentId.get(key);
          if (bdId) {
            branchDeptIds.push(bdId);
          }
        }
      }

      lastEmittedValueRef.current = branchDeptIds;
      onChange(branchDeptIds);
    },
    [allowMultiple, selectedBranchIds, combinationToBranchDepartmentId, onChange]
  );

  // Create adapter functions for SelectableTags
  // These return the data from hooks/data already fetched at the top level
  // SelectableTags calls these as functions, so they need to access current closure values
  const useAllBranchesAdapter = React.useCallback(() => {
    return {
      data: filteredBranches || [],
      isLoading: false,
    };
  }, [filteredBranches]);

  // For search, we'll use client-side filtering on the already-fetched data
  // This avoids calling hooks conditionally
  const useSearchBranchesAdapter = React.useCallback(
    (query: string) => {
      const trimmed = query.trim().toLowerCase();
      const branches = filteredBranches || [];
      if (!trimmed) {
        return {
          data: branches,
          isLoading: false,
        };
      }
      const filtered = branches.filter((branch) =>
        branch.label.toLowerCase().includes(trimmed)
      );
      return {
        data: filtered,
        isLoading: false,
      };
    },
    [filteredBranches]
  );

  const useAllDepartmentsAdapter = React.useCallback(() => {
    return {
      data: availableDepartments || [],
      isLoading: isLoadingDepartments,
    };
  }, [availableDepartments, isLoadingDepartments]);

  // For department search, use client-side filtering
  const useSearchDepartmentsAdapter = React.useCallback(
    (query: string) => {
      const trimmed = query.trim().toLowerCase();
      const departments = availableDepartments || [];
      if (!trimmed) {
        return {
          data: departments,
          isLoading: isLoadingDepartments,
        };
      }
      const filtered = departments.filter((dept) =>
        dept.label.toLowerCase().includes(trimmed)
      );
      return {
        data: filtered,
        isLoading: false,
      };
    },
    [availableDepartments, isLoadingDepartments]
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-12 items-center gap-4 mb-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
          {branchLabel}
        </Label>
        <div className="col-span-12 md:col-span-10">
          <SelectableTags
            items={[]}
            selectedItems={selectedBranchIds}
            onSelectionChange={handleBranchChange}
            placeholder={branchPlaceholder}
            searchPlaceholder="Search branches..."
            emptyMessage="No branches found."
            disabled={disabled}
            useAllItems={useAllBranchesAdapter}
            useSearch={useSearchBranchesAdapter}
            searchDebounce={300}
          />
          {!allowMultiple && (
            <p className="mt-1 text-xs text-muted-foreground">
              Select one branch to continue.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
          {departmentLabel}
        </Label>
        <div className="col-span-12 md:col-span-10">
          <SelectableTags
            items={[]}
            selectedItems={selectedDepartmentIds}
            onSelectionChange={handleDepartmentChange}
            placeholder={
              selectedBranchIds.length === 0
                ? "Select a branch first"
                : departmentPlaceholder
            }
            searchPlaceholder="Search departments..."
            emptyMessage={
              selectedBranchIds.length === 0
                ? "Select a branch first"
                : "No departments found for selected branch(es)."
            }
            disabled={disabled || selectedBranchIds.length === 0}
            useAllItems={useAllDepartmentsAdapter}
            useSearch={useSearchDepartmentsAdapter}
            searchDebounce={300}
          />
          {selectedBranchIds.length > 0 && !allowMultiple && (
            <p className="mt-1 text-xs text-muted-foreground">
              Select one department from the selected branch.
            </p>
          )}
          {selectedBranchIds.length > 0 && allowMultiple && (
            <p className="mt-1 text-xs text-muted-foreground">
              Select one or more departments from the selected branch(es).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

