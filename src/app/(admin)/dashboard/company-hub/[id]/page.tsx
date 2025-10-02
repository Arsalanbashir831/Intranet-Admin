"use client";
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CompanyHubForm, CompanyHubInitialData, CompanyHubFormData } from "@/components/company-hub/company-hub-form";
import { useParams, useRouter } from "next/navigation";
import { useAnnouncement, useUpdateAnnouncement, useCreateAnnouncementAttachment, useAnnouncementAttachments, useDeleteAnnouncementAttachment, useAttachmentDeletions } from "@/hooks/queries/use-announcements";
import { toast } from "sonner";
import * as React from "react";

export default function CompanyHubEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentFormData, setCurrentFormData] = React.useState<CompanyHubFormData | null>(null);

  // Fetch announcement data and attachments
  const { data: announcement, isLoading } = useAnnouncement(id);
  const { data: attachmentsData } = useAnnouncementAttachments(id);
  const updateAnnouncement = useUpdateAnnouncement(id);
  const createAttachment = useCreateAnnouncementAttachment();
  const deleteAttachment = useDeleteAnnouncementAttachment();
  const { deletedAttachmentIds, markForDeletion, clearDeletions } = useAttachmentDeletions();

  // Transform existing attachments to the format expected by the form
  const existingAttachments = React.useMemo(() => {
    if (!attachmentsData?.attachments?.results) return [];
    return attachmentsData.attachments.results.map((attachment: { id: number; name: string; file_url: string | null; size: number }) => ({
      id: attachment.id,
      name: attachment.name,
      file_url: attachment.file_url || '',
      size: attachment.size
    }));
  }, [attachmentsData]);

  const handleAttachmentDelete = (attachmentId: number) => {
    markForDeletion(attachmentId);
  };

  const handleFormDataChange = React.useCallback((data: CompanyHubFormData) => {
    setCurrentFormData(data);
  }, []);

  const deleteMarkedAttachments = async () => {
    if (deletedAttachmentIds.length === 0) return;
    
    const deletePromises = deletedAttachmentIds.map(async (attachmentId) => {
      return deleteAttachment.mutateAsync(attachmentId);
    });

    try {
      await Promise.all(deletePromises);
      clearDeletions();
      return true;
    } catch (error) {
      console.error("Failed to delete attachments:", error);
      throw error;
    }
  };

  const uploadAttachments = async (announcementId: string, files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      return createAttachment.mutateAsync({
        announcement: Number(announcementId),
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

  // Transform API data to form format
  const initialData = React.useMemo<CompanyHubInitialData | undefined>(() => {
    if (!announcement) return undefined;
    
    return {
      type: announcement.type === "policy" ? "policy" : "announcement",
      title: announcement.title,
      tags: (announcement.hash_tags || "") as string,
      selectedBranches: announcement.permitted_branches?.map(String) || [],
      selectedDepartments: announcement.permitted_departments?.map(String) || [],
      description: announcement.body,
    };
  }, [announcement]);

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!id || isSubmitting || !currentFormData) return;
    
    try {
      setIsSubmitting(true);
      
      await updateAnnouncement.mutateAsync({
        title: currentFormData.title || "",
        body: currentFormData.description || "",
        type: currentFormData.type === "policy" ? "policy" : "announcement",
        hash_tags: currentFormData.tags || undefined,
        is_active: !isDraft,
        permitted_branches: currentFormData.selectedBranches 
          ? currentFormData.selectedBranches.map(Number) 
          : [],
        permitted_departments: currentFormData.selectedDepartments 
          ? currentFormData.selectedDepartments.map(Number) 
          : [],
      });
      
      // Upload new attachments if any files are selected
      if (currentFormData.attachedFiles && currentFormData.attachedFiles.length > 0) {
        try {
          await uploadAttachments(id, currentFormData.attachedFiles);
        } catch (attachmentError) {
          console.error("Failed to upload new attachments:", attachmentError);
        }
      }
      
      // Delete marked attachments
      if (deletedAttachmentIds.length > 0) {
        try {
          await deleteMarkedAttachments();
        } catch (deleteError) {
          console.error("Failed to delete attachments:", deleteError);
        }
      }
      
      // Provide feedback based on what happened
      let message = isDraft ? "Announcement updated and saved as draft" : "Announcement updated successfully";
      if (currentFormData.attachedFiles?.length > 0 || deletedAttachmentIds.length > 0) {
        message += " with attachment changes";
      }
      
      toast.success(message);
      
      router.push(ROUTES.ADMIN.COMPANY_HUB);
    } catch (error) {
      console.error("Failed to update announcement:", error);
      toast.error("Failed to update announcement. Please try again.");
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
          { label: "Edit", href: ROUTES.ADMIN.COMPANY_HUB_EDIT_ID(id) },
        ]}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-primary"
              disabled={isSubmitting || isLoading || !currentFormData}
              onClick={() => handleSubmit(true)}
            >
              {isSubmitting ? "Saving..." : "Save As Draft"}
            </Button>
            <Button 
              disabled={isSubmitting || isLoading || !currentFormData}
              onClick={() => handleSubmit(false)}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />
      <div className="px-4 md:px-12 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading announcement...</div>
          </div>
        ) : (
          <CompanyHubForm 
            initialData={initialData} 
            onFormDataChange={handleFormDataChange}
            existingAttachments={existingAttachments}
            onAttachmentDelete={handleAttachmentDelete}
          />
        )}
      </div>
    </>
  );
}


