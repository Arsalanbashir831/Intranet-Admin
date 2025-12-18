"use client";

import * as React from "react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { NewHirePlanForm } from "@/components/new-hire/new-hire-plan-form";
import { type NewHirePlanFormData } from "@/types/new-hire";
import {
  useCreateChecklist,
  useCreateAttachment,
  useCreateAttachmentFile,
} from "@/hooks/queries/use-new-hire";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewHirePlanCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<NewHirePlanFormData | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false); // For draft saving
  const [isPublishing, setIsPublishing] = React.useState(false); // For publishing

  const createChecklist = useCreateChecklist();
  const createAttachment = useCreateAttachment();
  const createAttachmentFile = useCreateAttachmentFile();

  const handleSave = async (isDraft: boolean) => {
    if (!formData) {
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
      // Step 1: Create checklist
      const checklist = await createChecklist.mutateAsync({
        assigned_to: formData.assignees.map(Number),
        assigned_by: null,
        status: isDraft ? "draft" : "publish",
      });

      // Step 2: Create attachments
      const allItems = [...formData.trainingItems];

      if (allItems.length > 0) {
        const createPromises = allItems.map(async (item) => {
          // Create attachment
          const attachment = await createAttachment.mutateAsync({
            checklist: checklist.id,
            title: item.title,
            detail: item.body,
            type: item.type,
            deadline: item.deadline || null,
          });

          // Upload files for attachment
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
      console.error("Failed to create new hire plan:", error);

      // Extract error message from API response
      let errorMessage = "Failed to create new hire plan. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response?: { data?: unknown } };
        const errorData = apiError.response?.data;

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
          { label: "New" },
        ]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-primary"
              onClick={() => handleSave(true)}
              disabled={isSaving || isPublishing || !formData}>
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
              disabled={isSaving || isPublishing || !formData}
              className="bg-[#D64575] hover:bg-[#B53A63]">
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
        <NewHirePlanForm onFormDataChange={setFormData} />
      </div>
    </>
  );
}
