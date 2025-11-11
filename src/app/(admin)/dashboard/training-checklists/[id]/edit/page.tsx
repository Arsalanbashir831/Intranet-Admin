"use client";

import * as React from "react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  NewHirePlanForm,
  type NewHirePlanFormData,
} from "@/components/new-hire/new-hire-plan-form";
import {
  useChecklist,
  useUpdateChecklist,
  useCreateAttachment,
  useCreateAttachmentFile,
  useDeleteAttachment,
  useDeleteAttachmentFile,
} from "@/hooks/queries/use-new-hire";
import { updateAttachment } from "@/services/new-hire";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewHirePlanEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) ?? "";

  const [formData, setFormData] = React.useState<NewHirePlanFormData | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false); // For draft saving
  const [isPublishing, setIsPublishing] = React.useState(false); // For publishing

  // Fetch checklist data (attachments are included in the response)
  const { data: checklist, isLoading } = useChecklist(id);

  const updateChecklist = useUpdateChecklist(id);
  const createAttachment = useCreateAttachment();
  const createAttachmentFile = useCreateAttachmentFile();
  const deleteAttachment = useDeleteAttachment();
  const deleteAttachmentFile = useDeleteAttachmentFile();

  // Transform API data to form format
  const initialData = React.useMemo(() => {
    if (!checklist) return undefined;

    // Use attachments directly from checklist response (they're nested in the response)
    const attachments = checklist.attachments || [];

    const trainingItems = attachments
      .filter((att) => att.type === "training")
      .map((att) => ({
        id: String(att.id),
        title: att.title,
        body: att.detail || "",
        type: "training" as const,
        deadline: (att as { deadline?: string }).deadline,
        files: [], // Existing files are handled separately
        existingFiles:
          att.files ||
          ([] as {
            id: number;
            attachment: number;
            file: string;
            uploaded_at: string;
          }[]), // Store existing files for reference
        deletedFileIds: [], // Initialize with empty array
      }));

    return {
      assignees: checklist.assigned_to.map(String),
      trainingItems,
    };
  }, [checklist]);

  const handleSave = async (isDraft: boolean) => {
    if (!formData || !id || !checklist) {
      toast.error("No form data available");
      return;
    }

    if (formData.assignees.length === 0) {
      toast.error("Please select at least one assignee");
      return;
    }

    if (formData.trainingItems.length === 0) {
      toast.error("Please add at least one training item");
      return;
    }

    // Set the appropriate loading state
    if (isDraft) {
      setIsSaving(true);
    } else {
      setIsPublishing(true);
    }

    try {
      // Step 1: Update checklist
      await updateChecklist.mutateAsync({
        assigned_to: formData.assignees.map(Number),
        status: isDraft ? "draft" : "publish",
      });

      // Step 2: Handle attachments CRUD operations
      const allCurrentItems = [...formData.trainingItems];
      const existingAttachments = checklist.attachments || [];

      // Create maps for comparison
      const existingItemsMap = new Map(
        existingAttachments.map((att) => [String(att.id), att])
      );
      const currentItemsMap = new Map(
        allCurrentItems.map((item) => [item.id, item])
      );

      // Identify items to delete (in existing but not in current)
      const itemsToDelete = existingAttachments.filter(
        (att) => !currentItemsMap.has(String(att.id))
      );

      // Identify items to update (in both existing and current)
      const itemsToUpdate = allCurrentItems.filter(
        (item) =>
          existingItemsMap.has(item.id) &&
          !item.id.startsWith("task-") &&
          !item.id.startsWith("training-")
      );

      // Identify items to create (new items with generated IDs or completely new)
      const itemsToCreate = allCurrentItems.filter(
        (item) =>
          !existingItemsMap.has(item.id) ||
          item.id.startsWith("task-") ||
          item.id.startsWith("training-")
      );

      // Step 2a: Delete removed attachments (this will cascade delete files)
      if (itemsToDelete.length > 0) {
        const deletePromises = itemsToDelete.map(async (attachment) => {
          await deleteAttachment.mutateAsync(attachment.id);
        });
        await Promise.all(deletePromises);
      }

      // Step 2b: Update existing attachments
      if (itemsToUpdate.length > 0) {
        const updatePromises = itemsToUpdate.map(async (item) => {
          const attachmentId = Number(item.id);

          // Update attachment details using service function
          await updateAttachment(attachmentId, {
            title: item.title,
            detail: item.body,
            type: item.type,
            deadline: item.deadline || null,
          });

          // Handle new files for this attachment
          if (item.files && item.files.length > 0) {
            const uploadPromises = item.files.map(async (file) => {
              return createAttachmentFile.mutateAsync({
                attachment: attachmentId,
                file: file,
              });
            });
            await Promise.all(uploadPromises);
          }

          // Handle deleted files for this attachment
          if (
            "deletedFileIds" in item &&
            item.deletedFileIds &&
            (item.deletedFileIds as number[]).length > 0
          ) {
            // Actually delete the files when saving/publishing
            const deleteFilePromises = (item.deletedFileIds as number[]).map(
              async (fileId) => {
                await deleteAttachmentFile.mutateAsync(fileId);
              }
            );
            await Promise.all(deleteFilePromises);
          }

          return attachmentId;
        });
        await Promise.all(updatePromises);
      }

      // Step 2c: Create new attachments
      if (itemsToCreate.length > 0) {
        const createPromises = itemsToCreate.map(async (item) => {
          // Create attachment
          const attachment = await createAttachment.mutateAsync({
            checklist: Number(id),
            title: item.title,
            detail: item.body,
            type: item.type,
            deadline: item.deadline || null,
          });

          // Upload files for new attachment
          if (item.files && item.files.length > 0) {
            const uploadPromises = item.files.map(async (file) => {
              return createAttachmentFile.mutateAsync({
                attachment: attachment.id,
                file: file,
              });
            });
            await Promise.all(uploadPromises);
          }

          return attachment;
        });
        await Promise.all(createPromises);
      }

      toast.success(
        `New hire plan ${isDraft ? "saved as draft" : "published"} successfully`
      );
      router.push(ROUTES.ADMIN.NEW_HIRE_PLAN);
    } catch (error) {
      console.error("Failed to update new hire plan:", error);

      // Extract error message from API response
      let errorMessage = "Failed to update new hire plan. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response?: { data?: unknown } };
        if (apiError.response?.data) {
          const errorData = apiError.response.data;

          // Check for non_field_errors (validation errors)
          if (
            errorData &&
            typeof errorData === "object" &&
            "non_field_errors" in errorData
          ) {
            const nfe = (errorData as { non_field_errors: unknown })
              .non_field_errors;
            if (Array.isArray(nfe)) {
              errorMessage = nfe.join(". ");
            }
          }
          // Check for field-specific errors
          else if (errorData && typeof errorData === "object") {
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => {
                if (Array.isArray(errors)) {
                  return `${field}: ${errors.join(", ")}`;
                }
                return `${field}: ${errors}`;
              })
              .join(". ");

            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
          // Check for direct error message
          else if (
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData
          ) {
            errorMessage = String((errorData as { message: unknown }).message);
          }
          // Check for detail message (common in DRF responses)
          else if (
            errorData &&
            typeof errorData === "object" &&
            "detail" in errorData
          ) {
            errorMessage = String((errorData as { detail: unknown }).detail);
          }
        }
      }
      // Handle errors from React Query mutations
      else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String((error as { message: unknown }).message);
      }

      toast.error(errorMessage);
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
        title="Training Checklists"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Training Checklists", href: ROUTES.ADMIN.NEW_HIRE_PLAN },
          { label: "Edit" },
        ]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-primary"
              onClick={() => handleSave(true)}
              disabled={isSaving || isPublishing || isLoading || !formData}
            >
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
              onClick={() => handleSave(false)}
              disabled={isSaving || isPublishing || isLoading || !formData}
            >
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
            <div className="text-gray-500">Loading new hire plan...</div>
          </div>
        ) : (
          <NewHirePlanForm
            onFormDataChange={setFormData}
            initialData={initialData}
          />
        )}
      </div>
    </>
  );
}
