"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccessLevelSelect } from "./access-level-select";
import { useState } from "react";
import { useCreateRole } from "@/hooks/queries/use-roles";
import { toast } from "sonner";

interface NewRoleModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function NewRoleModal({ open, setOpen }: NewRoleModalProps) {
    const createRole = useCreateRole();

    // State for functionality
    const [roleName, setRoleName] = useState("");
    const [accessLevel, setAccessLevel] = useState<"employee" | "manager" | "executive">("employee");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
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
            const payload: import("@/services/roles").RoleCreateRequest = {
                name: roleName.trim(),
                access_level: accessLevel,
            };

            await createRole.mutateAsync(payload);

            toast.success("Role created successfully.");
            setOpen(false);
            setRoleName("");
            setAccessLevel("employee");
        } catch (error: unknown) {
            console.error("Error creating role:", error);

            const errorMessage = error instanceof Error ? error.message : String(error);
            const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
            const status = err?.response?.status;

            if (status === 409 || errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("duplicate")) {
                toast.error("A role with this name already exists");
            } else if (status === 403 || errorMessage.toLowerCase().includes("access denied") || errorMessage.toLowerCase().includes("don't have permission")) {
                toast.error("You don't have permission to perform this action");
            } else {
                toast.error(errorMessage || "Failed to create role. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
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
                        disabled={isSubmitting}
                        triggerClassName="border-[#D5D7DA] max-w-[400px]"
                    />
                </div>
            </div>
        </AppModal>
    );
}

