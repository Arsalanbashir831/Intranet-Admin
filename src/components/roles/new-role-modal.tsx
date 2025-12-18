"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccessLevelSelect } from "./access-level-select";
import { useState } from "react";
import { useCreateRole } from "@/hooks/queries/use-roles";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { validateRequired, validateMaxLength } from "@/lib/validation";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { NewRoleModalProps } from "@/types/roles";

export function NewRoleModal({ open, setOpen }: NewRoleModalProps) {
  const createRole = useCreateRole();
  const handleError = useErrorHandler({
    customMessages: {
      409: "A role with this name already exists",
      403: "You don't have permission to perform this action",
    },
  });

  // State for functionality
  const [roleName, setRoleName] = useState("");
  const [accessLevel, setAccessLevel] = useState<
    "employee" | "manager" | "executive"
  >("employee");

  const { isSubmitting, submit } = useFormSubmission({
    onSuccess: () => {
      setOpen(false);
      setRoleName("");
      setAccessLevel("employee");
    },
    successMessage: "Role created successfully.",
    resetOnSuccess: true,
    resetFn: () => {
      setRoleName("");
      setAccessLevel("employee");
    },
  });

  const handleSubmit = async () => {
    // Validation
    const requiredError = validateRequired(roleName, "Role name");
    if (requiredError) {
      handleError(new Error(requiredError));
      return;
    }

    const maxLengthError = validateMaxLength(roleName, 100, "Role name");
    if (maxLengthError) {
      handleError(new Error(maxLengthError));
      return;
    }

    await submit(async () => {
      const payload: import("@/types/roles").RoleCreateRequest = {
        name: roleName.trim(),
        access_level: accessLevel,
      };
      await createRole.mutateAsync(payload);
    });
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Add New Role"
      description="Create new Role"
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Creating..." : "Create"}
      confirmDisabled={isSubmitting || !roleName.trim()}
      onCancel={() => {
        setOpen(false);
        setRoleName("");
        setAccessLevel("employee");
      }}
      icon="/icons/user-hierarchy.svg">
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-center gap-8">
          <Label htmlFor="role-name">Role Name:</Label>
          <Input
            id="role-name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
            maxLength={100}
            required
          />
        </div>
        <div className="flex justify-between items-center gap-8">
          <Label htmlFor="access-level">Access Level:</Label>
          <AccessLevelSelect
            value={accessLevel}
            onChange={setAccessLevel}
            disabled={isSubmitting}
            triggerClassName="border-[#D5D7DA] max-w-[400px]"
          />
        </div>
      </div>
    </AppModal>
  );
}
