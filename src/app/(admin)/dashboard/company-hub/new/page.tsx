"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CompanyHubForm, type CompanyHubFormData } from "@/components/company-hub/company-hub-form";
import { useCreateAnnouncement, useCreateAnnouncementAttachment } from "@/hooks/queries/use-announcements";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AnnouncementCreateRequest } from "@/services/announcements";

export default function CompanyHubPage() {
  const router = useRouter();
  const createAnnouncement = useCreateAnnouncement();
  const createAttachment = useCreateAnnouncementAttachment();
  const [formData, setFormData] = React.useState<CompanyHubFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: AnnouncementCreateRequest = {
        title: formData.title.trim(),
        body: formData.description,
        type: formData.type,
        hash_tags: formData.tags || null,
        is_active: !isDraft, // Published if not draft
        inherits_parent_permissions: true, // Default to true
        // Always send arrays, even if empty, to properly clear selections
        permitted_branches: formData.selectedBranches 
          ? formData.selectedBranches.map(Number) 
          : [],
        permitted_departments: formData.selectedDepartments 
          ? formData.selectedDepartments.map(Number) 
          : [],
      };

      // Create the announcement first
      const createdAnnouncement = await createAnnouncement.mutateAsync(payload);
      
      // Upload attachments if any files are selected
      if (formData.attachedFiles && formData.attachedFiles.length > 0) {
        try {
          await uploadAttachments(createdAnnouncement.id, formData.attachedFiles);
          toast.success(`${formData.type === "policy" ? "Policy" : "Announcement"} ${isDraft ? "saved as draft" : "published"} successfully with ${formData.attachedFiles.length} attachment(s)`);
        } catch (error) {
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
      setIsSubmitting(false);
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
              disabled={isSubmitting || !formData}
            >
              {isSubmitting ? "Saving..." : "Save As Draft"}
            </Button>
            <Button 
              onClick={() => handleSave(false)}
              disabled={isSubmitting || !formData}
              className="bg-[#D64575] hover:bg-[#B53A63]"
            >
              {isSubmitting ? "Publishing..." : "Publish"}
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


