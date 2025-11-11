"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateBranch } from "@/hooks/queries/use-branches";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { validateRequired, validateMaxLength } from "@/lib/validation";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface NewBranchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewBranchModal({ open, setOpen }: NewBranchModalProps) {
  const createBranch = useCreateBranch();
  const handleError = useErrorHandler({
    customMessages: {
      409: "A branch with this name already exists",
      403: "You don't have permission to perform this action",
    },
  });

  // State for functionality
  const [branchName, setBranchName] = useState("");

  const { isSubmitting, submit } = useFormSubmission({
    onSuccess: () => {
      setOpen(false);
      setBranchName("");
    },
    successMessage: "Branch created successfully.",
    resetOnSuccess: true,
    resetFn: () => setBranchName(""),
  });

  const handleSubmit = async () => {
    // Validation
    const requiredError = validateRequired(branchName, "Branch name");
    if (requiredError) {
      handleError(new Error(requiredError));
      return;
    }

    const maxLengthError = validateMaxLength(branchName, 100, "Branch name");
    if (maxLengthError) {
      handleError(new Error(maxLengthError));
      return;
    }

    await submit(async () => {
      const payload: import("@/types/branches").BranchCreateRequest = {
        branch_name: branchName.trim(),
      };
      await createBranch.mutateAsync(payload);
    });
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
      </div>
    </AppModal>
  );
}

