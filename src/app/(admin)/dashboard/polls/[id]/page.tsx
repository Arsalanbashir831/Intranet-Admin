"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PollDetailView } from "@/components/polls/poll-detail-view";
import { usePoll } from "@/hooks/queries/use-polls";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.id as string;
  
  const { data: poll, isLoading, error } = usePoll(pollId);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Poll Details" crumbs={[
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
        <PageHeader title="Poll Details" crumbs={[
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
        title={poll.title}
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Polls", href: ROUTES.ADMIN.POLLS },
          { label: poll.title, href: ROUTES.ADMIN.POLLS_ID(pollId) }
        ]}
        action={
          <Link href={ROUTES.ADMIN.POLLS}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Polls
            </Button>
          </Link>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <PollDetailView poll={poll} />
      </div>
    </>
  );
}
