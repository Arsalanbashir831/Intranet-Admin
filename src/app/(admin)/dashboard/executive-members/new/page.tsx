"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ExecutiveMemberForm } from "@/components/executive-members/executive-member-form";
import { Loader2 } from "lucide-react";

export default function NewExecutiveMemberPage() {
  let submitFn: (() => void) | null = null;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = () => {
    setIsSubmitting(true);
    submitFn?.();
  };

  return (
    <>
      <PageHeader
        title="Add Executive Member"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
          { label: "Executive Member", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS },
          { label: "Add Executive Member", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS_NEW }
        ]}
        action={
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> <span>Saving...</span></> : "Save"}
            </Button>
          </div>
        }
      />
      <div className="px-4 md:px-12 py-4">
        <ExecutiveMemberForm onRegisterSubmit={(fn) => { submitFn = fn; }} />
      </div>
    </>
  );
}
