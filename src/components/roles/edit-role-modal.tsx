"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useUpdateRole } from "@/hooks/queries/use-roles";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { validateRequired, validateMaxLength } from "@/lib/validation";
import { useErrorHandler } from "@/hooks/use-error-handler";
import type { EditRoleModalProps } from "@/types/roles";
import { AccessLevelSelect } from "./access-level-select";

export function EditRoleModal({ open, setOpen, role }: EditRoleModalProps) {
  const updateRole = useUpdateRole(role?.id || "");
  const handleError = useErrorHandler({
    customMessages: {
      409: "A role with this name already exists",
      403: "You don't have permission to perform this action",
      404: "Role not found",
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
    },
    successMessage: "Role updated successfully.",
  });

  // Initialize form values when modal opens or role changes
  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setAccessLevel(role.access_level || "employee");
    } else {
      setRoleName("");
      setAccessLevel("employee");
    }
  }, [role]);

  const handleSubmit = async () => {
    if (!role) return;

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
      const payload: import("@/types/roles").RoleUpdateRequest = {
        name: roleName.trim(),
        access_level: accessLevel,
      };
      await updateRole.mutateAsync(payload);
    });
  };

  if (!role) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Edit Role"
      description={`Edit ${role.name} role`}
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Updating..." : "Update"}
      confirmDisabled={isSubmitting || !roleName.trim()}
      onCancel={() => setOpen(false)}
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
            disabled={true}
            triggerClassName="border-[#D5D7DA] max-w-[400px]"
          />
        </div>
      </div>
    </AppModal>
  );
}
