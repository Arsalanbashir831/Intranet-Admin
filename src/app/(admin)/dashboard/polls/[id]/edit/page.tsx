"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PollForm, type PollFormData } from "@/components/polls/poll-form";
import { usePoll, useUpdatePoll } from "@/hooks/queries/use-polls";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";

export default function EditPollPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string;
  
  const { data: poll, isLoading, error } = usePoll(pollId);
  const updatePoll = useUpdatePoll(pollId);
  
  const [formData, setFormData] = React.useState<PollFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  // Convert poll data to form data when poll is loaded
  React.useEffect(() => {
    if (poll && !formData) {
      const initialFormData: PollFormData = {
        title: poll.title,
        subtitle: poll.subtitle,
        question: poll.question,
        poll_type: poll.poll_type,
        expires_at: new Date(poll.expires_at),
        options: poll.options.map(opt => ({ option_text: opt.option_text })),
        permitted_branches: poll.permitted_branches.map(String),
        permitted_departments: poll.permitted_departments.map(String),
        permitted_branch_departments: poll.permitted_branch_departments.map(String),
      };
      setFormData(initialFormData);
    }
  }, [poll]);

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
        is_active: !isDraft, // Published if not draft
        options: formData.options.filter(opt => opt.option_text.trim()),
        inherits_parent_permissions: formData.inherits_parent_permissions,
        permitted_branches: formData.permitted_branches?.map(Number) || [],
        permitted_departments: formData.permitted_departments?.map(Number) || [],
        permitted_branch_departments: formData.permitted_branch_departments?.map(Number) || [],
        permitted_employees: formData.permitted_employees?.map(Number) || [],
      };

      await updatePoll.mutateAsync(payload);
      toast.success(`Poll ${isDraft ? "saved as draft" : "published"} successfully`);
      router.push(ROUTES.ADMIN.POLLS_ID(pollId));
    } catch (error) {
      console.error("Error updating poll:", error);
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

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit Poll" crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Polls", href: ROUTES.ADMIN.POLLS },
          { label: "Loading...", href: "#" }
        ]} />
        <div className="px-4 md:px-12 py-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading poll details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !poll) {
    return (
      <>
        <PageHeader title="Edit Poll" crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Polls", href: ROUTES.ADMIN.POLLS },
          { label: "Error", href: "#" }
        ]} />
        <div className="px-4 md:px-12 py-4">
          <div className="text-center py-8 text-red-600">
            <p>Error loading poll: {error?.message || "Poll not found"}</p>
            <Link href={ROUTES.ADMIN.POLLS}>
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Polls
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title={`Edit Poll: ${poll.title}`}
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Polls", href: ROUTES.ADMIN.POLLS },
          { label: poll.title, href: ROUTES.ADMIN.POLLS_ID(pollId) },
          { label: "Edit", href: ROUTES.ADMIN.POLLS_ID_EDIT(pollId) }
        ]} 
        action={
          <div className="flex gap-2">
            <Link href={ROUTES.ADMIN.POLLS_ID(pollId)}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Poll
              </Button>
            </Link>
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
        <PollForm 
          initialData={formData}
          onFormDataChange={setFormData} 
        />
      </div>
    </>
  );
}
