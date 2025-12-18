import { createBranchDepartment, deleteBranchDepartment } from "@/services/branches";
import { toast } from "sonner";
import { Branch } from "@/types/branches";
import { QueryClient } from "@tanstack/react-query";
import { UseMutationResult } from "@tanstack/react-query";

interface UpdateBranchParams {
  branch: Branch;
  branchName: string;
  selectedDepartmentIds: string[];
  updateBranchMutation: UseMutationResult<any, Error, any>;
  queryClient: QueryClient;
}

export async function handleUpdateBranch({
  branch,
  branchName,
  selectedDepartmentIds,
  updateBranchMutation,
  queryClient,
}: UpdateBranchParams) {
  // First update branch name
  const payload = {
    branch_name: branchName.trim(),
  };

  await updateBranchMutation.mutateAsync(payload);

  // Then handle department assignments
  const currentDeptIds = branch.departments?.map((d) => d.id) || []; // Department IDs
  const newDeptIds = selectedDepartmentIds.map((id) => Number(id));

  // Find departments to add (in new but not in current)
  const toAdd = newDeptIds.filter((id) => !currentDeptIds.includes(id));

  // Find departments to remove (in current but not in new)
  // Use branch_department_id for deletion
  const toRemove =
    branch.departments
      ?.filter((d) => !newDeptIds.includes(d.id))
      .map((d) => d.branch_department_id) || [];

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
  queryClient.invalidateQueries({
    queryKey: ["branches", "detail", String(branch.id)],
  });
}

interface DeleteBranchParams {
  id: string;
  deleteBranchMutation: UseMutationResult<void, Error, string | number, unknown>;
  setDeletingId: (id: string | null) => void;
}

export async function handleDeleteBranch({
  id,
  deleteBranchMutation,
  setDeletingId,
}: DeleteBranchParams) {
  try {
    setDeletingId(id);
    await deleteBranchMutation.mutateAsync(id);
    toast.success("Branch deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete branch");
  } finally {
    setDeletingId(null);
  }
}

