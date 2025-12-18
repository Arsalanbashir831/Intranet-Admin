"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CompanyHubForm } from "@/components/company-hub/company-hub-form";
import { CompanyHubInitialData, CompanyHubFormData } from "@/types/company-hub";
import {
  useAnnouncement,
  useUpdateAnnouncement,
  useCreateAnnouncementAttachment,
  useAnnouncementAttachments,
  useDeleteAnnouncementAttachment,
  useAttachmentDeletions,
} from "@/hooks/queries/use-announcements";

export default function CompanyHubEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";
  const [isSaving, setIsSaving] = React.useState(false); // For draft saving
  const [isPublishing, setIsPublishing] = React.useState(false); // For publishing
  const [currentFormData, setCurrentFormData] =
    React.useState<CompanyHubFormData | null>(null);

  // Fetch announcement data and attachments
  const { data: announcement, isLoading } = useAnnouncement(id);
  const { data: attachmentsData } = useAnnouncementAttachments(id);
  const updateAnnouncement = useUpdateAnnouncement(id);
  const createAttachment = useCreateAnnouncementAttachment();
  const deleteAttachment = useDeleteAnnouncementAttachment();
  const { deletedAttachmentIds, markForDeletion, clearDeletions } =
    useAttachmentDeletions();

  // Transform existing attachments to the format expected by the form
  const existingAttachments = React.useMemo(() => {
    if (!attachmentsData?.attachments?.results) return [];
    return attachmentsData.attachments.results.map(
      (attachment: {
        id: number;
        name: string;
        file_url: string | null;
        size: number;
      }) => ({
        id: attachment.id,
        name: attachment.name,
        file_url: attachment.file_url || "",
        size: attachment.size,
      })
    );
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

    // Type assertion to access all fields from API response
    const announcementWithAllFields = announcement as typeof announcement & {
      permitted_branches?: number[];
      permitted_departments?: number[];
      permitted_branch_departments?: number[];
    };

    return {
      type: announcement.type === "policy" ? "policy" : "announcement",
      title: announcement.title,
      // Map all three possible fields from API response
      permittedBranches:
        announcementWithAllFields.permitted_branches?.map(String) || [],
      permittedDepartments:
        announcementWithAllFields.permitted_departments?.map(String) || [],
      permittedBranchDepartments:
        announcementWithAllFields.permitted_branch_departments?.map(String) ||
        [],
      // Keep for backward compatibility
      selectedBranchDepartments:
        announcementWithAllFields.permitted_branch_departments?.map(String) ||
        [],
      body: announcement.body,
    };
  }, [announcement]);

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!id || isSaving || isPublishing || !currentFormData || !announcement)
      return;

    try {
      // Set the appropriate loading state
      if (isDraft) {
        setIsSaving(true);
      } else {
        setIsPublishing(true);
      }

      // Type assertion to access all fields from API response
      const announcementWithAllFields = announcement as typeof announcement & {
        permitted_branches?: number[];
        permitted_departments?: number[];
        permitted_branch_departments?: number[];
      };

      // Build payload with conditional fields
      const payload: {
        title: string;
        body: string;
        type: "announcement" | "policy";
        inherits_parent_permissions: boolean;
        permitted_branches?: number[];
        permitted_departments?: number[];
        permitted_branch_departments?: number[];
        is_active?: boolean;
      } = {
        title: currentFormData.title || "",
        body: currentFormData.body || "",
        type: currentFormData.type === "policy" ? "policy" : "announcement",
        inherits_parent_permissions: false,
        is_active: !isDraft,
      };

      // Add conditional fields based on what's selected
      // Check what was previously set to determine if we need to clear old fields
      const hadBranchDepts =
        announcementWithAllFields.permitted_branch_departments?.length;
      const hadBranches = announcementWithAllFields.permitted_branches?.length;
      const hadDepartments =
        announcementWithAllFields.permitted_departments?.length;

      if (currentFormData.permittedBranchDepartments?.length) {
        // Both branches and departments selected
        payload.permitted_branch_departments =
          currentFormData.permittedBranchDepartments.map(Number);
        // Clear old fields if they existed
        if (hadBranches) payload.permitted_branches = [];
        if (hadDepartments) payload.permitted_departments = [];
      } else if (currentFormData.permittedBranches?.length) {
        // Only branches selected
        payload.permitted_branches =
          currentFormData.permittedBranches.map(Number);
        // Clear old fields if they existed
        if (hadBranchDepts) payload.permitted_branch_departments = [];
        if (hadDepartments) payload.permitted_departments = [];
      } else if (currentFormData.permittedDepartments?.length) {
        // Only departments selected
        payload.permitted_departments =
          currentFormData.permittedDepartments.map(Number);
        // Clear old fields if they existed
        if (hadBranchDepts) payload.permitted_branch_departments = [];
        if (hadBranches) payload.permitted_branches = [];
      } else {
        // Nothing selected - clear all fields
        if (hadBranchDepts) payload.permitted_branch_departments = [];
        if (hadBranches) payload.permitted_branches = [];
        if (hadDepartments) payload.permitted_departments = [];
      }

      await updateAnnouncement.mutateAsync(payload);

      // Upload new attachments if any files are selected
      if (
        currentFormData.attachedFiles &&
        currentFormData.attachedFiles.length > 0
      ) {
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
      let message = isDraft
        ? "Announcement updated and saved as draft"
        : "Announcement updated successfully";
      if (
        currentFormData.attachedFiles?.length > 0 ||
        deletedAttachmentIds.length > 0
      ) {
        message += " with attachment changes";
      }

      toast.success(message);

      router.push(ROUTES.ADMIN.COMPANY_HUB);
    } catch (error) {
      console.error("Failed to update announcement:", error);
      toast.error("Failed to update announcement. Please try again.");
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
          { label: "Edit", href: ROUTES.ADMIN.COMPANY_HUB_EDIT_ID(id) },
        ]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-primary"
              disabled={
                isSaving || isPublishing || isLoading || !currentFormData
              }
              onClick={() => handleSubmit(true)}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                  <span>Saving...</span>
                </>
              ) : (
                "Save As Draft"
              )}
            </Button>
            <Button
              disabled={
                isSaving || isPublishing || isLoading || !currentFormData
              }
              onClick={() => handleSubmit(false)}>
              {isPublishing ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                  <span>Publishing...</span>
                </>
              ) : (
                "Publish"
              )}
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
