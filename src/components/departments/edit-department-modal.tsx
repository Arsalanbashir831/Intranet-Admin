"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useUpdateDepartment } from "@/hooks/queries/use-departments";
import { toast } from "sonner";
import type { Department } from "@/services/departments";

interface EditDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  department: Department | null;
}

export function EditDepartmentModal({ open, setOpen, department }: EditDepartmentModalProps) {
  const updateDepartment = useUpdateDepartment(department?.id || "");

  // State for functionality
  const [departmentName, setDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values when modal opens or department changes
  useEffect(() => {
    if (department) {
      setDepartmentName(department.dept_name || "");
    }
  }, [department]);

  const handleSubmit = async () => {
    if (!department) return;

    if (!departmentName.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDepartment.mutateAsync({ dept_name: departmentName.trim() });
      toast.success("Department updated successfully.");
      setOpen(false);
    } catch (error) {
      console.error("Error updating department:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || "Failed to update department. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!department) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Edit Department"
      description={`Edit ${department.dept_name} department`}
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Updating..." : "Update"}
      confirmDisabled={isSubmitting || !departmentName.trim()}
      onCancel={() => setOpen(false)}
      icon='/icons/user-hierarchy.svg'
    >
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="dept-name">Department Name:</Label>
          <Input
            id="dept-name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="Enter department name"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>
    </AppModal>
  );
}
