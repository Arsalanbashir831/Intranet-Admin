"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useBranchDepartmentEmployees } from "@/hooks/queries/use-departments";
import { EmployeeSelector } from "@/components/common/employee-selector";
import { useCreateManager, useDeleteManager } from "@/hooks/queries/use-managers";
import { toast } from "sonner";
import type { BranchDepartment } from "@/services/departments";

interface EditDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  branchDepartment: BranchDepartment | null;
}

export function EditDepartmentModal({ open, setOpen, branchDepartment }: EditDepartmentModalProps) {
  const { data: employeesData, isLoading: employeesLoading } = useBranchDepartmentEmployees(
    branchDepartment?.id || "",
    { pageSize: 100 } // Get all employees for this branch department
  );
  
  const createManager = useCreateManager();
  const deleteManager = useDeleteManager();

  // State for functionality
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected manager when modal opens
  useEffect(() => {
    if (branchDepartment?.manager) {
      setSelectedManagerId(String(branchDepartment.manager.id));
    } else {
      setSelectedManagerId("");
    }
  }, [branchDepartment]);

  // Wrapper functions to adapt existing hook for EmployeeSelector
  const useBranchEmployeesAdapter = () => {
    return {
      data: {
        results: employeesData?.employees?.results?.map(emp => ({
          id: emp.id,
          emp_name: emp.emp_name,
          email: emp.email,
          profile_picture: emp.profile_picture
        })) || []
      },
      isLoading: employeesLoading,
    };
  };

  const useSearchBranchEmployeesAdapter = (query: string) => {
    // Filter the branch employees by name/email locally since they're already fetched
    const filteredEmployees = employeesData?.employees?.results?.filter(emp => 
      emp.emp_name.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase())
    ).map(emp => ({
      id: emp.id,
      emp_name: emp.emp_name,
      email: emp.email,
      profile_picture: emp.profile_picture
    })) || [];

    return {
      data: {
        results: filteredEmployees
      },
      isLoading: false,
    };
  };

  const handleSubmit = async () => {
    if (!branchDepartment) return;

    setIsSubmitting(true);
    try {
      const currentManagerId = branchDepartment.manager?.id;
      const newManagerId = selectedManagerId ? Number(selectedManagerId) : null;

      // Case 1: No current manager, assigning new manager
      if (!currentManagerId && newManagerId) {
        await createManager.mutateAsync({
          employee_id: newManagerId,
          branch_department_id: branchDepartment.id
        });
        toast.success("Manager assigned successfully.");
      }
      // Case 2: Has current manager, changing to different manager
      else if (currentManagerId && newManagerId && currentManagerId !== newManagerId) {
        // Delete current manager assignment
        await deleteManager.mutateAsync(currentManagerId);
        // Create new manager assignment
        await createManager.mutateAsync({
          employee_id: newManagerId,
          branch_department_id: branchDepartment.id
        });
        toast.success("Manager updated successfully.");
      }
      // Case 3: Has current manager, removing manager
      else if (currentManagerId && !newManagerId) {
        await deleteManager.mutateAsync(currentManagerId);
        toast.success("Manager removed successfully.");
      }
      // Case 4: No changes
      else {
        toast.message("No changes made.");
      }

      setOpen(false);
    } catch (error) {
      console.error("Error updating manager:", error);
      
      // Check for specific error about employee not belonging to branch department
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message?: string }).message || '';
        if (errorMessage.includes("Employee must belong to the provided branch department")) {
          toast.error("Selected employee must already work in this branch department to be assigned as manager.");
        } else {
          toast.error("Failed to update manager. Please try again.");
        }
      } else {
        toast.error("Failed to update manager. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!branchDepartment) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Edit Department Manager"
      description={`Manage manager for ${branchDepartment.branch.branch_name} branch`}
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Updating..." : "Update"}
      confirmDisabled={isSubmitting}
      onCancel={() => setOpen(false)}
      icon='/icons/user-hierarchy.svg'
    >
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="dept-name">Department:</Label>
          <Input
            id="dept-name"
            value={`${branchDepartment.branch.branch_name} Branch`}
            disabled
            className="border-[#D5D7DA] max-w-[400px] bg-gray-50"
          />
        </div>

        <div className="rounded-md border border-[#E4E4E4]">
          <div className="grid grid-cols-[1fr_1fr] gap-0 border-b border-[#E4E4E4] px-3 py-2 text-sm text-muted-foreground">
            <span>Branch</span>
            <span>Manager</span>
          </div>
          <div className="divide-y divide-[#E4E4E4]">
            <div className="grid grid-cols-[1fr_1fr] items-center px-3 py-2">
              <div className="text-sm text-[#667085]">{branchDepartment.branch.branch_name}</div>
              <div>
                {employeesLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading employees...</div>
                ) : (
                  <EmployeeSelector
                    value={selectedManagerId}
                    onValueChange={setSelectedManagerId}
                    placeholder="Select Manager..."
                    searchPlaceholder="Search employees in this branch..."
                    useAllEmployees={useBranchEmployeesAdapter}
                    useSearchEmployees={useSearchBranchEmployeesAdapter}
                    className="w-full justify-between border-none shadow-none pl-0 hover:bg-transparent"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {employeesData?.employees?.results?.length === 0 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            No employees found in this branch department. Add employees to this branch first before assigning a manager.
          </div>
        )}
      </div>
    </AppModal>
  );
}