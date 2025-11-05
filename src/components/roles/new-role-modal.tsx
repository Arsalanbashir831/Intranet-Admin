"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    const [isManager, setIsManager] = useState(false);
    const [isExecutive, setIsExecutive] = useState(false);
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
                is_manager: isManager,
                is_executive: isExecutive,
            };

            await createRole.mutateAsync(payload);

            toast.success("Role created successfully.");
            setOpen(false);
            setRoleName("");
            setIsManager(false);
            setIsExecutive(false);
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
                setIsManager(false);
                setIsExecutive(false);
            }}
            icon='/icons/user-hierarchy.svg'
        >
            <div className="space-y-4 px-6">
                <div className="flex justify-between items-start gap-8">
                    <Label htmlFor="role-name" className="w-full">Role Name:</Label>
                    <div className="flex flex-col gap-4 w-full">
                        <Input
                            id="role-name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="Enter role name"
                            className="border-[#D5D7DA] max-w-[400px] w-full"
                            disabled={isSubmitting}
                            maxLength={100}
                            required
                        />
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is-manager"
                                    checked={isManager}
                                    onCheckedChange={(checked) => setIsManager(checked === true)}
                                    disabled={isSubmitting}
                                    className="border-[#D5D7DA]"
                                />
                                <Label htmlFor="is-manager" className="text-sm font-normal cursor-pointer">
                                    Is Manager
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is-executive"
                                    checked={isExecutive}
                                    onCheckedChange={(checked) => setIsExecutive(checked === true)}
                                    disabled={isSubmitting}
                                    className="border-[#D5D7DA]"
                                />
                                <Label htmlFor="is-executive" className="text-sm font-normal cursor-pointer">
                                    Is Executive
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AppModal>
    );
}

