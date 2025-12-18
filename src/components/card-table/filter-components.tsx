"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDepartments } from "@/hooks/queries/use-departments";
import { useBranches } from "@/hooks/queries/use-branches";
import { useBranchDepartments } from "@/hooks/queries/use-departments";
import { useRoles } from "@/hooks/queries/use-roles";
import {
  DepartmentFilterProps,
  BranchFilterProps,
  BranchDepartmentFilterProps,
  RoleFilterProps,
  SearchFilterProps,
} from "@/types/card-table";
import {
  normalizeDepartments,
  normalizeBranches,
  normalizeBranchDepartments,
  normalizeRoles,
} from "@/handlers/filter-handlers";

export function DepartmentFilter({
  value,
  onValueChange,
  placeholder = "Select department",
}: DepartmentFilterProps) {
  const { data: departmentsData, isLoading } = useDepartments({
    page_size: 1000,
  });

  const departments = React.useMemo(
    () => normalizeDepartments(departmentsData),
    [departmentsData]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="department">Department</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="department" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              Loading...
            </SelectItem>
          ) : (
            <>
              <SelectItem value="__all__">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BranchFilter({
  value,
  onValueChange,
  placeholder = "Select branch",
}: BranchFilterProps) {
  const { data: branchesData, isLoading } = useBranches({ page_size: 1000 });

  const branches = React.useMemo(
    () => normalizeBranches(branchesData),
    [branchesData]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="branch">Branch</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="branch" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              Loading...
            </SelectItem>
          ) : (
            <>
              <SelectItem value="__all__">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BranchDepartmentFilter({
  value,
  onValueChange,
  placeholder = "Select branch department",
}: BranchDepartmentFilterProps) {
  const { data: branchDeptsData, isLoading } = useBranchDepartments({
    page_size: 1000,
  });

  const branchDepartments = React.useMemo(
    () => normalizeBranchDepartments(branchDeptsData),
    [branchDeptsData]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="branch-department">Branch Department</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger
          id="branch-department"
          className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              Loading...
            </SelectItem>
          ) : (
            <>
              <SelectItem value="__all__">All Branch Departments</SelectItem>
              {branchDepartments.map((bd) => (
                <SelectItem key={bd.id} value={String(bd.id)}>
                  {bd.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function RoleFilter({
  value,
  onValueChange,
  placeholder = "Select role",
}: RoleFilterProps) {
  const { data: rolesData, isLoading } = useRoles(undefined, {
    pageSize: 1000,
  });

  const roles = React.useMemo(() => normalizeRoles(rolesData), [rolesData]);

  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id="role" className="w-full border-[#E4E4E4]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              Loading...
            </SelectItem>
          ) : (
            <>
              <SelectItem value="__all__">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SearchFilter({
  value,
  onValueChange,
  placeholder = "Search...",
  label = "Search",
}: SearchFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="search">{label}</Label>
      <Input
        id="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}
