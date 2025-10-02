"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateDepartment } from "@/hooks/queries/use-departments";
import { toast } from "sonner";

interface NewDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewDepartmentModal({ open, setOpen }: NewDepartmentModalProps) {
  const createDepartment = useCreateDepartment();

  // State for functionality
  const [departmentName, setDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      // Create department (only name)
      await createDepartment.mutateAsync({ dept_name: departmentName });
      
      toast.success("Department created successfully.");
      setOpen(false);
      setDepartmentName("");
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error("Failed to create department. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      icon='/icons/user-hierarchy.svg'
    >
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
  )
}
