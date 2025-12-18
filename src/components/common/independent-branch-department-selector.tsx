"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { SelectableTags } from "@/components/ui/selectable-tags";
import { useBranchDepartments } from "@/hooks/queries/use-branches";
import {
  useBranchesForSelector,
  useDepartmentsForSelector,
} from "@/hooks/use-branch-department-selector";
import { useDepartments } from "@/hooks/queries/use-departments";
import { createCustomSelectableItems } from "@/components/ui/selectable-tags";

import {
  getFilteredBranches,
  getFilteredDepartments,
} from "@/handlers/common-handlers";
import { IndependentBranchDepartmentSelectorProps } from "@/types/common";

/**
 * Component for independent branch and department selection.
 * Both selectors are always enabled.
 * Departments are filtered by selected branches when branches are selected.
 * If no branches selected, all departments are shown.
 */
export function IndependentBranchDepartmentSelector({
  selectedBranches,
  selectedDepartments,
  onBranchesChange,
  onDepartmentsChange,
  allowMultiple = true,
  disabled = false,
  branchLabel = "Branch Access:",
  departmentLabel = "Department Access:",
  branchPlaceholder = "Select branches (empty = public access)",
  departmentPlaceholder = "Select departments (empty = public access)",
  className,
  managedDepartments,
}: IndependentBranchDepartmentSelectorProps) {
  // Fetch all branch departments data for filtering
  const { data: branchDepartmentsData } = useBranchDepartments(undefined, {
    pageSize: 1000,
  });

  // Get branches data
  const { data: availableBranches } = useBranchesForSelector();

  // Filter branches based on manager scope
  const filteredBranches = React.useMemo(() => {
    return getFilteredBranches(
      availableBranches,
      managedDepartments,
      branchDepartmentsData
    );
  }, [availableBranches, managedDepartments, branchDepartmentsData]);

  // Get departments - filtered by selected branches if branches are selected, otherwise all departments
  const shouldFilterByBranches = selectedBranches.length > 0;

  // When branches are selected, use branch departments to filter
  const { data: filteredDepartments } = useDepartmentsForSelector(
    shouldFilterByBranches ? selectedBranches : [],
    managedDepartments
  );

  // When no branches selected, use all departments
  const { data: allDepartmentsData } = useDepartments();
  const allDepartments = React.useMemo(() => {
    if (!allDepartmentsData) return [];
    const list = Array.isArray(allDepartmentsData)
      ? allDepartmentsData
      : (
          allDepartmentsData as
            | { departments?: { results?: unknown[] } }
            | undefined
        )?.departments?.results || [];
    return createCustomSelectableItems(
      list as Array<{ id: unknown; dept_name: unknown }>,
      "id",
      "dept_name"
    );
  }, [allDepartmentsData]);

  // Apply manager scope filtering to all departments
  const filteredAllDepartments = React.useMemo(() => {
    return getFilteredDepartments(
      allDepartments,
      managedDepartments,
      branchDepartmentsData
    );
  }, [allDepartments, managedDepartments, branchDepartmentsData]);

  // Determine which departments to show
  const availableDepartments = shouldFilterByBranches
    ? filteredDepartments
    : filteredAllDepartments;

  // Create adapter functions for branches
  const useAllBranchesAdapter = React.useCallback(() => {
    return {
      data: filteredBranches || [],
      isLoading: false,
    };
  }, [filteredBranches]);

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

  // Create adapter functions for departments
  const useAllDepartmentsAdapter = React.useCallback(() => {
    return {
      data: availableDepartments || [],
      isLoading: false,
    };
  }, [availableDepartments]);

  const useSearchDepartmentsAdapter = React.useCallback(
    (query: string) => {
      const trimmed = query.trim().toLowerCase();
      const departments = availableDepartments || [];
      if (!trimmed) {
        return {
          data: departments,
          isLoading: false,
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
    [availableDepartments]
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
            selectedItems={selectedBranches}
            onSelectionChange={onBranchesChange}
            placeholder={branchPlaceholder}
            searchPlaceholder="Search branches..."
            emptyMessage="No branches found."
            disabled={disabled}
            useAllItems={useAllBranchesAdapter}
            useSearch={useSearchBranchesAdapter}
            searchDebounce={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
          {departmentLabel}
        </Label>
        <div className="col-span-12 md:col-span-10">
          <SelectableTags
            items={[]}
            selectedItems={selectedDepartments}
            onSelectionChange={onDepartmentsChange}
            placeholder={
              shouldFilterByBranches
                ? "Select departments from selected branches (empty = public access)"
                : departmentPlaceholder
            }
            searchPlaceholder="Search departments..."
            emptyMessage={
              shouldFilterByBranches
                ? "No departments found in selected branches."
                : "No departments found."
            }
            disabled={disabled}
            useAllItems={useAllDepartmentsAdapter}
            useSearch={useSearchDepartmentsAdapter}
            searchDebounce={300}
          />
          {shouldFilterByBranches && (
            <p className="mt-1 text-xs text-muted-foreground">
              Only departments from selected branches are shown.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
