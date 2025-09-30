"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { useAllBranches } from "@/hooks/queries/use-branches";
import { useAllEmployees, useSearchEmployees } from "@/hooks/queries/use-employees";
import { EmployeeSelector } from "@/components/common/employee-selector";
import { useCreateDepartment } from "@/hooks/queries/use-departments";
import { useCreateManager } from "@/hooks/queries/use-managers";
import { toast } from "sonner";

interface NewDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewDepartmentModal({ open, setOpen }: NewDepartmentModalProps) {
  const { data: branchesData, isLoading: branchesLoading } = useAllBranches();
  const createDepartment = useCreateDepartment();
  const createManager = useCreateManager();

  // State for functionality
  const [departmentName, setDepartmentName] = useState("");
  const [branchManagers, setBranchManagers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wrapper functions to adapt hooks for EmployeeSelector
  const useAllEmployeesAdapter = () => {
    const result = useAllEmployees();
    return {
      data: result.data,
      isLoading: result.isLoading,
    };
  };

  const useSearchEmployeesAdapter = (query: string) => {
    const result = useSearchEmployees(query);
    return {
      data: result.data,
      isLoading: result.isLoading,
    };
  };

  // Transform API data
  const branches = useMemo(() => {
    const list = branchesData?.branches?.results ?? [];
    return list.map((branch: { id: number | string; branch_name?: string }) => ({
      id: String(branch.id),
      label: branch.branch_name || `Branch ${branch.id}`,
    }));
  }, [branchesData]);

  const handleManagerChange = (branchId: string, manager: string) => {
    setBranchManagers((prev) => ({ ...prev, [branchId]: manager }));
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      // Step 1: Create department (only name)
      const response = await createDepartment.mutateAsync({ dept_name: departmentName });

      // Extract the department data from the response
      const department = response.department;
      
      if (!department?.id) {
        toast.error("Department created but no ID returned.");
        return;
      }

      // Step 2: For each branch with a selected manager, create a manager assignment
      const managerAssignments = Object.entries(branchManagers)
        .filter(([, managerId]) => !!managerId)
        .map(([branchId, managerId]) => {
          // Find the corresponding branch_department from the created department
          const branchDepartment = department.branch_departments.find(
            bd => bd.branch.id === Number(branchId)
          );
          
          if (!branchDepartment) {
            console.warn(`Branch department not found for branch ID: ${branchId}`);
            return null;
          }
          
          return {
            employee_id: Number(managerId),
            branch_department_id: branchDepartment.id
          };
        })
        .filter(Boolean);

      if (managerAssignments.length > 0) {
        const results = await Promise.allSettled(
          managerAssignments.map(assignment => 
            createManager.mutateAsync(assignment!)
          )
        );

        const fulfilled = results.filter((r) => r.status === "fulfilled");
        const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
        
        const createdCount = fulfilled.length;
        const failedCount = rejected.length;
        const totalBranches = Object.keys(branchManagers).length;
        const skippedCount = totalBranches - managerAssignments.length;

        if (createdCount > 0) {
          toast.success(`Department created with ${createdCount} manager${createdCount > 1 ? "s" : ""} assigned.`);
        } else {
          toast.success("Department created.");
        }
        
        if (failedCount > 0) {
          // Check for specific error messages
          const employeeBranchErrors = rejected.filter(result => 
            result.reason?.message?.includes("Employee must belong to the provided branch department") ||
            result.reason?.response?.data?.error?.includes("Employee must belong to the provided branch department")
          );
          
          if (employeeBranchErrors.length > 0) {
            toast.error(`${employeeBranchErrors.length} manager assignment${employeeBranchErrors.length > 1 ? "s" : ""} failed: Selected employee${employeeBranchErrors.length > 1 ? "s" : ""} must already work in the respective branch${employeeBranchErrors.length > 1 ? "es" : ""}.`);
          }
          
          const otherErrors = rejected.length - employeeBranchErrors.length;
          if (otherErrors > 0) {
            toast.error(`${otherErrors} manager assignment${otherErrors > 1 ? "s" : ""} failed due to other errors.`);
          }
        }
        
        if (skippedCount > 0) {
          toast.message(`${skippedCount} branch${skippedCount > 1 ? "es were" : " was"} skipped (no manager selected).`);
        }
      } else {
        // No managers to assign
        toast.success("Department created.");
        const totalBranches = Object.keys(branchManagers).length;
        if (totalBranches > 0) {
          toast.message(`${totalBranches} branch${totalBranches > 1 ? "es were" : " was"} skipped (no manager selected).`);
        }
      }

      setOpen(false);
      setDepartmentName("");
      setBranchManagers({});
    } catch (error) {
      console.error("Error creating department or assigning managers:", error);
      toast.error("Failed to create department. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Add New Department"
      description="Create new Department"
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Creating..." : "Create"}
      confirmDisabled={isSubmitting || !departmentName.trim()}
      onCancel={() => setOpen(false)}
      icon='/icons/user-hierarchy.svg'
    >
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="dept-name">Department:</Label>
          <Input
            id="dept-name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="Enter department name"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
          />
        </div>

        <div className="rounded-md border border-[#E4E4E4]">
          <div className="grid grid-cols-[1fr_1fr] gap-0 border-b border-[#E4E4E4] px-3 py-2 text-sm text-muted-foreground">
            <span>Branch</span>
            <span>Manager</span>
          </div>
          <div className="divide-y divide-[#E4E4E4]">
            {branchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading data...</div>
              </div>
            ) : branches.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">No branches found</div>
              </div>
            ) : (
              branches.map((branch: { id: string; label: string }) => (
                <div
                  key={branch.id}
                  className="grid grid-cols-[1fr_1fr] items-center px-3 py-2"
                >
                  <div className="text-sm text-[#667085]">{branch.label}</div>
                  <div>
                    <EmployeeSelector
                      value={branchManagers[branch.id] ?? ""}
                      onValueChange={(employeeId) => handleManagerChange(branch.id, employeeId)}
                      placeholder="Select Manager..."
                      searchPlaceholder="Search employees..."
                      useAllEmployees={useAllEmployeesAdapter}
                      useSearchEmployees={useSearchEmployeesAdapter}
                      className="w-full justify-between border-none shadow-none pl-0 hover:bg-transparent"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppModal>
  )
}