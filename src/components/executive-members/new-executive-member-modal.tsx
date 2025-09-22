"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExecutiveMember } from "@/hooks/queries/use-executive-members";
import { toast } from "sonner";

const executiveMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
});

type ExecutiveMemberFormData = z.infer<typeof executiveMemberSchema>;

interface NewExecutiveMemberModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewExecutiveMemberModal({ open, setOpen }: NewExecutiveMemberModalProps) {
  const createExecutiveMember = useCreateExecutiveMember();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ExecutiveMemberFormData>({
    resolver: zodResolver(executiveMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      phone: "",
    },
  });

  const onSubmit = async (data: ExecutiveMemberFormData) => {
    try {
      setIsSubmitting(true);
      await createExecutiveMember.mutateAsync(data);
      toast.success("Executive member created successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating executive member:", error);
      toast.error("Failed to create executive member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Executive Member</DialogTitle>
          <DialogDescription>
            Create a new executive member profile. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter full name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select onValueChange={(value) => form.setValue("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="CTO">CTO</SelectItem>
                <SelectItem value="CFO">CFO</SelectItem>
                <SelectItem value="Director">Director</SelectItem>
                <SelectItem value="VP of Sales">VP of Sales</SelectItem>
                <SelectItem value="VP of Marketing">VP of Marketing</SelectItem>
                <SelectItem value="VP of Operations">VP of Operations</SelectItem>
                <SelectItem value="VP of HR">VP of HR</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...form.register("department")}
              placeholder="Enter department"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="Enter phone number"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#D64575] hover:bg-[#D64575]/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Executive Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
