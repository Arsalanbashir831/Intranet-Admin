"use client";

import * as React from "react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CompanyHubForm, type CompanyHubFormData } from "@/components/company-hub/company-hub-form";
import { useCreateAnnouncement, useCreateAnnouncementAttachment } from "@/hooks/queries/use-announcements";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AnnouncementCreateRequest } from "@/types/announcements";
import { Loader2 } from "lucide-react";

export default function CompanyHubPage() {
  const router = useRouter();
  const createAnnouncement = useCreateAnnouncement();
  const createAttachment = useCreateAnnouncementAttachment();
  const [formData, setFormData] = React.useState<CompanyHubFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false); // For draft saving
  const [isPublishing, setIsPublishing] = React.useState(false); // For publishing

  const uploadAttachments = async (announcementId: number, files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      return createAttachment.mutateAsync({
        announcement: announcementId,
        name: file.name,
        file: file,
        inherits_parent_permissions: true, // Match announcement permissions
      });
    });

    try {
      await Promise.all(uploadPromises);
      return true;
    } catch (error) {
      console.error("Failed to upload attachments:", error);
      throw error;
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!formData) {
      toast.error("No form data available");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.body.trim()) {
      toast.error("Body is required");
      return;
    }

    // Set the appropriate loading state
    if (isDraft) {
      setIsSaving(true);
    } else {
      setIsPublishing(true);
    }

    try {
      // Build payload with conditional fields
      const payload: AnnouncementCreateRequest = {
        title: formData.title.trim(),
        body: formData.body,
        type: formData.type,
        inherits_parent_permissions: false,
        is_active: !isDraft,
      };

      // Add conditional fields based on what's selected
      // Only set the relevant field (others will be undefined/not sent)
      if (formData.permittedBranchDepartments?.length) {
        // Both branches and departments selected
        payload.permitted_branch_departments = formData.permittedBranchDepartments.map(Number);
      } else if (formData.permittedBranches?.length) {
        // Only branches selected
        payload.permitted_branches = formData.permittedBranches.map(Number);
      } else if (formData.permittedDepartments?.length) {
        // Only departments selected
        payload.permitted_departments = formData.permittedDepartments.map(Number);
      }

      // Create the announcement first
      const createdAnnouncement = await createAnnouncement.mutateAsync(payload);
      
      // Upload attachments if any files are selected
      if (formData.attachedFiles && formData.attachedFiles.length > 0) {
        try {
          await uploadAttachments(createdAnnouncement.id, formData.attachedFiles);
          toast.success(`${formData.type === "policy" ? "Policy" : "Announcement"} ${isDraft ? "saved as draft" : "published"} successfully with ${formData.attachedFiles.length} attachment(s)`);
        } catch {
          // Announcement was created but attachments failed
          toast.warning(`${formData.type === "policy" ? "Policy" : "Announcement"} ${isDraft ? "saved as draft" : "published"} successfully, but some attachments failed to upload`);
        }
      } else {
        toast.success(`${formData.type === "policy" ? "Policy" : "Announcement"} ${isDraft ? "saved as draft" : "published"} successfully`);
      }
      
      router.push(ROUTES.ADMIN.COMPANY_HUB);
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error(`Failed to ${isDraft ? "save draft" : "publish"} ${formData.type === "policy" ? "policy" : "announcement"}`);
    } finally {
      // Reset the appropriate loading state
      if (isDraft) {
        setIsSaving(false);
      } else {
        setIsPublishing(false);
      }
    }
  };

  return (
    <>
      <PageHeader 
        title="Company Hub" 
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, 
          { label: "Company Hub", href: ROUTES.ADMIN.COMPANY_HUB }, 
          { label: "Add New", href: ROUTES.ADMIN.COMPANY_HUB_NEW }
        ]} 
        action={
          <div className="flex gap-2">
            <Button 
              variant='outline' 
              className="border-primary"
              onClick={() => handleSave(true)}
              disabled={isSaving || isPublishing || !formData}
            >
              {isSaving ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> <span>Saving...</span></> : "Save As Draft"}
            </Button>
            <Button 
              onClick={() => handleSave(false)}
              disabled={isSaving || isPublishing || !formData}
            >
              {isPublishing ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> <span>Publishing...</span></> : "Publish"}
            </Button>
          </div>
        } 
      />
      <div className="px-4 md:px-12 py-4">
        <CompanyHubForm onFormDataChange={setFormData} />
      </div>
    </>
  );
}


