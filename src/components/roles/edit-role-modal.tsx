"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useUpdateRole } from "@/hooks/queries/use-roles";
import { toast } from "sonner";
import type { Role } from "@/services/roles";
import { AccessLevelSelect } from "./access-level-select";

interface EditRoleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  role: Role | null;
}

export function EditRoleModal({ open, setOpen, role }: EditRoleModalProps) {
  const updateRole = useUpdateRole(role?.id || "");

  // State for functionality
  const [roleName, setRoleName] = useState("");
  const [accessLevel, setAccessLevel] = useState<"employee" | "manager" | "executive">("employee");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (roleName.length > 100) {
      toast.error("Role name must be 100 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: import("@/services/roles").RoleUpdateRequest = {
        name: roleName.trim(),
        access_level: accessLevel,
      };
      
      await updateRole.mutateAsync(payload);
      
      toast.success("Role updated successfully.");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error updating role:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
      const status = err?.response?.status;

      if (status === 409 || errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("duplicate")) {
        toast.error("A role with this name already exists");
      } else if (status === 403 || errorMessage.toLowerCase().includes("access denied") || errorMessage.toLowerCase().includes("don't have permission")) {
        toast.error("You don't have permission to perform this action");
      } else if (status === 404 || errorMessage.toLowerCase().includes("not found")) {
        toast.error("Role not found");
      } else {
        toast.error(errorMessage || "Failed to update role. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
      icon='/icons/user-hierarchy.svg'
    >
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

