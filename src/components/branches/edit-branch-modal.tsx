"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useUpdateBranch } from "@/hooks/queries/use-branches";
import { toast } from "sonner";
import type { Branch } from "@/services/branches";

interface EditBranchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  branch: Branch | null;
}

export function EditBranchModal({ open, setOpen, branch }: EditBranchModalProps) {
  const updateBranch = useUpdateBranch(branch?.id || "");

  // State for functionality
  const [branchName, setBranchName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values when modal opens or branch changes
  useEffect(() => {
    if (branch) {
      setBranchName(branch.branch_name || "");
      setLocation(branch.location || "");
    }
  }, [branch]);

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

    if (location.length > 200) {
      toast.error("Location must be 200 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: import("@/services/branches").BranchUpdateRequest = {
        branch_name: branchName.trim(),
        ...(location.trim() ? { location: location.trim() } : {}),
      };
      
      await updateBranch.mutateAsync(payload);
      
      toast.success("Branch updated successfully.");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error updating branch:", error);
      
      // The API client converts errors to Error objects with messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
      const status = err?.response?.status;

      // Handle specific error cases - check both message and status
      if (status === 409 || errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("duplicate")) {
        toast.error("A branch with this name already exists");
      } else if (status === 403 || errorMessage.toLowerCase().includes("access denied") || errorMessage.toLowerCase().includes("don't have permission")) {
        toast.error("You don't have permission to perform this action");
      } else if (status === 404 || errorMessage.toLowerCase().includes("not found")) {
        toast.error("Branch not found");
      } else {
        // Use the error message if available, otherwise show generic message
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
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="location">Location:</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (optional)"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
            maxLength={200}
          />
        </div>
      </div>
    </AppModal>
  );
}

