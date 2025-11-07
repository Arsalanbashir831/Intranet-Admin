"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PollForm, type PollFormData } from "@/components/polls/poll-form";
import { useCreatePoll } from "@/hooks/queries/use-polls";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewPollPage() {
  const router = useRouter();
  const createPoll = useCreatePoll();
  const [formData, setFormData] = React.useState<PollFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handleSave = async (isDraft: boolean) => {
    if (!formData) {
      toast.error("No form data available");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.question.trim()) {
      toast.error("Question is required");
      return;
    }

    if (formData.options.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }

    // Set the appropriate loading state
    if (isDraft) {
      setIsSaving(true);
    } else {
      setIsPublishing(true);
    }

    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || "",
        question: formData.question.trim(),
        poll_type: formData.poll_type,
        expires_at: formData.expires_at.toISOString(),
        options: formData.options.filter((opt: { option_text: string }) => opt.option_text.trim()),
        permitted_branches: formData.permitted_branches?.map(Number) || [],
        permitted_departments: formData.permitted_departments?.map(Number) || [],
      };

      await createPoll.mutateAsync(payload);
      toast.success(`Poll ${isDraft ? "saved as draft" : "published"} successfully`);
      router.push(ROUTES.ADMIN.POLLS);
    } catch (error) {
      console.error("Error saving poll:", error);
      toast.error(`Failed to ${isDraft ? "save draft" : "publish"} poll`);
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
        title="Create Poll" 
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, 
          { label: "Polls", href: ROUTES.ADMIN.POLLS }, 
          { label: "Create Poll", href: ROUTES.ADMIN.POLLS_NEW }
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
        <PollForm onFormDataChange={setFormData} />
      </div>
    </>
  );
}
