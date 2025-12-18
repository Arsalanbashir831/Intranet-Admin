"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useUpdateDepartment } from "@/hooks/queries/use-departments";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { validateRequired } from "@/lib/validation";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { EditDepartmentModalProps } from "@/types/departments";

export function EditDepartmentModal({
  open,
  setOpen,
  department,
}: EditDepartmentModalProps) {
  const updateDepartment = useUpdateDepartment(department?.id || "");
  const handleError = useErrorHandler();

  // State for functionality
  const [departmentName, setDepartmentName] = useState("");

  const { isSubmitting, submit } = useFormSubmission({
    onSuccess: () => {
      setOpen(false);
    },
    successMessage: "Department updated successfully.",
  });

  // Initialize form values when modal opens or department changes
  useEffect(() => {
    if (department) {
      setDepartmentName(department.dept_name || "");
    }
  }, [department]);

  const handleSubmit = async () => {
    if (!department) return;

    // Validation
    const requiredError = validateRequired(departmentName, "Department name");
    if (requiredError) {
      handleError(new Error(requiredError));
      return;
    }

    await submit(async () => {
      await updateDepartment.mutateAsync({ dept_name: departmentName.trim() });
    });
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
      icon="/icons/user-hierarchy.svg">
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
