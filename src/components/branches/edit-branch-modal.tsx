"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { useState, useEffect } from "react";
import { useUpdateBranch } from "@/hooks/queries/use-branches";
import { useDepartments, useSearchDepartments } from "@/hooks/queries/use-departments";
import { SelectableTags } from "@/components/ui/selectable-tags";
import { toast } from "sonner";
import type { Branch } from "@/services/branches";
import type { Department } from "@/services/departments";
import { createBranchDepartment, deleteBranchDepartment } from "@/services/branches";
import { useQueryClient } from "@tanstack/react-query";

interface EditBranchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  branch: Branch | null;
}

export function EditBranchModal({ open, setOpen, branch }: EditBranchModalProps) {
  const updateBranch = useUpdateBranch(branch?.id || "");
  const queryClient = useQueryClient();

  // State for functionality
  const [branchName, setBranchName] = useState("");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values when modal opens or branch changes
  useEffect(() => {
    if (branch) {
      setBranchName(branch.branch_name || "");
      // Initialize selected departments from branch.departments
      // branch.departments has department objects with 'id' field (department ID)
      const currentDeptIds = branch.departments?.map(d => String(d.id)) || [];
      setSelectedDepartmentIds(currentDeptIds);
    } else {
      setBranchName("");
      setSelectedDepartmentIds([]);
    }
  }, [branch]);

  // Adapter hooks for department selection
  const useAllDepartments = () => {
    const result = useDepartments(undefined, { pageSize: 1000 });
    
    const items = React.useMemo(() => {
      if (!result.data) return [];
      
      // Handle paginated response structure: { departments: { results: [...] } }
      const departments = Array.isArray(result.data)
        ? result.data
        : (result.data as { departments?: { results?: Department[] } })?.departments?.results || [];
      
      return departments.map((dept: Department) => ({
        id: String(dept.id),
        label: dept.dept_name,
      }));
    }, [result.data]);

    return {
      data: items,
      isLoading: result.isLoading,
    };
  };

  const useSearchDepartmentsAdapter = (query: string) => {
    const result = useSearchDepartments(query, { pageSize: 1000 });
    
    const items = React.useMemo(() => {
      if (!result.data) return [];
      
      // Handle paginated response structure: { departments: { results: [...] } }
      const departments = Array.isArray(result.data)
        ? result.data
        : (result.data as { departments?: { results?: Department[] } })?.departments?.results || [];
      
      return departments.map((dept: Department) => ({
        id: String(dept.id),
        label: dept.dept_name,
      }));
    }, [result.data]);

    return {
      data: items,
      isLoading: result.isLoading,
    };
  };

  const handleSubmit = async () => {
    if (!branch) return;

    if (!branchName.trim()) {
      toast.error("Branch name is required");
      return;
    }

    if (branchName.length > 100) {
      toast.error("Branch name must be 100 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      // First update branch name
      const payload: import("@/services/branches").BranchUpdateRequest = {
        branch_name: branchName.trim(),
      };
      
      await updateBranch.mutateAsync(payload);

      // Then handle department assignments
      const currentDeptIds = branch.departments?.map(d => d.id) || []; // Department IDs
      const newDeptIds = selectedDepartmentIds.map(id => Number(id));
      
      // Find departments to add (in new but not in current)
      const toAdd = newDeptIds.filter(id => !currentDeptIds.includes(id));
      
      // Find departments to remove (in current but not in new)
      // Use branch_department_id for deletion
      const toRemove = branch.departments?.filter(d => !newDeptIds.includes(d.id)).map(d => d.branch_department_id) || [];

      // Create new branch departments
      for (const deptId of toAdd) {
        await createBranchDepartment({
          branch_id: branch.id,
          department_id: deptId,
        });
      }

      // Delete removed branch departments
      for (const branchDeptId of toRemove) {
        await deleteBranchDepartment(branchDeptId);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["branches"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["branches", "detail", String(branch.id)] });
      
      toast.success("Branch updated successfully.");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error updating branch:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
      const status = err?.response?.status;

      if (status === 409 || errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("duplicate")) {
        toast.error("A branch with this name already exists");
      } else if (status === 403 || errorMessage.toLowerCase().includes("access denied") || errorMessage.toLowerCase().includes("don't have permission")) {
        toast.error("You don't have permission to perform this action");
      } else if (status === 404 || errorMessage.toLowerCase().includes("not found")) {
        toast.error("Branch not found");
      } else {
        toast.error(errorMessage || "Failed to update branch. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!branch) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Edit Branch"
      description={`Edit ${branch.branch_name} branch`}
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Updating..." : "Update"}
      confirmDisabled={isSubmitting || !branchName.trim()}
      onCancel={() => setOpen(false)}
      icon='/icons/branch.svg'
    >
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="branch-name">Branch Name:</Label>
          <Input
            id="branch-name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Enter branch name"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
            maxLength={100}
            required
          />
        </div>
        <div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
            Departments:
          </Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={[]}
              selectedItems={selectedDepartmentIds}
              onSelectionChange={setSelectedDepartmentIds}
              searchPlaceholder="Search departments..."
              emptyMessage="No departments found."
              useAllItems={useAllDepartments}
              useSearch={useSearchDepartmentsAdapter}
              searchDebounce={300}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Select departments to assign to this branch.
            </p>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
