"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateDepartment } from "@/hooks/queries/use-departments";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { validateRequired } from "@/lib/validation";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { NewDepartmentModalProps } from "@/types/departments";

export function NewDepartmentModal({ open, setOpen }: NewDepartmentModalProps) {
  const createDepartment = useCreateDepartment();
  const handleError = useErrorHandler();

  // State for functionality
  const [departmentName, setDepartmentName] = useState("");

  const { isSubmitting, submit } = useFormSubmission({
    onSuccess: () => {
      setOpen(false);
      setDepartmentName("");
    },
    successMessage: "Department created successfully.",
    resetOnSuccess: true,
    resetFn: () => setDepartmentName(""),
  });

  const handleSubmit = async () => {
    // Validation
    const requiredError = validateRequired(departmentName, "Department name");
    if (requiredError) {
      handleError(new Error(requiredError));
      return;
    }

    await submit(async () => {
      await createDepartment.mutateAsync({ dept_name: departmentName.trim() });
    });
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Add New Department"
      description="Create new Department"
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Creating..." : "Create"}
      confirmDisabled={isSubmitting || !departmentName.trim()}
      onCancel={() => setOpen(false)}
      icon="/icons/user-hierarchy.svg">
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="dept-name">Department:</Label>
          <Input
            id="dept-name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="Enter department name"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </AppModal>
  );
}
