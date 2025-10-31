"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateBranch } from "@/hooks/queries/use-branches";
import { toast } from "sonner";

interface NewBranchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewBranchModal({ open, setOpen }: NewBranchModalProps) {
  const createBranch = useCreateBranch();

  // State for functionality
  const [branchName, setBranchName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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
      const payload: import("@/services/branches").BranchCreateRequest = {
        branch_name: branchName.trim(),
        ...(location.trim() ? { location: location.trim() } : {}),
      };
      
      await createBranch.mutateAsync(payload);
      
      toast.success("Branch created successfully.");
      setOpen(false);
      setBranchName("");
      setLocation("");
    } catch (error: unknown) {
      console.error("Error creating branch:", error);
      const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
      const status = err?.response?.status;

      // Handle specific error cases
      if (status === 409) {
        toast.error("A branch with this name already exists");
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action");
      } else {
        toast.error("Failed to create branch. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Add New Branch"
      description="Create new Branch"
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Creating..." : "Create"}
      confirmDisabled={isSubmitting || !branchName.trim()}
      onCancel={() => {
        setOpen(false);
        setBranchName("");
        setLocation("");
      }}
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

