"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ExecutiveMemberForm } from "@/components/executive-members/executive-member-form";

export default function NewExecutiveMemberPage() {
  let submitFn: (() => void) | null = null;

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
              onClick={() => submitFn?.()}
            >
              Save
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
