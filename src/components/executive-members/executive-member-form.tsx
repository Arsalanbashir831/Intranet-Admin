"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectableTags, createSelectableItems } from "@/components/ui/selectable-tags";
import { useCreateExecutiveMember, useUpdateExecutiveMember } from "@/hooks/queries/use-executive-members";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export type ExecutiveMemberInitialValues = {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  role?: string;
  profileImageUrl?: string;
  qualification_details?: string;
};

export function ExecutiveMemberForm({ 
  initialValues, 
  onRegisterSubmit, 
  isEdit = false, 
  executiveId 
}: { 
  initialValues?: ExecutiveMemberInitialValues; 
  onRegisterSubmit?: (submit: () => void) => void; 
  isEdit?: boolean; 
  executiveId?: string; 
}) {
  // Rich text content state
  const [qualificationHtml, setQualificationHtml] = React.useState<string | undefined>(initialValues?.qualification_details);
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | undefined>(initialValues?.role);

  // React Query mutation for create/update
  const createExecutiveMember = useCreateExecutiveMember();
  const updateExecutiveMember = useUpdateExecutiveMember();
  const router = useRouter();

  // Role options for SelectableTags
  const roleOptions = React.useMemo(() => [
    { id: "CEO", name: "CEO" },
    { id: "CTO", name: "CTO" },
    { id: "CFO", name: "CFO" },
    { id: "Director", name: "Director" },
    { id: "VP of Sales", name: "VP of Sales" },
    { id: "VP of Marketing", name: "VP of Marketing" },
    { id: "VP of Operations", name: "VP of Operations" },
    { id: "VP of HR", name: "VP of HR" },
    { id: "President", name: "President" },
    { id: "Managing Director", name: "Managing Director" },
    { id: "Executive Director", name: "Executive Director" },
    { id: "Other", name: "Other" },
  ], []);

  // Reinitialize if initialValues change
  React.useEffect(() => {
    setQualificationHtml(initialValues?.qualification_details);
    setSelectedRoleId(initialValues?.role);
  }, [initialValues?.qualification_details, initialValues?.role]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const role = selectedRoleId || String(data.get("role") || "").trim();

    if (!name || !email || !role) {
      toast.error("Name, Email, and Role are required");
      return;
    }

    const payload = {
      name,
      email,
      role,
      address: String(data.get("address") || "").trim() || undefined,
      city: String(data.get("city") || "").trim() || undefined,
      phone: String(data.get("phone") || "").trim() || undefined,
      profile_picture: String(data.get("profile_picture") || "").trim() || undefined,
      qualification_details: qualificationHtml || undefined,
    };

    try {
      if (isEdit && executiveId) {
        await updateExecutiveMember.mutateAsync({ id: executiveId, data: payload });
        toast.success("Executive member updated successfully");
      } else {
        await createExecutiveMember.mutateAsync(payload);
        toast.success("Executive member created successfully");
      }
      router.push(ROUTES.ADMIN.EXECUTIVE_MEMBERS);
    } catch (error: unknown) {
      const err = error as { response?: { data?: Record<string, unknown> } };
      const dataErr = err?.response?.data;
      const messages: string[] = [];
      if (dataErr && typeof dataErr === 'object') {
        for (const key of Object.keys(dataErr)) {
          const value = dataErr[key];
          if (Array.isArray(value)) {
            value.forEach((msg: unknown) => messages.push(`${key}: ${String(msg)}`));
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          }
        }
      }
      if (messages.length) {
        messages.forEach((m) => toast.error(m));
      } else {
        toast.error("Failed to save. Please try again.");
      }
    }
  };

  // Allow parent to trigger submit from outside via PageHeader Save button
  const formRef = React.useRef<HTMLFormElement | null>(null);
  React.useEffect(() => {
    if (onRegisterSubmit) {
      onRegisterSubmit(() => {
        if (formRef.current) {
          // Trigger native form submission to use handleSubmit
          formRef.current.requestSubmit();
        }
      });
    }
  }, [onRegisterSubmit]);

  return (
    <form ref={formRef} className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Name:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input 
            name="name" 
            defaultValue={initialValues?.name} 
            placeholder="Name" 
            className="border-[#E2E8F0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Address:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input 
            name="address" 
            defaultValue={initialValues?.address} 
            placeholder="Address" 
            className="border-[#E2E8F0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">City:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input 
            name="city" 
            defaultValue={initialValues?.city} 
            placeholder="City" 
            className="border-[#E2E8F0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Phone Number:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input 
            name="phone" 
            defaultValue={initialValues?.phone} 
            placeholder="Phone Number" 
            className="border-[#E2E8F0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Email Id:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input 
            name="email" 
            defaultValue={initialValues?.email} 
            placeholder="Email Id" 
            type="email" 
            className="border-[#E2E8F0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Role:</Label>
        <div className="col-span-12 md:col-span-10">
          <SelectableTags
            items={createSelectableItems(roleOptions)}
            selectedItems={selectedRoleId ? [selectedRoleId] : []}
            onSelectionChange={(ids) => {
              const last = ids[ids.length - 1];
              setSelectedRoleId(last);
            }}
            placeholder="Select role"
            searchPlaceholder="Search roles..."
            emptyMessage="No roles found."
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Profile Picture:</Label>
        <div className="col-span-12 md:col-span-10">
          <Dropzone 
            onFileSelect={(files) => {
              console.log("Files selected:", files);
              // Handle file upload logic here
            }}
            accept="image/*"
            maxSize={800 * 400}
            initialPreviewUrls={initialValues?.profileImageUrl ? [initialValues.profileImageUrl] : []}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Qualification and Education</Label>
        <div className="col-span-12 md:col-span-10">
          <RichTextEditor
            content={qualificationHtml}
            placeholder="Write Qualification and Education"
            minHeight="200px"
            maxHeight="400px"
            onChange={(html) => setQualificationHtml(html)}
          />
        </div>
      </div>
    </form>
  );
}
