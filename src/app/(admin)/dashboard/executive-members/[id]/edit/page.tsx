"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ExecutiveMemberForm, type ExecutiveMemberInitialValues } from "@/components/executive-members/executive-member-form";
import { useParams } from "next/navigation";
import { useExecutive } from "@/hooks/queries/use-executive-members";

export default function EditExecutiveMemberPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: executiveMember, isLoading, isError } = useExecutive(String(id));

  const initialValues: ExecutiveMemberInitialValues | undefined = executiveMember
    ? {
        name: executiveMember.name || "",
        address: executiveMember.address || "",
        city: executiveMember.city || "",
        phone: executiveMember.phone || "",
        email: executiveMember.email || "",
        role: executiveMember.role || "",
        profileImageUrl: executiveMember.profile_picture || undefined,
        education: executiveMember.education || "",
      }
    : undefined;

  let submitFn: (() => void) | null = null;

  return (
    <>
      <PageHeader
        title="Edit Executive Member"
        crumbs={[
          { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, 
          { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART },
          { label: "Executive Members", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS },
          { label: executiveMember?.name || "Executive Member", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS_ID(String(id)) },
          { label: "Edit", href: ROUTES.ADMIN.EXECUTIVE_MEMBERS_ID_EDIT(String(id)) }
        ]}
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => submitFn?.()}
              className="bg-[#D64575] hover:bg-[#D64575]/90 text-white"
            >
              Save
            </Button>
          </div>
        }
      />
      <div className="px-4 md:px-12 py-4">
        {isLoading && <div>Loading executive member...</div>}
        {isError && <div>Failed to load executive member.</div>}
        {initialValues && (
          <ExecutiveMemberForm
            initialValues={initialValues}
            isEdit
            executiveId={String(id)}
            onRegisterSubmit={(fn) => { submitFn = fn; }}
          />
        )}
      </div>
    </>
  );
}
